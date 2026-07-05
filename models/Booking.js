const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'client_id',
    references: { model: 'users', key: 'id' },
  },
  workerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'worker_id',
    references: { model: 'workers', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'completed', 'cancelled', 'disputed'),
    defaultValue: 'pending',
  },
  requestedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'requested_date',
  },
  requestedTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'requested_time',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'total_amount',
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason',
  },
  cancelledBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'cancelled_by',
    references: { model: 'users', key: 'id' },
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Booking;
