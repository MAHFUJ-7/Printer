const Redis = require("ioredis");
const env = require("./env");

const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true
});

redis.on("error", (err) => {
  // Redis failures should not crash the API process.
  console.error("Redis error:", err.message);
});

module.exports = redis;
