const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const user = await authService.register(req.validated.body);
    return res.status(201).json({ status: "success", data: user });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const tokens = await authService.login(req.validated.body);
    return res.status(200).json({ status: "success", data: tokens });
  } catch (error) {
    return next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const tokens = await authService.rotateRefreshToken(req.validated.body.refreshToken);
    return res.status(200).json({ status: "success", data: tokens });
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.validated.body.refreshToken);
    return res.status(200).json({ status: "success", data: { loggedOut: true } });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
