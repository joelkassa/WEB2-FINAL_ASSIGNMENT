const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkerSkill = sequelize.define('WorkerSkill', {
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
  skillName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'skill_name',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  certificationUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'certification_url',
  },
}, {
  tableName: 'worker_skills',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = WorkerSkill;