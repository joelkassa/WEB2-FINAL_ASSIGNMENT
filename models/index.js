const sequelize = require('../config/database');
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Category = require('./Category');
const Worker = require('./Worker');
const WorkerSkill = require('./WorkerSkill');
const PortfolioItem = require('./PortfolioItem');

// User associations
User.hasMany(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Worker, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Worker.belongsTo(User, { foreignKey: 'user_id' });

// Worker associations
Worker.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Worker, { foreignKey: 'category_id' });

Worker.hasMany(WorkerSkill, { foreignKey: 'worker_id', onDelete: 'CASCADE' });
WorkerSkill.belongsTo(Worker, { foreignKey: 'worker_id' });

Worker.hasMany(PortfolioItem, { foreignKey: 'worker_id', onDelete: 'CASCADE' });
PortfolioItem.belongsTo(Worker, { foreignKey: 'worker_id' });

module.exports = {
  sequelize,
  User,
  RefreshToken,
  Category,
  Worker,
  WorkerSkill,
  PortfolioItem,
};