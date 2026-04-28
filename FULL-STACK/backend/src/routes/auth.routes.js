const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema
} = require("../schemas/auth.schema");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", validate(refreshTokenSchema), authController.logout);

module.exports = router;
