const sequelize = require('../config/database');
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Category = require('./Category');
const Worker = require('./Worker');
const WorkerSkill = require('./WorkerSkill');
const PortfolioItem = require('./PortfolioItem');
const Booking = require('./Booking');
const Review = require('./Review');
const Dispute = require('./Dispute');
const AdminAction = require('./AdminAction');

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

// Booking associations
Booking.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
User.hasMany(Booking, { foreignKey: 'client_id', as: 'clientBookings' });

Booking.belongsTo(Worker, { foreignKey: 'worker_id' });
Worker.hasMany(Booking, { foreignKey: 'worker_id' });

// Review associations
Review.belongsTo(Booking, { foreignKey: 'booking_id' });
Booking.hasOne(Review, { foreignKey: 'booking_id' });

Review.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
User.hasMany(Review, { foreignKey: 'client_id' });

Review.belongsTo(Worker, { foreignKey: 'worker_id' });
Worker.hasMany(Review, { foreignKey: 'worker_id' });

// Dispute associations
Dispute.belongsTo(Booking, { foreignKey: 'booking_id' });
Booking.hasOne(Dispute, { foreignKey: 'booking_id' });

Dispute.belongsTo(User, { foreignKey: 'filed_by', as: 'filer' });
User.hasMany(Dispute, { foreignKey: 'filed_by', as: 'filedDisputes' });

// AdminAction associations
AdminAction.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });
User.hasMany(AdminAction, { foreignKey: 'admin_id' });

module.exports = {
  sequelize,
  User,
  RefreshToken,
  Category,
  Worker,
  WorkerSkill,
  PortfolioItem,
  Booking,
  Review,
  Dispute,
  AdminAction,
};