const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { RefreshToken } = require('../models');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.accessExpiration,
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiration,
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.secret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwt.refreshSecret);
};

const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    userId,
    token,
    expiresAt,
  });
};

const revokeRefreshToken = async (token) => {
  await RefreshToken.destroy({ where: { token } });
};

const revokeAllUserTokens = async (userId) => {
  await RefreshToken.destroy({ where: { userId } });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};