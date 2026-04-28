const jobService = require("../services/job.service");

async function submitJob(req, res, next) {
  try {
    const job = await jobService.submitJob(req.user.sub, req.validated.body);
    return res.status(201).json({ status: "success", data: job });
  } catch (error) {
    return next(error);
  }
}

async function getJobs(req, res, next) {
  try {
    const jobs = await jobService.getMyJobs(req.user.sub);
    return res.status(200).json({ status: "success", data: jobs });
  } catch (error) {
    return next(error);
  }
}

async function getOwnerJobs(req, res, next) {
  try {
    const jobs = await jobService.getOwnerJobs(req.user.sub);
    return res.status(200).json({ status: "success", data: jobs });
  } catch (error) {
    return next(error);
  }
}

async function updateJobStatus(req, res, next) {
  try {
    const result = await jobService.updateJobStatusByOwner(
      req.validated.params.id,
      req.user.sub,
      req.validated.body.status
    );
    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  submitJob,
  getJobs,
  getOwnerJobs,
  updateJobStatus
};
