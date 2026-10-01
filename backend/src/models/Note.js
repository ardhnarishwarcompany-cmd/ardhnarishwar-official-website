const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Note = sequelize.define('Note', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  leadId: { type: DataTypes.INTEGER, allowNull: true },
  contactId: { type: DataTypes.INTEGER, allowNull: true },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  opportunityId: { type: DataTypes.INTEGER, allowNull: true },
  ticketId: { type: DataTypes.INTEGER, allowNull: true },
  authorId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'crm_notes',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['leadId'] },
    { fields: ['contactId'] },
    { fields: ['companyId'] },
    { fields: ['opportunityId'] },
  ],
});

module.exports = Note;
