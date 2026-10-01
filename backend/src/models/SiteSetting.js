const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Single-row table (id is always 1) holding site-wide, admin-editable settings:
// links out to the separately-hosted Job Portal / Smart Attendance / HRMS
// products, plus contact info and social links used across the public site.
const SiteSetting = sequelize.define('SiteSetting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },

  // External product platforms (built & hosted separately, linked from here)
  jobPortalUrl: { type: DataTypes.STRING(500), allowNull: true },
  attendanceUrl: { type: DataTypes.STRING(500), allowNull: true },
  hrmsUrl: { type: DataTypes.STRING(500), allowNull: true },

  // Contact info
  contactEmail: { type: DataTypes.STRING(255), allowNull: true },
  contactPhone: { type: DataTypes.STRING(255), allowNull: true },
  officeAddress: { type: DataTypes.STRING(500), allowNull: true },

  // Social links
  linkedinUrl: { type: DataTypes.STRING(500), allowNull: true },
  twitterUrl: { type: DataTypes.STRING(500), allowNull: true },
  facebookUrl: { type: DataTypes.STRING(500), allowNull: true },
  instagramUrl: { type: DataTypes.STRING(500), allowNull: true },
  youtubeUrl: { type: DataTypes.STRING(500), allowNull: true },
}, {
  tableName: 'site_settings',
  timestamps: true,
});

module.exports = SiteSetting;