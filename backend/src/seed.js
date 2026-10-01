require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const Admin = require('./models/Admin');
const Service = require('./models/Service');
const Testimonial = require('./models/Testimonial');

const services = [
  {
    title: 'HRMS & Workforce Management',
    slug: 'hrms-workforce-management',
    category: 'HR & Workforce',
    shortDescription: 'A complete workforce operating system covering the full employee lifecycle.',
    description: 'Manage employee profiles, onboarding, leave, shifts, payroll inputs, performance and offboarding from one system.',
    features: ['Employee master & digital onboarding', 'Department, designation & org structure', 'Leave & shift management', 'Payroll inputs & salary components', 'Performance, goals & appraisals', 'Asset management', 'Employee self-service portal', 'HR analytics, reports & offboarding'],
    techSummary: 'Runs as its own HRMS product for managing a company\u2019s internal employees and HR operations \u2014 employee records, company/org structure, role-based administration and attendance/HR processes all sit on one centralized employee database, with separate access levels for HR, Admin and Employees.',
    techStack: ['Employee & Company Data Model', 'Role-Based Admin (HR / Admin / Employee)', 'Centralized HR Database', 'Self-Service Portal', 'Integrates with Smart Attendance'],
    sortOrder: 1,
  },
  {
    title: 'Smart Attendance System',
    slug: 'smart-attendance-system',
    category: 'HR & Workforce',
    shortDescription: 'Flexible attendance tracking that adapts to how your teams actually clock in.',
    description: 'Face recognition, biometric devices, QR codes and GPS check-ins, with real-time dashboards and payroll-ready reports.',
    features: ['Face recognition attendance', 'Biometric & QR attendance', 'GPS / geo-location attendance', 'Mobile & web check-in/out', 'Shift-based rules, late & overtime tracking', 'Attendance regularization', 'Real-time dashboard', 'Branch-wise reports & payroll integration'],
    techSummary: 'A digital attendance system that records and manages employee attendance automatically and securely, with separate Company Admin, Super Admin and Employee roles. Attendance is verified through face/biometric recognition, GPS & location checks and Wi-Fi validation, then reflected in real time on the dashboard.',
    techStack: ['Backend: Python (Flask)', 'Database: MongoDB', 'Face & Biometric Verification', 'GPS / Location Validation', 'Wi-Fi Validation', 'Real-Time Attendance Engine'],
    sortOrder: 2,
  },
  {
    title: 'HR Staffing Solutions',
    slug: 'hr-staffing-solutions',
    category: 'Staffing',
    shortDescription: 'Technology-enabled staffing services for permanent, temporary and contract roles.',
    description: 'From executive search to bulk hiring and RPO, backed by candidate sourcing and deployment coordination.',
    features: ['Permanent, temporary & contract staffing', 'Executive search', 'Bulk hiring', 'RPO & HR outsourcing', 'Candidate sourcing & database management', 'Interview coordination & client shortlisting', 'Joining & deployment coordination'],
    techSummary: 'A service layer delivered by our staffing consultants on top of the shared candidate and job database \u2014 the same records that power the Job Portal and AI Recruitment Cloud \u2014 so requirements, pipelines and placements stay in sync across sourcing, interviews and deployment.',
    techStack: ['Shared Candidate & Requirement Database', 'Recruiter Dashboard', 'Pipeline & Placement Tracking', 'Client Shortlisting Workflow'],
    sortOrder: 3,
  },
  {
    title: 'Job Portal',
    slug: 'job-portal',
    category: 'Staffing',
    shortDescription: 'A career platform connecting candidates, recruiters and employers.',
    description: 'Job posting, candidate search and filters, resume upload, application tracking and interview scheduling.',
    features: ['Candidate & employer registration', 'Advanced job search & filters', 'Resume upload & candidate profile', 'Saved jobs & job alerts', 'Application tracking & status updates', 'Interview scheduling', 'Company profiles'],
    techSummary: 'A recruitment platform where companies post jobs and candidates search and apply \u2014 built around job posting, candidate applications, profiles, resumes and the end-to-end hiring workflow, running on the same employer/candidate accounts used across the platform.',
    techStack: ['Job Posting & Management', 'Candidate Profiles & Resume Upload', 'Application Tracking', 'Employer & Candidate Auth'],
    accessType: 'candidate',
    sortOrder: 4,
  },
  {
    title: 'AI Recruitment Cloud',
    slug: 'ai-recruitment-cloud',
    category: 'Artificial Intelligence',
    shortDescription: 'AI-assisted screening and ranking that speeds up every hiring pipeline.',
    description: 'Resume intelligence, candidate ranking, skill gap detection and an AI interview assistant.',
    features: ['Resume intelligence & job description matching', 'AI candidate screening & ranking', 'Skill gap detection', 'AI interview question generation & assistant', 'Structured interview evaluation', 'Automated onboarding workflow'],
    techSummary: 'AI/ML models sit on top of the shared recruitment database to read resumes, match them against job descriptions and rank candidates \u2014 recruiters and clients still make every final call, the AI just removes the manual screening work before that.',
    techStack: ['Resume Parsing (NLP)', 'AI Candidate Ranking', 'Job\u2013Resume Matching', 'AI Interview Assistant', 'Shared Recruitment Database'],
    accessType: 'candidate',
    sortOrder: 5,
  },
  {
    title: 'AI Answer System',
    slug: 'ai-answer-system',
    category: 'Artificial Intelligence',
    shortDescription: 'A business intelligence assistant for owners, managers and teams.',
    description: 'Ask business questions, get HR guidance and search your knowledge base through natural conversation.',
    features: ['Ask business questions', 'HR & operational guidance', 'Strategy suggestions & action recommendations', 'Knowledge base search & document-based answers', 'SOP assistance', 'Permission-based enterprise knowledge access'],
    techSummary: 'A conversational AI assistant trained on the organization\u2019s own knowledge base, SOPs and documents \u2014 owners and managers ask plain-language business questions and get answers plus action recommendations, gated by each user\u2019s permission level.',
    techStack: ['Conversational AI / LLM', 'Enterprise Knowledge Base Search', 'Document Q&A', 'Permission-Based Access'],
    sortOrder: 6,
  },
  {
    title: 'Personal AI Assistant',
    slug: 'personal-ai-assistant',
    category: 'Artificial Intelligence',
    shortDescription: 'A personal productivity assistant for authorized users.',
    description: 'Daily briefings, task assistance, meeting summaries and writing help, available by text or voice.',
    features: ['Personal AI chat', 'Daily briefings & priority suggestions', 'Task & work planning', 'Meeting summaries', 'Writing assistance', 'Voice/text assistance & reminders', 'Personal productivity insights'],
    techSummary: 'A personal, per-user AI assistant \u2014 separate from the organization-wide AI Answer System \u2014 that helps one authorized person with daily briefings, task planning, meeting summaries and writing, reachable by text or voice.',
    techStack: ['Conversational AI / LLM', 'Task & Calendar Integration', 'Voice/Text Interface', 'Per-User Personalization'],
    sortOrder: 7,
  },
  {
    title: 'AI Robotics & Automation',
    slug: 'ai-robotics-automation',
    category: 'Automation',
    shortDescription: 'Automation tools that take repetitive work off your team\u2019s plate.',
    description: 'Workflow bots, document processing and smart approvals, all with human approval controls where needed.',
    features: ['Workflow & process automation bots', 'Document processing AI & data extraction', 'Smart approvals', 'Automated reporting', 'Intelligent task assignment & notifications', 'API & system integrations', 'RPA monitoring dashboard', 'Human approval controls'],
    techSummary: 'A separate AI/automation platform that manages companies, candidates, jobs, resumes, interviews, candidate verification and interview recordings, with analytics and process bots layered on top \u2014 every automated action still passes through a human approval control.',
    techStack: ['Backend: FastAPI + SQLAlchemy', 'Database: MySQL', 'Frontend: React + TypeScript + Vite', 'Candidate Verification & Recordings', 'Workflow Automation Bots', 'RPA Monitoring Dashboard'],
    sortOrder: 8,
  },
  {
    title: 'CRM & Sales Cloud',
    slug: 'crm-sales-cloud',
    category: 'Enterprise Tools',
    shortDescription: 'Lead-to-customer sales tools with AI insight built in.',
    description: 'Manage leads, contacts and the full sales pipeline, with AI-driven insights, customer support and journey mapping in one place.',
    features: ['Lead & contact management', 'Sales pipeline & opportunity tracking', 'Follow-up management & sales tasks', 'AI sales insights & customer intelligence', 'Customer support AI & ticket management', 'Customer journey mapping'],
    techSummary: 'A sales and support module covering the full lead-to-customer journey \u2014 leads, pipeline and tickets sit on one shared database, with an AI layer scoring leads and surfacing customer intelligence on top of the raw activity.',
    techStack: ['Lead & Pipeline Database', 'AI Lead Scoring', 'Support Ticketing', 'Node.js + MySQL Backend'],
    sortOrder: 9,
  },
  {
    title: 'Project & Operations Management',
    slug: 'project-operations-management',
    category: 'Enterprise Tools',
    shortDescription: 'Keep projects, teams and goals moving from one operations hub.',
    description: 'Track projects and resources, collaborate as a team, and monitor goals and workflows with productivity analytics throughout.',
    features: ['Project & task tracking', 'Resource planning', 'Team collaboration', 'Productivity analytics', 'Goal management & OKR dashboard', 'Workflow monitoring'],
    techSummary: 'An operations hub that tracks projects, tasks and resources against team goals and OKRs, with a live workflow-monitoring view so managers can see productivity and bottlenecks as they happen rather than at month-end.',
    techStack: ['Project/Task Data Model', 'OKR & Goal Tracking', 'Team Collaboration Tools', 'Productivity Analytics Dashboard'],
    sortOrder: 10,
  },
  {
    title: 'Finance & Revenue Intelligence',
    slug: 'finance-revenue-intelligence',
    category: 'Enterprise Tools',
    shortDescription: 'Financial visibility and forecasting for every part of the business.',
    description: 'Revenue dashboards, expense analytics and profitability tracking, backed by financial forecasting and automated tax and invoicing.',
    features: ['Revenue dashboard', 'Expense analytics', 'Profitability tracking', 'Financial forecasting', 'Cash flow intelligence', 'Tax & invoice automation'],
    techSummary: 'Pulls revenue, expense and cash flow data into live dashboards and forecasting models, with tax and invoice steps automated so finance teams spend less time on data entry and more on the actual numbers.',
    techStack: ['Financial Data Pipeline', 'Forecasting Models', 'Invoice & Tax Automation', 'Live Dashboards (Recharts)'],
    sortOrder: 11,
  },
  {
    title: 'Advanced Business Analytics',
    slug: 'advanced-business-analytics',
    category: 'Enterprise Tools',
    shortDescription: 'An enterprise data layer that turns activity into decisions.',
    description: 'An AI-powered data lake and BI platform driving executive dashboards, predictive analytics and real-time KPI monitoring.',
    features: ['AI data lake', 'BI platform', 'Executive dashboards', 'Predictive analytics', 'Market trend analysis', 'Real-time KPI monitoring'],
    techSummary: 'An enterprise data layer that pulls activity from every module into one AI data lake, then runs it through a BI engine and predictive models to power executive dashboards and real-time KPI monitoring.',
    techStack: ['AI Data Lake', 'BI / Analytics Engine', 'Predictive Models', 'Real-Time KPI Dashboards'],
    sortOrder: 12,
  },
  {
    title: 'Global Knowledge Network',
    slug: 'global-knowledge-network',
    category: 'Knowledge & Communication',
    shortDescription: 'An enterprise knowledge base that keeps every team working from the same playbook.',
    description: 'Centralize SOPs, training material and institutional knowledge with AI-powered search so answers are always one query away.',
    features: ['Enterprise knowledge base & wiki', 'SOP management', 'Training portal', 'AI-powered search'],
    techSummary: 'Centralizes SOPs, training material and internal documentation into one searchable wiki, with an AI-powered search layer so any team member can find the right answer without digging through folders.',
    techStack: ['Knowledge Base & Wiki Engine', 'AI-Powered Search', 'SOP / Training Content Store'],
    sortOrder: 13,
  },
  {
    title: 'Communication Hub',
    slug: 'communication-hub',
    category: 'Knowledge & Communication',
    shortDescription: 'Video, chat and voice AI brought together for one connected team.',
    description: 'Run meetings, internal chat and smart notifications from a single hub, with a voice AI assistant available across the platform.',
    features: ['Video meetings', 'Internal team chat', 'Voice AI assistant', 'Smart notifications'],
    techSummary: 'Brings video meetings, internal chat and a voice AI assistant into one connected hub, with smart notifications routing the right alert to the right person instead of flooding everyone\u2019s inbox.',
    techStack: ['Video Meetings (WebRTC)', 'Real-Time Chat (Socket.io)', 'Voice AI Assistant', 'Smart Notifications'],
    sortOrder: 14,
  },
  {
    title: 'Cyber Security Command Center',
    slug: 'cyber-security-command-center',
    category: 'Security',
    shortDescription: 'Zero-trust security and compliance monitoring built into every module.',
    description: 'Threat detection AI, identity management and data encryption protect every organization on the platform, with continuous compliance monitoring.',
    features: ['Zero trust architecture', 'Role-based access control', 'Multi-tenant architecture', 'AI threat detection', 'Identity management & data encryption', 'Audit, governance & compliance monitoring'],
    techSummary: 'The security layer running underneath every module \u2014 zero-trust access rules and role-based permissions keep each organization\u2019s data isolated on the multi-tenant architecture, with AI threat detection and audit logging watching continuously.',
    techStack: ['Zero Trust + RBAC', 'Multi-Tenant Isolation', 'AI Threat Detection', 'Encryption & Audit Logging'],
    sortOrder: 15,
  },
  {
    title: 'Global Marketplace',
    slug: 'global-marketplace',
    category: 'Global Network',
    shortDescription: 'A vendor and freelancer marketplace connected to your workforce operations.',
    description: 'Source vendors, freelancers and partners through one marketplace, with digital contracts handled end to end.',
    features: ['Vendor portal & service marketplace', 'Freelancer marketplace', 'Partner network', 'Digital contracts'],
    techSummary: 'A marketplace connecting organizations to vendors, freelancers and partners for extra workforce capacity, with digital contracts handling the paperwork from listing to sign-off inside the platform.',
    techStack: ['Vendor / Freelancer Directory', 'Marketplace Listings Database', 'Digital Contract Workflow'],
    sortOrder: 16,
  },
  {
    title: 'Smart City & Industry 5.0',
    slug: 'smart-city-industry-5-0',
    category: 'Global Network',
    shortDescription: 'IoT and robotics integration for smart factories, buildings and infrastructure.',
    description: 'Connect physical operations to the platform with IoT connectivity, digital twins and robotics integration built for Industry 5.0.',
    features: ['IoT connectivity', 'Smart factories & smart buildings', 'Robotics integration', 'Digital twin', 'Industry 5.0 operations'],
    techSummary: 'Connects physical operations \u2014 factories, buildings, robotics \u2014 to the platform through IoT sensors and digital-twin modeling, so floor-level activity feeds the same dashboards as the rest of the business.',
    techStack: ['IoT Connectivity', 'Digital Twin Modeling', 'Robotics Integration', 'Sensor Data Pipelines'],
    sortOrder: 17,
  },
  {
    title: 'Global Expansion',
    slug: 'global-expansion',
    category: 'Global Network',
    shortDescription: 'Multi-country, multi-language operations for businesses scaling worldwide.',
    description: 'Manage a global workforce with multi-language and multi-currency support, backed by international compliance across every region you operate in.',
    features: ['Multi-country operations', 'Multi-language & multi-currency support', 'International compliance', 'Global workforce management', 'Cloud-ready architecture'],
    techSummary: 'Lets one organization run HR, payroll and compliance rules across multiple countries from a single account \u2014 language, currency and local compliance settings switch per region, on a cloud-ready architecture built to scale globally.',
    techStack: ['Multi-Language / Multi-Currency Support', 'Compliance Rules Engine', 'Multi-Country Workforce Data', 'Cloud-Ready Architecture (AWS/Azure)'],
    sortOrder: 18,
  },
  {
    title: 'AI Agents Network',
    slug: 'ai-agents-network',
    category: 'Artificial Intelligence',
    shortDescription: 'Specialized AI agents working across every department.',
    description: 'Dedicated AI agents for HR, recruitment, sales, finance, operations and customer support, each trained on the workflows of that function.',
    features: ['HR AI agent', 'Recruitment AI agent', 'Sales AI agent', 'Finance AI agent', 'Operations AI agent', 'Customer support AI agent'],
    techSummary: 'A set of specialized AI agents, one per department, each trained on that function\u2019s own data and workflows \u2014 the HR agent works off HRMS data, the Sales agent off the CRM pipeline, and so on \u2014 orchestrated so they can hand off work between departments.',
    techStack: ['Department-Specific AI Agents', 'LLM Orchestration', 'Cross-Module Integrations'],
    sortOrder: 19,
  },
  {
    title: 'Custom Solutions & Consulting',
    slug: 'custom-solutions-consulting',
    category: 'Custom Solutions',
    shortDescription: 'Custom-built HRMS, enterprise software and managed services.',
    description: 'When off-the-shelf isn\u2019t enough, our team builds custom HRMS and enterprise software, integrates AI into your existing systems, and manages cloud deployment end to end.',
    features: ['Custom HRMS & enterprise software', 'AI integration', 'Cloud deployment', 'Consulting & managed services'],
    techSummary: 'For requirements the standard modules don\u2019t cover \u2014 our team builds custom HRMS and enterprise software, integrates AI into a client\u2019s existing systems, and handles cloud deployment and ongoing managed services end to end.',
    techStack: ['Custom Development', 'AI Integration Services', 'Cloud Deployment (AWS/Azure)', 'Managed Services'],
    sortOrder: 20,
  },
];

const testimonials = [
  {
    clientName: 'Ritu Sharma',
    role: 'HR Director',
    companyName: 'A mid-size manufacturing group',
    quote: 'We replaced four separate HR and attendance tools with one connected platform. Onboarding a new hire used to take a week of back-and-forth \u2014 now it happens the same day.',
    sortOrder: 1,
  },
  {
    clientName: 'Arjun Mehta',
    role: 'Talent Acquisition Lead',
    companyName: 'A fast-growing IT services company',
    quote: 'The AI screening alone cut our shortlisting time in half, and the recruiters still make every final call \u2014 it just removed the busywork before that.',
    sortOrder: 2,
  },
  {
    clientName: 'Priya Nair',
    role: 'Operations Manager',
    companyName: 'A multi-branch retail chain',
    quote: 'Attendance across our branches used to be a monthly headache. GPS check-ins and the real-time dashboard fixed that in the first month.',
    sortOrder: 3,
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // Admin account
    const email = process.env.SEED_ADMIN_EMAIL;
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (!existingAdmin) {
      await Admin.create({
        name: process.env.SEED_ADMIN_NAME || 'Admin',
        email,
        passwordHash,
      });
      console.log(`Created admin account: ${email}`);
    } else {
      await existingAdmin.update({ passwordHash });
      console.log(`Admin account already exists: ${email} (password refreshed from .env)`);
    }

    // Services
    for (const svc of services) {
      const [record, created] = await Service.findOrCreate({
        where: { slug: svc.slug },
        defaults: svc,
      });
      if (!created) {
        await record.update(svc);
      }
      console.log(created ? `Created service: ${svc.title}` : `Updated service: ${svc.title}`);
    }

    // Testimonials
    for (const t of testimonials) {
      const [record, created] = await Testimonial.findOrCreate({
        where: { clientName: t.clientName, companyName: t.companyName },
        defaults: t,
      });
      console.log(created ? `Created testimonial: ${t.clientName}` : `Testimonial already exists: ${t.clientName}`);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();