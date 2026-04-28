const net = require("net");
const { spawn } = require("child_process");
const path = require("path");

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || "127.0.0.1";

function checkPortInUse(targetHost, targetPort) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(1000);

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.once("error", (error) => {
      if (error.code === "ECONNREFUSED" || error.code === "EHOSTUNREACH") {
        resolve(false);
        return;
      }
      resolve(true);
    });

    socket.connect(targetPort, targetHost);
  });
}

async function run() {
  const inUse = await checkPortInUse(host, port);

  if (inUse) {
    console.log(`[dev-guard] Port ${port} is already in use. Skipping duplicate backend startup.`);
    console.log("[dev-guard] If you intentionally need another instance, run: npm run dev:force");
    process.exit(0);
    return;
  }

  const nodemonBin = process.platform === "win32"
    ? path.join(process.cwd(), "node_modules", ".bin", "nodemon.cmd")
    : path.join(process.cwd(), "node_modules", ".bin", "nodemon");

  const child = spawn(nodemonBin, ["src/server.js"], {
    stdio: "inherit",
    shell: false,
    env: process.env
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });

  child.on("error", (error) => {
    console.error("[dev-guard] Failed to start nodemon:", error.message);
    process.exit(1);
  });
}

run();
