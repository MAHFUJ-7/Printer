const express = require("express");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./users.routes");
const printersRoutes = require("./printers.routes");
const jobsRoutes = require("./jobs.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/printers", printersRoutes);
router.use("/jobs", jobsRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
