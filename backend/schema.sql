-- Reference schema for the Ardhnarishwar company website database.
-- You don't need to run this by hand: `npm run dev` (via Sequelize sync)
-- creates these tables automatically. This file is here so you can see
-- the structure at a glance, or run it manually if you prefer.

CREATE DATABASE IF NOT EXISTS ardhnarishwar
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ardhnarishwar;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(255),
  shortDescription VARCHAR(500),
  description TEXT,
  features JSON,
  iconName VARCHAR(255),
  imageUrl VARCHAR(255),
  externalUrl VARCHAR(500),
  -- Who must sign in to actually launch this service (the public demo page
  -- itself is always visible regardless of this value). See migration 004.
  accessType ENUM('organization','candidate','public','admin') NOT NULL DEFAULT 'organization',
  -- Whether the simulated product-preview dashboard shows on the demo page.
  demoEnabled TINYINT(1) NOT NULL DEFAULT 1,
  sortOrder INT DEFAULT 0,
  isPublished BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt VARCHAR(500),
  content LONGTEXT NOT NULL,
  coverImageUrl VARCHAR(255),
  author VARCHAR(255),
  isPublished BOOLEAN DEFAULT FALSE,
  publishedAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  originalName VARCHAR(255),
  mimeType VARCHAR(255),
  sizeBytes INT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  company VARCHAR(255),
  message TEXT NOT NULL,
  interestedIn VARCHAR(255),
  status ENUM('new', 'contacted', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clientName VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  companyName VARCHAR(255),
  quote TEXT NOT NULL,
  logoUrl VARCHAR(255),
  avatarUrl VARCHAR(255),
  sortOrder INT DEFAULT 0,
  isPublished BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

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