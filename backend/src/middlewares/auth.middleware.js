const { verifyAccessToken } = require("../utils/jwt");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
      code: 401
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
      code: 401
    });
  }
}

module.exports = authenticate;
