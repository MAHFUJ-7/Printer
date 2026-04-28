const { EventEmitter } = require("events");
const logger = require("../utils/logger");

const jobEvents = new EventEmitter();

jobEvents.on("job.submitted", (payload) => {
  logger.info({ event: "job.submitted", ...payload });
});

jobEvents.on("job.status.updated", (payload) => {
  logger.info({ event: "job.status.updated", ...payload });
});

module.exports = jobEvents;
