const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminAction = sequelize.define('AdminAction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'admin_id',
    references: { model: 'users', key: 'id' },
  },
  actionType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'action_type',
  },
  targetType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'target_type',
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'target_id',
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  tableName: 'admin_actions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AdminAction;
