-- Run this ONLY if you already have a live database from an earlier version
-- of this project (i.e. the `services` table already has an `accessType`
-- column without 'both'). On a fresh database, or one where the server has
-- already been restarted once after this update, you don't need this file --
-- `migrateFeatureColumns.js` widens the ENUM automatically on every server
-- start (it's called from server.js), so this is just documentation / a
-- manual fallback.

USE ardhnarishwar;

-- Adds a 'both' value so a service can be gated behind EITHER an
-- organization (client portal) login OR a candidate (job-seeker) login,
-- instead of only one of the two.
ALTER TABLE services
  MODIFY COLUMN accessType ENUM('organization','candidate','both','public','admin')
    NOT NULL DEFAULT 'organization';