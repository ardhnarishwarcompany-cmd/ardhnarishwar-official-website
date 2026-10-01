const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Client testimonials / logos shown on the site
const Testimonial = sequelize.define('Testimonial', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clientName: { type: DataTypes.STRING, allowNull: false }, // person's name
  role: { type: DataTypes.STRING, allowNull: true }, // e.g. "HR Director"
  companyName: { type: DataTypes.STRING, allowNull: true },
  quote: { type: DataTypes.TEXT, allowNull: false },
  logoUrl: { type: DataTypes.STRING, allowNull: true }, // company logo
  avatarUrl: { type: DataTypes.STRING, allowNull: true }, // person's photo
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'testimonials',
  timestamps: true,
});

module.exports = Testimonial;
