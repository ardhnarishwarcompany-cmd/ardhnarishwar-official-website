const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const JobOpening = sequelize.define('JobOpening', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  department: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  employmentType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship'),
    defaultValue: 'full-time',
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  requirements: { type: DataTypes.JSON, allowNull: true }, // array of strings
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
  postedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'job_openings',
  timestamps: true,
});

module.exports = JobOpening;
