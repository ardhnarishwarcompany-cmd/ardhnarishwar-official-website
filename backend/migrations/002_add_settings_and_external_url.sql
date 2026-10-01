-- Run this ONLY if you already have a live database from an earlier version
-- of this project (i.e. `services` / `contact_submissions` tables already
-- exist). On a brand-new database you don't need this file — `npm run dev`
-- creates everything from the models automatically, including this.

USE ardhnarishwar;

-- 1. Let a service (Job Portal, Smart Attendance, HRMS, etc.) link out to a
--    separately-hosted, live product.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS externalUrl VARCHAR(500) NULL AFTER imageUrl;

-- 2. Widen submission statuses so support/inquiry tracking has a middle
--    ground between "new" and "closed".
ALTER TABLE contact_submissions
  MODIFY COLUMN status ENUM('new', 'contacted', 'in_progress', 'resolved', 'closed') DEFAULT 'new';

-- 3. Site-wide settings: platform links, contact info, social links.
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  jobPortalUrl VARCHAR(500),
  attendanceUrl VARCHAR(500),
  hrmsUrl VARCHAR(500),
  contactEmail VARCHAR(255),
  contactPhone VARCHAR(255),
  officeAddress VARCHAR(500),
  linkedinUrl VARCHAR(500),
  twitterUrl VARCHAR(500),
  facebookUrl VARCHAR(500),
  instagramUrl VARCHAR(500),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
