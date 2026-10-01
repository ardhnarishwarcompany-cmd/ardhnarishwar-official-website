const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TeamMember = sequelize.define('TeamMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: true }, // e.g. "Founder & CEO"
  bio: { type: DataTypes.TEXT, allowNull: true },
  photoUrl: { type: DataTypes.STRING, allowNull: true },
  linkedinUrl: { type: DataTypes.STRING, allowNull: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'team_members',
  timestamps: true,
});

module.exports = TeamMember;
