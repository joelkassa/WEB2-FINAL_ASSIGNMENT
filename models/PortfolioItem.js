const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PortfolioItem = sequelize.define('PortfolioItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  workerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'worker_id',
    references: { model: 'workers', key: 'id' },
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_url',
  },
  caption: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'portfolio_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = PortfolioItem;