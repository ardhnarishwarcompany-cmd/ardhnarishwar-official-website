// Pricing data sourced from the official Payment Structure & Service
// Commercials document (effective August 2026). Kept as static data for
// now — no payment gateway is wired up, this is informational only.

export const recruitmentPlans = [
  {
    tag: 'Plan A',
    name: 'Premium Recruitment Partnership',
    fee: '8.33% of Annual CTC',
    feeNote: 'Equivalent to 1 month candidate salary',
    replacement: '4 Months Free',
    closure: 'Within 7 working days',
    token: '₹5,000',
    hrms: 'Free HRMS access for 4 months',
    benefits: ['Fast hiring', 'Extended replacement security', 'HRMS included', 'Negotiable for bulk hiring'],
    featured: true,
  },
  {
    tag: 'Plan B',
    name: 'Standard Recruitment Partnership',
    fee: '20 days candidate salary',
    replacement: '3 Months Free',
    closure: 'Within 7 working days',
    token: '₹5,000',
    hrms: 'Free HRMS access for 3 months',
    benefits: ['Reduced hiring cost', 'Free replacement support', 'HRMS included'],
  },
  {
    tag: 'Plan C',
    name: 'Startup Recruitment Partnership',
    fee: '15 days candidate salary',
    replacement: '2 Months Free',
    closure: 'Within 7 working days',
    token: '₹5,000',
    hrms: 'Free HRMS access for 2 months',
    benefits: ['Lowest recruitment fee', 'Startup-friendly model', 'HRMS included'],
  },
];

export const hrOutsourcing = {
  name: 'Enterprise HR Outsourcing',
  duration: '11-Month Contract',
  token: '₹5,000',
  replacement: 'Free replacement for 11 Months',
  billing: 'Monthly service charge calculated on total employee salary value, as per agreed manpower scope.',
  included: [
    'Payroll Processing',
    'Attendance Management',
    'PF & ESIC Compliance',
    'HRMS Software',
    'Operational HR Support',
    'Employee Documentation',
    'Offer & Joining Management',
    'Exit Management',
    'Basic HR Audit Support',
  ],
};

export const saasPlans = [
  {
    name: 'HR Technology Starter',
    mrp: '₹10,000/month',
    price: '₹5,000/month',
    hiring: 'Hiring support for 5 candidates during 11 months',
  },
  {
    name: 'HR Technology Growth',
    mrp: '₹15,000/month',
    price: '₹11,000/month',
    hiring: 'Hiring support for 15 candidates during 11 months',
    featured: true,
  },
  {
    name: 'HR Technology Enterprise',
    mrp: '₹20,000/month',
    price: '₹16,000/month',
    hiring: 'Unlimited hiring support during 11 months',
  },
].map((p) => ({
  ...p,
  contract: '11-Month Agreement · ₹5,000 token at signup',
  included: [
    p.hiring,
    'Free replacement support',
    'Payroll support',
    'Compliance support',
    'HRMS access',
    'Operational HR support',
  ],
}));

export const individualProducts = [
  {
    name: 'AI Automated Attendance System',
    mrp: '₹499 per employee/month',
    price: '₹99 per employee/month',
    terms: '11-Month Agreement · ₹5,000 token',
    features: ['Geo-tagging', 'Geo-fencing', 'Mobile attendance', 'Shift management', 'Real-time attendance reports'],
  },
  {
    name: 'AI Candidate Interview System',
    mrp: '₹299 per candidate',
    price: '₹99 per week',
    terms: '11-Month Agreement · ₹5,000 token',
    features: ['AI screening', 'AI scoring', 'Interview reports', 'HR recommendation engine'],
  },
  {
    name: 'Employee Verification Portal',
    mrp: '₹1,000 per employee',
    price: '₹999/month (Unlimited Verifications)',
    terms: '11-Month Agreement',
    features: ['Document verification', 'ID verification', 'Employment verification', 'Background workflow'],
  },
  {
    name: 'Standalone HRMS Subscription',
    mrp: '₹1,000 per employee/month',
    price: '₹299 per employee/month',
    terms: '11-Month Agreement',
    features: ['Attendance', 'Leave management', 'Payroll support', 'Employee database', 'Offer & experience letters', 'Reports & analytics', 'HR support desk'],
  },
];

export const commercialSummary = [
  { service: 'Recruitment Premium', mrp: 'Standard market rate', price: '8.33% Annual CTC' },
  { service: 'Recruitment Standard', mrp: '25 days salary', price: '20 days salary' },
  { service: 'Recruitment Startup', mrp: '25 days salary', price: '15 days salary' },
  { service: 'HR Tech Starter', mrp: '₹10,000/month', price: '₹5,000/month' },
  { service: 'HR Tech Growth', mrp: '₹15,000/month', price: '₹11,000/month' },
  { service: 'HR Tech Enterprise', mrp: '₹20,000/month', price: '₹16,000/month' },
  { service: 'AI Attendance', mrp: '₹499/employee', price: '₹99/employee' },
  { service: 'AI Interview', mrp: '₹299/candidate', price: '₹99/week' },
  { service: 'Verification Portal', mrp: '₹1,000/employee', price: '₹999/month unlimited' },
  { service: 'HRMS Standalone', mrp: '₹1,000/employee', price: '₹299/employee' },
];

export const universalTerms = [
  { title: 'Token Amount', body: '₹5,000 payable at agreement signing for applicable plans, fully adjustable against the final invoice.' },
  { title: 'Agreement Duration', body: 'Standard agreement period is 11 Months.' },
  { title: 'Payment Terms', body: 'Recruitment invoices payable within 7 days of candidate joining. Subscription invoices payable monthly in advance unless otherwise agreed.' },
  { title: 'Replacement Policy', body: 'As per selected recruitment plan. Replacement is subject to the candidate leaving within the covered period and client payments being clear.' },
];

export const negotiationNote = 'Bulk hiring, multi-location deployment, long-term outsourcing, and enterprise contracts are eligible for customized commercial discussion.';

export const pricingEffectiveDate = 'Effective from August 2026';
