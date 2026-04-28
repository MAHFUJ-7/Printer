const prisma = require("../config/prisma");
const redis = require("../config/redis");
const userRepository = require("../repositories/user.repository");
const { hashPassword, verifyPassword } = require("../utils/password");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require("../utils/jwt");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

const refreshKey = (userId, jti) => `refresh:${userId}:${jti}`;

async function register(payload) {
  const { email, username, password, firstName, lastName, role } = payload;
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = String(username).trim();

  if (role === "ADMIN") {
    throw new ApiError(403, "Admin accounts cannot be created via register endpoint");
  }

  const existingByEmail = await userRepository.findByEmail(normalizedEmail);
  if (existingByEmail) {
    throw new ApiError(409, "Email already in use");
  }

  const existingByUsername = await userRepository.findByUsername(normalizedUsername);
  if (existingByUsername) {
    throw new ApiError(409, "Username already in use");
  }

  const hashedPassword = await hashPassword(password);
  const user = await userRepository.createUser({
    email: normalizedEmail,
    username: normalizedUsername,
    password: hashedPassword,
    firstName: firstName ? String(firstName).trim() : null,
    lastName: lastName ? String(lastName).trim() : null,
    role: role || "STUDENT"
  });

  const basePayload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = generateAccessToken(basePayload);
  const refresh = generateRefreshToken(basePayload);

  try {
    await redis.setex(refreshKey(user.id, refresh.jti), 60 * 60 * 24 * 7, "1");
  } catch (error) {
    logger.warn({ message: "Redis unavailable while persisting refresh token", error: error.message });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      credits: Number(user.balance)
    },
    accessToken,
    refreshToken: refresh.token
  };
}

async function login(payload) {
  const { email, password } = payload;
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValidPassword = await verifyPassword(user.password, password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const basePayload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = generateAccessToken(basePayload);
  const refresh = generateRefreshToken(basePayload);

  try {
    await redis.setex(refreshKey(user.id, refresh.jti), 60 * 60 * 24 * 7, "1");
  } catch (error) {
    logger.warn({ message: "Redis unavailable while persisting refresh token", error: error.message });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      credits: Number(user.balance)
    },
    accessToken,
    refreshToken: refresh.token
  };
}

async function rotateRefreshToken(token) {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const key = refreshKey(decoded.sub, decoded.jti);
  let exists = null;
  try {
    exists = await redis.get(key);
  } catch (error) {
    logger.warn({ message: "Redis unavailable during refresh token verification", error: error.message });
  }

  if (!exists) {
    throw new ApiError(401, "Refresh token revoked or expired");
  }

  try {
    await redis.del(key);
  } catch (error) {
    logger.warn({ message: "Redis unavailable during refresh token deletion", error: error.message });
  }

  const basePayload = {
    sub: decoded.sub,
    role: decoded.role,
    email: decoded.email
  };

  const accessToken = generateAccessToken(basePayload);
  const refresh = generateRefreshToken(basePayload);
  try {
    await redis.setex(refreshKey(decoded.sub, refresh.jti), 60 * 60 * 24 * 7, "1");
  } catch (error) {
    logger.warn({ message: "Redis unavailable while rotating refresh token", error: error.message });
  }

  return {
    accessToken,
    refreshToken: refresh.token
  };
}

async function logout(token) {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    return;
  }

  try {
    await redis.del(refreshKey(decoded.sub, decoded.jti));
  } catch (error) {
    logger.warn({ message: "Redis unavailable during logout token revocation", error: error.message });
  }
}

async function promoteUserToAdmin(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" }
  });
}

module.exports = {
  register,
  login,
  rotateRefreshToken,
  logout,
  promoteUserToAdmin
};
