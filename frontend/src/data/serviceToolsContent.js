// Frontend-only content for the "Summary" section on the service detail
// page (ServiceDetail.jsx), placed right after "How it works". Same pattern
// as serviceDemoContent.js: keyed by slug, no backend/DB changes required,
// works immediately.
//
// techSummary  -> a few sentences: what the service does end-to-end, who it
//                 does it for, and — where it's a separately-built product —
//                 what actually runs it under the hood.
// techStack    -> short list of specific tools/technology shown as chips.

const bySlug = {
  'hrms-workforce-management': {
    techSummary: 'HRMS runs as its own product for managing a company\u2019s internal employees and day-to-day HR operations. Employee records, company/org structure, leave, shifts, payroll inputs and performance all sit on one centralized employee database instead of being scattered across spreadsheets, so HR, Admins and Employees each see exactly what their role needs through separate access levels. It is designed to plug straight into Smart Attendance, so check-in data flows through to leave and payroll without any manual re-entry, and to stay accurate as the organization adds departments, branches or new hires over time.',
    techStack: ['Employee & Company Data Model', 'Role-Based Admin (HR / Admin / Employee)', 'Centralized HR Database', 'Self-Service Portal', 'Integrates with Smart Attendance'],
  },
  'smart-attendance-system': {
    techSummary: 'Smart Attendance is a digital attendance system built to record and manage employee attendance automatically and securely, without relying on manual registers or easily-gamed punch cards. It supports Company Admin, Super Admin and Employee roles, and verifies each check-in through face or biometric recognition, GPS/location checks and Wi-Fi validation, so attendance can only be marked from an approved device and location. Every check-in reflects on a real-time dashboard the moment it happens, and the underlying data is built to feed straight into HRMS and payroll, cutting out the month-end reconciliation work HR teams usually do by hand.',
    techStack: ['Backend: Python (Flask)', 'Database: MongoDB', 'Face & Biometric Verification', 'GPS / Location Validation', 'Wi-Fi Validation', 'Real-Time Attendance Engine'],
  },
  'hr-staffing-solutions': {
    techSummary: 'HR Staffing Solutions is a service layer delivered by our staffing consultants rather than a self-serve tool — but it runs on the same candidate and job database that powers the Job Portal and AI Recruitment Cloud, so nothing has to be re-entered between sourcing and placement. Consultants use this shared data to manage requirements, build candidate pipelines, coordinate interviews and track deployment through to joining, whether the engagement is permanent staffing, temporary staffing, contract roles, executive search, bulk hiring or full RPO. Because the data model is shared, a candidate sourced here can move straight into the Job Portal or AI Recruitment Cloud workflow without losing history.',
    techStack: ['Shared Candidate & Requirement Database', 'Recruiter Dashboard', 'Pipeline & Placement Tracking', 'Client Shortlisting Workflow'],
  },
  'job-portal': {
    techSummary: 'The Job Portal is a recruitment platform where companies post openings and candidates search for and apply to them, covering the full loop from job posting to hire. It handles employer and candidate registration, advanced job search and filters, resume upload, candidate profiles, saved jobs and job alerts, application tracking with status updates, interview scheduling and company profile pages. It runs on the same employer/candidate accounts used elsewhere on the platform, so a company that is already using HRMS or Smart Attendance does not need a separate login to start hiring.',
    techStack: ['Job Posting & Management', 'Candidate Profiles & Resume Upload', 'Application Tracking', 'Employer & Candidate Auth'],
  },
  'ai-recruitment-cloud': {
    techSummary: 'AI Recruitment Cloud puts AI/ML models on top of the shared recruitment database to speed up the parts of hiring that are the most repetitive — reading resumes, matching them against a job description, ranking candidates and flagging skill gaps. It also generates interview questions and assists during structured interview evaluation, then feeds the outcome into an automated onboarding workflow once someone is hired. The AI narrows down and organizes the pipeline; recruiters and clients still review every shortlist and make every final hiring decision themselves.',
    techStack: ['Resume Parsing (NLP)', 'AI Candidate Ranking', 'Job\u2013Resume Matching', 'AI Interview Assistant', 'Shared Recruitment Database'],
  },
  'ai-answer-system': {
    techSummary: 'The AI Answer System is a conversational AI assistant trained on an organization\u2019s own knowledge base, SOPs and internal documents, so owners and managers can ask plain-language business questions instead of digging through folders or asking around. It can offer HR guidance, suggest operational fixes or strategy directions, search the knowledge base for a document-backed answer, and recommend a next action rather than just a fact. Access to enterprise knowledge is permission-based, so the assistant only surfaces what that particular user is actually allowed to see.',
    techStack: ['Conversational AI / LLM', 'Enterprise Knowledge Base Search', 'Document Q&A', 'Permission-Based Access'],
  },
  'personal-ai-assistant': {
    techSummary: 'Personal AI Assistant is a per-user productivity assistant, separate from the organization-wide AI Answer System, built for one authorized person\u2019s own workday rather than company-wide knowledge. It handles daily briefings, priority suggestions, task and work planning, meeting summaries and writing assistance, and can be reached by text or voice depending on what is enabled for that user. Because it is personal rather than shared, its suggestions and productivity insights are shaped around that individual\u2019s own patterns and workload over time.',
    techStack: ['Conversational AI / LLM', 'Task & Calendar Integration', 'Voice/Text Interface', 'Per-User Personalization'],
  },
  'ai-robotics-automation': {
    techSummary: 'AI Robotics & Automation is a separate AI and automation platform that manages companies, candidates, jobs, resumes, interviews, candidate verification and interview recordings, with analytics and process-automation bots layered on top of that data. It handles document processing, data extraction and smart approvals, assigns tasks intelligently, sends event-based notifications and connects to other systems through APIs — all monitored through an RPA dashboard. Every automated action still passes through a human approval control, so nothing gets approved or rejected without a person signing off where it matters.',
    techStack: ['Backend: FastAPI + SQLAlchemy', 'Database: MySQL', 'Frontend: React + TypeScript + Vite', 'Candidate Verification & Recordings', 'Workflow Automation Bots', 'RPA Monitoring Dashboard'],
  },
  'crm-sales-cloud': {
    techSummary: 'CRM & Sales Cloud covers the full lead-to-customer journey in one place — leads, contacts, pipeline stages, opportunities, follow-ups and sales tasks all sit on a shared database instead of living in separate spreadsheets per salesperson. An AI layer scores incoming leads and surfaces customer intelligence on top of that raw activity, while a connected support desk handles tickets and maps the customer journey from first contact through to renewal, so sales and support are working from the same picture of each account.',
    techStack: ['Lead & Pipeline Database', 'AI Lead Scoring', 'Support Ticketing', 'Node.js + MySQL Backend'],
  },
  'project-operations-management': {
    techSummary: 'Project & Operations Management is an operations hub that tracks projects, tasks and resource allocation against team goals and OKRs, so planning and execution live in the same place instead of a separate goals document nobody updates. Team collaboration tools keep discussion attached to the actual task, and a live workflow-monitoring view with productivity analytics lets managers see where things are moving and where they are stuck as it happens, rather than piecing it together at month-end from status-update emails.',
    techStack: ['Project/Task Data Model', 'OKR & Goal Tracking', 'Team Collaboration Tools', 'Productivity Analytics Dashboard'],
  },
  'finance-revenue-intelligence': {
    techSummary: 'Finance & Revenue Intelligence pulls revenue, expense and cash flow data into live dashboards and forecasting models, giving finance teams one place to see where the business actually stands instead of reconciling numbers across multiple spreadsheets. Profitability tracking and cash flow intelligence sit alongside financial forecasting, and tax and invoice steps are automated, so the team spends its time interpreting the numbers rather than re-entering them by hand every month.',
    techStack: ['Financial Data Pipeline', 'Forecasting Models', 'Invoice & Tax Automation', 'Live Dashboards (Recharts)'],
  },
  'advanced-business-analytics': {
    techSummary: 'Advanced Business Analytics is the enterprise data layer that pulls activity from every other module — HR, attendance, recruitment, sales, finance — into one AI data lake, rather than leaving each module\u2019s data siloed on its own. A BI engine and predictive models run on top of that combined data to power executive dashboards, market trend analysis and real-time KPI monitoring, so leadership can see a single, current picture of the business instead of stitching together separate reports.',
    techStack: ['AI Data Lake', 'BI / Analytics Engine', 'Predictive Models', 'Real-Time KPI Dashboards'],
  },
  'global-knowledge-network': {
    techSummary: 'Global Knowledge Network centralizes SOPs, training material and internal documentation into one searchable wiki, so institutional knowledge lives in a shared place instead of in individual inboxes or someone\u2019s head. An AI-powered search layer sits on top of that content, so any team member can ask a question in plain language and get pointed to the right document or SOP instead of manually browsing folders, which also makes onboarding new hires and training portals faster to build.',
    techStack: ['Knowledge Base & Wiki Engine', 'AI-Powered Search', 'SOP / Training Content Store'],
  },
  'communication-hub': {
    techSummary: 'Communication Hub brings video meetings, internal team chat and a voice AI assistant together into one connected space, instead of splitting a team across three or four separate apps for calls, chat and reminders. Smart notifications are routed based on relevance, so the right alert reaches the right person instead of every update going out to everyone, and the voice AI assistant is available across the hub for quick questions or hands-free actions during a meeting or a busy shift.',
    techStack: ['Video Meetings (WebRTC)', 'Real-Time Chat (Socket.io)', 'Voice AI Assistant', 'Smart Notifications'],
  },
  'cyber-security-command-center': {
    techSummary: 'Cyber Security Command Center is the security layer that runs underneath every other module rather than being a standalone tool a team opens on its own. Zero-trust access rules and role-based permissions keep each organization\u2019s data isolated within the platform\u2019s multi-tenant architecture, identity management and encryption protect data at rest and in transit, and AI-driven threat detection watches for suspicious activity continuously, with every action logged for audit and compliance monitoring.',
    techStack: ['Zero Trust + RBAC', 'Multi-Tenant Isolation', 'AI Threat Detection', 'Encryption & Audit Logging'],
  },
  'global-marketplace': {
    techSummary: 'Global Marketplace connects organizations to vendors, freelancers and partners for extra capacity they do not want to hire in-house, through a vendor portal, service marketplace, freelancer marketplace and partner network all in one place. Digital contracts handle the paperwork from listing to sign-off inside the platform itself, so sourcing an outside vendor or freelancer does not mean stepping outside the platform to manage the agreement separately.',
    techStack: ['Vendor / Freelancer Directory', 'Marketplace Listings Database', 'Digital Contract Workflow'],
  },
  'smart-city-industry-5-0': {
    techSummary: 'Smart City & Industry 5.0 connects physical operations — factories, buildings, robotics on the floor — to the platform through IoT connectivity and digital-twin modeling, so equipment and infrastructure data is not stuck on a separate operational-technology system. Robotics integration and digital twins let a facility be monitored and simulated before changes are made on the actual floor, and the resulting sensor data feeds into the same dashboards used for the rest of the business, built for Industry 5.0-style human-and-machine operations.',
    techStack: ['IoT Connectivity', 'Digital Twin Modeling', 'Robotics Integration', 'Sensor Data Pipelines'],
  },
  'global-expansion': {
    techSummary: 'Global Expansion lets one organization run HR, payroll and compliance across multiple countries from a single account instead of standing up a separate system per region. Multi-language and multi-currency support switch per country, an international compliance layer keeps local labor-law and reporting requirements in view, and global workforce management ties country-level teams back into the same organization view, all on a cloud-ready architecture built to scale as new regions are added.',
    techStack: ['Multi-Language / Multi-Currency Support', 'Compliance Rules Engine', 'Multi-Country Workforce Data', 'Cloud-Ready Architecture (AWS/Azure)'],
  },
  'ai-agents-network': {
    techSummary: 'AI Agents Network is a set of specialized AI agents, one per department, each trained on that function\u2019s own data and day-to-day workflows rather than one generic assistant trying to cover everything. The HR agent works off HRMS data, the Recruitment agent off the shared candidate database, the Sales agent off the CRM pipeline, and the Finance, Operations and Customer Support agents off their respective modules — all orchestrated so an agent can hand a task off to another department\u2019s agent when a request crosses functions.',
    techStack: ['Department-Specific AI Agents', 'LLM Orchestration', 'Cross-Module Integrations'],
  },
  'custom-solutions-consulting': {
    techSummary: 'Custom Solutions & Consulting is for the requirements the standard modules do not cover out of the box. Our team builds custom HRMS and enterprise software tailored to a client\u2019s exact process, integrates AI into systems the client already has rather than forcing a full replacement, and handles cloud deployment and ongoing managed services end to end, so a client gets a solution shaped around how they actually work instead of adapting their process to fit a fixed product.',
    techStack: ['Custom Development', 'AI Integration Services', 'Cloud Deployment (AWS/Azure)', 'Managed Services'],
  },
};

// Generic fallback for any future service added purely through the admin
// panel (no entry here yet) — built from its own `features` array so the
// section is never blank.
function genericFor(service) {
  const features = Array.isArray(service?.features) ? service.features : [];
  return {
    techSummary: service?.description || service?.shortDescription || '',
    techStack: features.slice(0, 6),
  };
}

/**
 * Returns { techSummary, techStack } for a given service record.
 * Prefers real data saved on the service itself (from the admin panel /
 * backend, if present), then this local slug lookup, then a generic
 * fallback built from the service's own fields — never blank.
 */
export function getToolsContent(service) {
  if (!service) return { techSummary: '', techStack: [] };
  const local = bySlug[service.slug] || genericFor(service);
  return {
    techSummary: service.techSummary || local.techSummary || '',
    techStack: (Array.isArray(service.techStack) && service.techStack.length > 0)
      ? service.techStack
      : (local.techStack || []),
  };
}
