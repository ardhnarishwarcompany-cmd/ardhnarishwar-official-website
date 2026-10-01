// Frontend-only content used to render the "product preview" dashboard,
// the "How it works" steps and the "What is this?" section on the service
// demo page (ServiceDetail.jsx). Keyed by service slug first, falling back
// to category, then to a generic template built from the service's own
// `features` array so any future service (added purely through the admin
// panel) still gets a sensible, non-empty demo — no DB changes required.

const bySlug = {
  'hrms-workforce-management': {
    whoFor: ['HR teams', 'Managers', 'Employees', 'Business owners'],
    stats: [
      { label: 'Total Employees', value: 248, suffix: '' },
      { label: 'Attendance Today', value: 231, suffix: '' },
      { label: 'Leave Requests', value: 12, suffix: '' },
      { label: 'Pending Approvals', value: 5, suffix: '' },
    ],
    chart: {
      type: 'bar',
      title: 'Workforce Overview',
      data: [
        { name: 'Engineering', value: 84 },
        { name: 'Sales', value: 52 },
        { name: 'Operations', value: 61 },
        { name: 'Support', value: 31 },
        { name: 'HR', value: 20 },
      ],
    },
    steps: [
      'Add Organization',
      'Configure Workforce',
      'Manage Employees',
      'Automate HR Processes',
      'Track Insights',
    ],
  },
  'smart-attendance-system': {
    whoFor: ['HR teams', 'Branch managers', 'Employees', 'Payroll teams'],
    stats: [
      { label: 'Present Today', value: 214, suffix: '' },
      { label: 'Late Arrivals', value: 9, suffix: '' },
      { label: 'Absent', value: 17, suffix: '' },
      { label: 'Branches Live', value: 6, suffix: '' },
    ],
    chart: {
      type: 'line',
      title: 'Attendance Trend (last 7 days)',
      data: [
        { name: 'Mon', value: 92 },
        { name: 'Tue', value: 95 },
        { name: 'Wed', value: 88 },
        { name: 'Thu', value: 94 },
        { name: 'Fri', value: 90 },
        { name: 'Sat', value: 61 },
        { name: 'Sun', value: 22 },
      ],
    },
    steps: [
      'Configure Locations',
      'Connect Attendance Method',
      'Employees Check In',
      'Monitor Attendance',
      'Generate Reports',
    ],
  },
  'hr-staffing-solutions': {
    whoFor: ['Hiring managers', 'HR leaders', 'Business owners'],
    stats: [
      { label: 'Open Requisitions', value: 34, suffix: '' },
      { label: 'Candidates Sourced', value: 512, suffix: '' },
      { label: 'Placements This Month', value: 18, suffix: '' },
      { label: 'Avg. Time to Fill', value: 21, suffix: ' days' },
    ],
    chart: {
      type: 'bar',
      title: 'Placements by Type',
      data: [
        { name: 'Permanent', value: 40 },
        { name: 'Temporary', value: 25 },
        { name: 'Contract', value: 20 },
        { name: 'Executive', value: 8 },
      ],
    },
    steps: [
      'Share Your Hiring Need',
      'We Source & Shortlist',
      'You Interview & Select',
      'Coordinate Joining',
      'Ongoing Deployment Support',
    ],
  },
  'job-portal': {
    whoFor: ['Job seekers', 'Recruiters', 'Employers'],
    stats: [
      { label: 'Live Jobs', value: 1240, suffix: '' },
      { label: 'Candidates', value: 8600, suffix: '' },
      { label: 'Applications Today', value: 340, suffix: '' },
      { label: 'Interviews Scheduled', value: 27, suffix: '' },
    ],
    chart: {
      type: 'bar',
      title: 'Applications by Category',
      data: [
        { name: 'IT', value: 420 },
        { name: 'Sales', value: 260 },
        { name: 'Operations', value: 180 },
        { name: 'Finance', value: 140 },
        { name: 'HR', value: 90 },
      ],
    },
    steps: [
      'Create Your Profile',
      'Search & Save Jobs',
      'Apply in One Click',
      'Track Applications',
      'Get Interview Updates',
    ],
  },
  'ai-recruitment-cloud': {
    whoFor: ['Recruiters', 'Hiring managers', 'Candidates'],
    stats: [
      { label: 'Candidates Screened', value: 1860, suffix: '' },
      { label: 'Avg. AI Match Score', value: 82, suffix: '%' },
      { label: 'Shortlisted', value: 96, suffix: '' },
      { label: 'Interviews Assisted', value: 44, suffix: '' },
    ],
    chart: {
      type: 'line',
      title: 'Candidates Screened (last 6 weeks)',
      data: [
        { name: 'W1', value: 210 },
        { name: 'W2', value: 260 },
        { name: 'W3', value: 300 },
        { name: 'W4', value: 340 },
        { name: 'W5', value: 380 },
        { name: 'W6', value: 420 },
      ],
    },
    steps: [
      'Upload the Job Description',
      'AI Parses & Ranks Resumes',
      'Review Shortlist & Skill Gaps',
      'Run AI-Assisted Interviews',
      'Make a Structured Decision',
    ],
  },
  'ai-answer-system': {
    whoFor: ['Business owners', 'Managers', 'Teams'],
    stats: [
      { label: 'Questions Answered', value: 3120, suffix: '' },
      { label: 'Knowledge Docs Indexed', value: 486, suffix: '' },
      { label: 'Avg. Response Time', value: 2, suffix: 's' },
      { label: 'Teams Active', value: 14, suffix: '' },
    ],
    chart: {
      type: 'bar',
      title: 'Questions by Topic',
      data: [
        { name: 'HR Policy', value: 38 },
        { name: 'Operations', value: 27 },
        { name: 'Strategy', value: 19 },
        { name: 'Finance', value: 16 },
      ],
    },
    steps: [
      'Connect Your Knowledge Base',
      'Ask a Business Question',
      'Get an Instant, Sourced Answer',
      'Take the Recommended Action',
    ],
  },
  'personal-ai-assistant': {
    whoFor: ['Founders', 'Managers', 'Individual professionals'],
    stats: [
      { label: 'Tasks Organized', value: 62, suffix: '' },
      { label: 'Daily Briefings Sent', value: 210, suffix: '' },
      { label: 'Meetings Summarized', value: 38, suffix: '' },
      { label: 'Hours Saved / Week', value: 6, suffix: '' },
    ],
    chart: {
      type: 'line',
      title: 'Tasks Completed (last 7 days)',
      data: [
        { name: 'Mon', value: 8 },
        { name: 'Tue', value: 11 },
        { name: 'Wed', value: 9 },
        { name: 'Thu', value: 14 },
        { name: 'Fri', value: 12 },
        { name: 'Sat', value: 4 },
        { name: 'Sun', value: 2 },
      ],
    },
    steps: [
      'Connect Your Calendar & Tasks',
      'Get a Daily Briefing',
      'Ask for Writing or Planning Help',
      'Review Meeting Summaries',
    ],
  },
  'ai-robotics-automation': {
    whoFor: ['Operations teams', 'IT teams', 'Business owners'],
    stats: [
      { label: 'Active Workflows', value: 26, suffix: '' },
      { label: 'Documents Processed', value: 4200, suffix: '' },
      { label: 'Automated Approvals', value: 310, suffix: '' },
      { label: 'Error Rate', value: 0.4, suffix: '%' },
    ],
    chart: {
      type: 'bar',
      title: 'Automation Volume by Workflow',
      data: [
        { name: 'Invoicing', value: 120 },
        { name: 'Onboarding', value: 80 },
        { name: 'Reporting', value: 95 },
        { name: 'Approvals', value: 60 },
      ],
    },
    steps: [
      'Map the Manual Process',
      'Build the Automation Workflow',
      'Connect Your Systems (API)',
      'Monitor & Refine with RPA Insights',
    ],
  },
  'crm-sales-cloud': {
    whoFor: ['Sales teams', 'Support teams', 'Business owners'],
    stats: [
      { label: 'Active Leads', value: 186, suffix: '' },
      { label: 'Open Opportunities', value: 42, suffix: '' },
      { label: 'Tasks Due Today', value: 15, suffix: '' },
      { label: 'Open Tickets', value: 8, suffix: '' },
    ],
    chart: {
      type: 'bar',
      title: 'Pipeline by Stage',
      data: [
        { name: 'New', value: 60 },
        { name: 'Qualified', value: 45 },
        { name: 'Proposal', value: 28 },
        { name: 'Won', value: 20 },
      ],
    },
    steps: [
      'Import Your Leads & Contacts',
      'Track the Sales Pipeline',
      'Automate Follow-Ups',
      'Get AI Sales Insights',
      'Report on What Matters',
    ],
  },
};

const byCategory = {
  'HR & Workforce': bySlug['hrms-workforce-management'],
  'Staffing': bySlug['hr-staffing-solutions'],
  'Artificial Intelligence': bySlug['ai-answer-system'],
  'Automation': bySlug['ai-robotics-automation'],
  'Enterprise Tools': bySlug['crm-sales-cloud'],
};

const GENERIC_STAT_LABELS = ['Active Users', 'Requests Handled', 'Automation Rate', 'Uptime'];

function genericFor(service) {
  const features = Array.isArray(service?.features) ? service.features : [];
  return {
    whoFor: ['Business owners', 'Managers', 'Teams', 'Employees'],
    stats: [
      { label: GENERIC_STAT_LABELS[0], value: 128, suffix: '' },
      { label: GENERIC_STAT_LABELS[1], value: 940, suffix: '' },
      { label: GENERIC_STAT_LABELS[2], value: 76, suffix: '%' },
      { label: GENERIC_STAT_LABELS[3], value: 99.9, suffix: '%' },
    ],
    chart: {
      type: 'bar',
      title: 'Module Activity',
      data: (features.length ? features.slice(0, 5) : ['Setup', 'Adoption', 'Usage', 'Insights']).map(
        (f, i) => ({ name: typeof f === 'string' ? f.split(' ').slice(0, 2).join(' ') : `Module ${i + 1}`, value: 40 + ((i * 17) % 55) })
      ),
    },
    steps: [
      'Set Up Your Organization',
      'Configure the Module',
      'Your Team Adopts the Workflow',
      'Track Results & Optimize',
    ],
  };
}

/**
 * Returns { whoFor, stats, chart, steps } for a given service record.
 * Looks up by slug first, then category, then falls back to a generic
 * template derived from the service's own features so nothing is ever blank.
 */
export function getDemoContent(service) {
  if (!service) return genericFor(null);
  return (
    bySlug[service.slug] ||
    byCategory[service.category] ||
    genericFor(service)
  );
}

// Generic, reusable "why businesses use this" benefit cards (section 8).
export const BENEFITS = [
  { title: 'Save time', description: 'Cut down manual, repetitive work with workflows that run themselves.' },
  { title: 'Reduce manual work', description: 'Fewer spreadsheets, fewer follow-up emails, fewer things to remember.' },
  { title: 'Improve visibility', description: 'One place to see what is happening across your team or organization.' },
  { title: 'Automate repetitive tasks', description: 'Let the system handle routine steps so people can focus on decisions.' },
  { title: 'Centralize information', description: 'Keep records, requests and history together instead of scattered across tools.' },
  { title: 'Scale operations', description: 'Add more people, locations or volume without adding proportional overhead.' },
];