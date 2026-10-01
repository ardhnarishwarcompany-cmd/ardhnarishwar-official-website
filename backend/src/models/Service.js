const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Represents one service/module shown on the site, e.g. "HRMS", "Job Portal", "AI Recruitment"
const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  category: { type: DataTypes.STRING, allowNull: true }, // e.g. "HR & Workforce", "AI", "Automation"
  shortDescription: { type: DataTypes.STRING(500), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true }, // long-form HTML/markdown body
  features: { type: DataTypes.JSON, allowNull: true }, // array of strings, e.g. ["Face Recognition", "GPS Attendance"]
  // Plain-language "what powers this" summary — what the module actually
  // does end-to-end and, where it's a separately-built product, what stack
  // runs it (e.g. "Backend: Python Flask, DB: MongoDB"). Shown on the
  // solution's detail page under "Tools & Technology".
  techSummary: { type: DataTypes.TEXT, allowNull: true },
  // Short chip list of the specific tools/technology behind this module,
  // e.g. ["Backend: Flask", "Database: MongoDB", "GPS Validation"].
  techStack: { type: DataTypes.JSON, allowNull: true },
  iconName: { type: DataTypes.STRING, allowNull: true }, // icon identifier for the frontend
  imageUrl: { type: DataTypes.STRING, allowNull: true }, // thumbnail shown on the Solutions grid card
  heroImageUrl: { type: DataTypes.STRING, allowNull: true }, // banner image on this solution's own page
  ctaImageUrl: { type: DataTypes.STRING, allowNull: true }, // image in the bottom "Ready to use" section
  // For modules that are separately-built, live products (Job Portal, Smart
  // Attendance, HRMS, etc.) — when set, the site shows a "Launch Platform"
  // button that opens this URL in a new tab instead of/alongside the
  // description-only page.
  externalUrl: { type: DataTypes.STRING(500), allowNull: true },
  // When this solution's real product (HRMS, Smart Attendance, etc.) exposes
  // its own "dashboard summary" API, put that endpoint here. The public demo
  // page will then call it (through our backend, server-side) and show real
  // numbers in the preview instead of the hardcoded demo stats/chart. Leave
  // blank to keep showing demo data — nothing breaks either way.
  // Expected JSON response shape from that endpoint:
  //   {
  //     "stats": [{ "label": "Total Employees", "value": 248 }, ...],
  //     "chart": { "title": "Workforce Overview", "type": "bar",
  //                "data": [{ "name": "Engineering", "value": 84 }, ...] }
  //   }
  liveStatsUrl: { type: DataTypes.STRING(500), allowNull: true },
  // Optional secret sent as `Authorization: Bearer <key>` when calling
  // liveStatsUrl, if that product's API requires auth. Only ever used
  // server-side — never returned by the public services API.
  liveStatsApiKey: { type: DataTypes.STRING(255), allowNull: true },
  // Who must be signed in to actually launch/use this service (the public
  // demo page itself is always visible to everyone regardless of this value).
  //   organization -> gated behind /portal/login (client/org users)
  //   candidate    -> gated behind /candidate/login (job seekers)
  //   both         -> gated, but accepts either an organization OR a candidate login
  //   public       -> no login required to launch
  //   admin        -> gated behind /admin/login (internal tools)
  accessType: {
    type: DataTypes.ENUM('organization', 'candidate', 'both', 'public', 'admin'),
    allowNull: false,
    defaultValue: 'organization',
  },
  // Whether the interactive product-preview/dashboard mockup shows on the
  // public service demo page. When false, the page still shows the
  // description/features/benefits, just not the simulated dashboard.
  demoEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'services',
  timestamps: true,
});

module.exports = Service;