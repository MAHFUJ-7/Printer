const userService = require("../services/user.service");

async function getMe(req, res, next) {
  try {
    const profile = await userService.getMyProfile(req.user.sub);
    return res.status(200).json({ status: "success", data: profile });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await userService.updateProfile(req.user.sub, req.body);
    return res.status(200).json({ status: "success", data: profile });
  } catch (error) {
    return next(error);
  }
}

async function upgradeToPrinterOwner(req, res, next) {
  try {
    const user = await userService.upgradeToPrinterOwner(req.user.sub);
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    return next(error);
  }
}

async function getTransactions(req, res, next) {
  try {
    const query = req.validated.query;
    const result = await userService.getMyTransactions(
      req.user.sub,
      query.cursor,
      query.limit || 20
    );

    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMe,
  updateProfile,
  upgradeToPrinterOwner,
  getTransactions
};
