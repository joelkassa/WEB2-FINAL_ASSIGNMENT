const sequelize = require('../config/database');
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Category = require('./Category');

// Associations
User.hasMany(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  RefreshToken,
  Category,
};