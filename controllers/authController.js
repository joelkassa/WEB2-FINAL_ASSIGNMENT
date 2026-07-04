const { User, RefreshToken } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
} = require('../utils/jwt');

const authController = {
  register: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, phone, role } = req.body;

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered.',
        });
      }

      const passwordHash = await hashPassword(password);

      const user = await User.create({
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role,
      });

      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({ id: user.id });
      await storeRefreshToken(user.id, refreshToken);

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account has been deactivated.',
        });
      }

      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({ id: user.id });
      await storeRefreshToken(user.id, refreshToken);

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required.',
        });
      }

      const decoded = verifyRefreshToken(refreshToken);

      const stored = await RefreshToken.findOne({ where: { token: refreshToken } });
      if (!stored) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token.',
        });
      }

      if (new Date() > stored.expiresAt) {
        await stored.destroy();
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired. Please login again.',
        });
      }

      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or deactivated.',
        });
      }

      await revokeRefreshToken(refreshToken);

      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = generateRefreshToken({ id: user.id });
      await storeRefreshToken(user.id, newRefreshToken);

      res.json({
        success: true,
        message: 'Token refreshed.',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token.',
        });
      }
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await revokeRefreshToken(refreshToken);
      }
      res.json({
        success: true,
        message: 'Logout successful.',
      });
    } catch (error) {
      next(error);
    }
  },

  me: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['passwordHash'] },
      });
      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;