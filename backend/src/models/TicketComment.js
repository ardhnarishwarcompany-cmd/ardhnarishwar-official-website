const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TicketComment = sequelize.define('TicketComment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  ticketId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  isInternal: { type: DataTypes.BOOLEAN, defaultValue: false },
  authorId: { type: DataTypes.INTEGER, allowNull: true },
  authorName: { type: DataTypes.STRING(150), allowNull: true },
}, {
  tableName: 'crm_ticket_comments',
  timestamps: true,
  indexes: [
    { fields: ['ticketId'] },
    { fields: ['organizationId'] },
  ],
});

module.exports = TicketComment;
