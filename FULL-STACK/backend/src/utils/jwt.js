const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const env = require("../config/env");

function generateAccessToken(payload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  });
}

function generateRefreshToken(payload) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ ...payload, jti }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });
  return { token, jti };
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
