const express = require("express");
const userController = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { cursorPaginationSchema } = require("../schemas/common.schema");

const router = express.Router();

router.use(authenticate);
router.get("/me", userController.getMe);
router.patch("/profile", userController.updateProfile);
router.post("/upgrade-to-owner", userController.upgradeToPrinterOwner);
router.get("/transactions", validate(cursorPaginationSchema), userController.getTransactions);

module.exports = router;
