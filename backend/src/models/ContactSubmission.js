const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ContactSubmission = sequelize.define('ContactSubmission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  company: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  interestedIn: { type: DataTypes.STRING, allowNull: true }, // e.g. which service they asked about
  status: { type: DataTypes.ENUM('new', 'contacted', 'in_progress', 'resolved', 'closed'), defaultValue: 'new' },
}, {
  tableName: 'contact_submissions',
  timestamps: true,
});

module.exports = ContactSubmission;
