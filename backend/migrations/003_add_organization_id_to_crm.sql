-- Add organizationId to all CRM tables (safe to re-run: ignores duplicate column errors)

ALTER TABLE crm_leads ADD COLUMN organizationId INT NULL;
ALTER TABLE crm_contacts ADD COLUMN organizationId INT NULL;
ALTER TABLE crm_companies ADD COLUMN organizationId INT NULL;
ALTER TABLE crm_opportunities ADD COLUMN organizationId INT NULL;
ALTER TABLE crm_activities ADD COLUMN organizationId INT NULL;
ALTER TABLE crm_tasks ADD COLUMN organizationId INT NULL;
ALTER TABLE crm_followups ADD COLUMN organizationId INT NULL;
ALTER TABLE crm_notes ADD COLUMN organizationId INT NULL;
ALTER TABLE crm_tickets ADD COLUMN organizationId INT NULL;
ALTER TABLE crm_ticket_comments ADD COLUMN organizationId INT NULL;

-- Optional indexes (run after columns exist)
CREATE INDEX crm_leads_organization_id ON crm_leads (organizationId);
CREATE INDEX crm_contacts_organization_id ON crm_contacts (organizationId);
CREATE INDEX crm_companies_organization_id ON crm_companies (organizationId);
CREATE INDEX crm_opportunities_organization_id ON crm_opportunities (organizationId);
CREATE INDEX crm_activities_organization_id ON crm_activities (organizationId);
CREATE INDEX crm_tasks_organization_id ON crm_tasks (organizationId);
CREATE INDEX crm_followups_organization_id ON crm_followups (organizationId);
CREATE INDEX crm_notes_organization_id ON crm_notes (organizationId);
CREATE INDEX crm_tickets_organization_id ON crm_tickets (organizationId);
CREATE INDEX crm_ticket_comments_organization_id ON crm_ticket_comments (organizationId);
