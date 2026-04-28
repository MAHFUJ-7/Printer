const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middlewares/error.middleware");
const logger = require("./utils/logger");

const app = express();

app.use(helmet());
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = env.corsOrigin.split(",").map((item) => item.trim());
    const allowAll = allowedOrigins.includes("*");
    if (
      allowAll ||
      !origin ||
      origin === "null" ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "error",
      message: "Too many requests",
      code: 429
    }
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "success", data: { uptime: process.uptime() } });
});

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
