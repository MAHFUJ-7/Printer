const express = require("express");
const jobController = require("../controllers/job.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  submitJobSchema,
  updateJobStatusSchema
} = require("../schemas/job.schema");

const router = express.Router();

router.use(authenticate);
router.post("/", authorize("STUDENT"), validate(submitJobSchema), jobController.submitJob);
router.get("/", jobController.getJobs);
router.get("/owner", authorize("PRINTER_OWNER"), jobController.getOwnerJobs);
router.patch(
  "/:id/status",
  authorize("PRINTER_OWNER"),
  validate(updateJobStatusSchema),
  jobController.updateJobStatus
);

module.exports = router;
