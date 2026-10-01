const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FaqItem = sequelize.define('FaqItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  question: { type: DataTypes.STRING, allowNull: false },
  answer: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true }, // e.g. "Pricing", "Onboarding"
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'faq_items',
  timestamps: true,
});

module.exports = FaqItem;
