-- Run this ONLY if you already have a live database from an earlier version
-- of this project (i.e. the `services` table already exists). On a brand-new
-- database you don't need this file — `npm run dev` creates everything from
-- the models automatically (and `migrateFeatureColumns.js` also runs this
-- automatically on every server start, so this file is just documentation /
-- a manual fallback).

USE ardhnarishwar;

-- Service Demo / Login-Gated Access feature:
-- who must sign in before the "Access This Service" button actually launches
-- the platform. The public demo page (description, features, benefits,
-- preview dashboard) is always visible regardless of this value.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS accessType ENUM('organization','candidate','public','admin')
    NOT NULL DEFAULT 'organization' AFTER externalUrl;

-- Whether the simulated product-preview dashboard section shows on the
-- public demo page.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS demoEnabled TINYINT(1) NOT NULL DEFAULT 1 AFTER accessType;