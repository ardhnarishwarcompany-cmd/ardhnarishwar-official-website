// Shared category -> icon mapping for services, used anywhere a service
// needs a visual identity but doesn't have its own dedicated icon image
// (e.g. ServiceDetail.jsx hero, Home.jsx "Live products" cards). Keeping
// this in one place means every service gets a consistent icon for its
// category across the whole site, and any new category just needs one
// entry added here rather than in every page that shows service icons.
import {
  Users, Briefcase, Bot, Workflow, LineChart,
  BookOpen, ShieldCheck, Globe2, Wrench, Layers,
} from 'lucide-react';

export const categoryIcons = {
  'HR & Workforce': Users,
  'Staffing': Briefcase,
  'Artificial Intelligence': Bot,
  'Automation': Workflow,
  'Enterprise Tools': LineChart,
  'Knowledge & Communication': BookOpen,
  'Security': ShieldCheck,
  'Global Network': Globe2,
  'Custom Solutions': Wrench,
};

export function iconFor(category) {
  return categoryIcons[category] || Layers;
}