const Company = require('./Company');
const Contact = require('./Contact');
const Lead = require('./Lead');
const Opportunity = require('./Opportunity');
const Activity = require('./Activity');
const Task = require('./Task');
const FollowUp = require('./FollowUp');
const Note = require('./Note');
const Ticket = require('./Ticket');
const TicketComment = require('./TicketComment');

// Company relations
Company.hasMany(Contact, { foreignKey: 'companyId', as: 'contacts' });
Contact.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(Lead, { foreignKey: 'companyId', as: 'leads' });
Lead.belongsTo(Company, { foreignKey: 'companyId', as: 'companyRef' });

Company.hasMany(Opportunity, { foreignKey: 'companyId', as: 'opportunities' });
Opportunity.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(Activity, { foreignKey: 'companyId', as: 'activities' });
Company.hasMany(Task, { foreignKey: 'companyId', as: 'tasks' });
Company.hasMany(Note, { foreignKey: 'companyId', as: 'linkedNotes' });
Company.hasMany(Ticket, { foreignKey: 'companyId', as: 'tickets' });

// Contact relations
Contact.hasMany(Opportunity, { foreignKey: 'contactId', as: 'opportunities' });
Opportunity.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });

Contact.hasMany(Activity, { foreignKey: 'contactId', as: 'activities' });
Contact.hasMany(Task, { foreignKey: 'contactId', as: 'tasks' });
Contact.hasMany(Note, { foreignKey: 'contactId', as: 'linkedNotes' });
Contact.hasMany(Ticket, { foreignKey: 'contactId', as: 'tickets' });

// Lead relations
Lead.hasMany(Opportunity, { foreignKey: 'leadId', as: 'opportunities' });
Opportunity.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

Lead.hasMany(Activity, { foreignKey: 'leadId', as: 'activities' });
Lead.hasMany(Task, { foreignKey: 'leadId', as: 'tasks' });
Lead.hasMany(FollowUp, { foreignKey: 'leadId', as: 'followUps' });
Lead.hasMany(Note, { foreignKey: 'leadId', as: 'linkedNotes' });

// Opportunity relations
Opportunity.hasMany(Activity, { foreignKey: 'opportunityId', as: 'activities' });
Opportunity.hasMany(Task, { foreignKey: 'opportunityId', as: 'tasks' });
Opportunity.hasMany(Note, { foreignKey: 'opportunityId', as: 'linkedNotes' });
Opportunity.hasMany(FollowUp, { foreignKey: 'opportunityId', as: 'followUps' });

// Ticket relations
Ticket.hasMany(TicketComment, { foreignKey: 'ticketId', as: 'comments' });
TicketComment.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });
Ticket.hasMany(Note, { foreignKey: 'ticketId', as: 'notes' });

module.exports = {
  Company,
  Contact,
  Lead,
  Opportunity,
  Activity,
  Task,
  FollowUp,
  Note,
  Ticket,
  TicketComment,
};
