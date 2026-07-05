const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dispute = sequelize.define('Dispute', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'booking_id',
    references: { model: 'bookings', key: 'id' },
  },
  filedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'filed_by',
    references: { model: 'users', key: 'id' },
  },
  reason: {
    type: DataTypes.ENUM('no_show', 'poor_quality', 'payment_issue', 'safety_concern', 'other'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'under_review', 'resolved', 'rejected'),
    defaultValue: 'open',
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_notes',
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at',
  },
}, {
  tableName: 'disputes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Dispute;
