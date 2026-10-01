const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Tracks every uploaded file so the admin panel can show a media library
const Media = sequelize.define('Media', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  filename: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  originalName: { type: DataTypes.STRING, allowNull: true },
  mimeType: { type: DataTypes.STRING, allowNull: true },
  sizeBytes: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'media',
  timestamps: true,
});

module.exports = Media;
