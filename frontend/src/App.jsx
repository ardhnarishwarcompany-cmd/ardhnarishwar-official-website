import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import WhyArdhnarishwar from './pages/WhyArdhnarishwar';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import RequestDemo from './pages/RequestDemo';
import Team from './pages/Team';
import Careers from './pages/Careers';
import JobDetail from './pages/JobDetail';
import Faq from './pages/Faq';
import Industries from './pages/Industries';
import LoginChoice from './pages/LoginChoice';
import Pricing from './pages/Pricing';

import RequireAuth from './admin/RequireAuth';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import ServicesList from './admin/ServicesList';
import ServiceForm from './admin/ServiceForm';
import BlogList from './admin/BlogList';
import BlogForm from './admin/BlogForm';
import MediaLibrary from './admin/MediaLibrary';
import Submissions from './admin/Submissions';
import TeamList from './admin/TeamList';
import TeamForm from './admin/TeamForm';
import JobsList from './admin/JobsList';
import JobForm from './admin/JobForm';
import FaqList from './admin/FaqList';
import FaqForm from './admin/FaqForm';
import IndustriesList from './admin/IndustriesList';
import IndustryForm from './admin/IndustryForm';
import TestimonialsList from './admin/TestimonialsList';
import TestimonialForm from './admin/TestimonialForm';
import Settings from './admin/Settings';
import OrganizationsList from './admin/OrganizationsList';
import RolesPermissions from './admin/RolesPermissions';
import SubscriptionsAdmin from './admin/SubscriptionsAdmin';
import AuditLogViewer from './admin/AuditLogViewer';

import CrmDashboard from './admin/crm/CrmDashboard';
import LeadsList from './admin/crm/LeadsList';
import LeadForm from './admin/crm/LeadForm';
import Pipeline from './admin/crm/Pipeline';
import OpportunitiesList from './admin/crm/OpportunitiesList';
import OpportunityForm from './admin/crm/OpportunityForm';
import ContactsList from './admin/crm/ContactsList';
import CompaniesList from './admin/crm/CompaniesList';
import TasksList from './admin/crm/TasksList';
import TicketsList from './admin/crm/TicketsList';
import CrmReports from './admin/crm/CrmReports';

import PortalLayout from './portal/PortalLayout';
import RequirePortalAuth from './portal/RequirePortalAuth';
import PortalLogin from './portal/PortalLogin';
import PortalRegister from './portal/PortalRegister';
import PortalVerify from './portal/PortalVerify';
import PortalInquiry from './portal/Inquiry';
import TeamMembers from './portal/TeamMembers';
import Workspace from './portal/Workspace';
import PortalServices from './portal/PortalServices';
import PortalPricing from './portal/PortalPricing';
import PortalProfile from './portal/PortalProfile';

import RequireCandidateAuth from './candidate/RequireCandidateAuth';
import CandidateLogin from './candidate/CandidateLogin';
import CandidateRegister from './candidate/CandidateRegister';
import CandidateVerify from './candidate/CandidateVerify';
import CandidateLayout from './candidate/CandidateLayout';
import CandidateServices from './candidate/CandidateServices';
import CandidatePricing from './candidate/CandidatePricing';
import CandidateProfile from './candidate/CandidateProfile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/why-ardhnarishwar" element={<WhyArdhnarishwar />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/request-demo" element={<RequestDemo />} />
        <Route path="/team" element={<Team />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/careers/:slug" element={<JobDetail />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login/choose" element={<LoginChoice />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/admin/services" element={<RequireAuth><ServicesList /></RequireAuth>} />
        <Route path="/admin/services/new" element={<RequireAuth><ServiceForm /></RequireAuth>} />
        <Route path="/admin/services/:id/edit" element={<RequireAuth><ServiceForm /></RequireAuth>} />
        <Route path="/admin/blog" element={<RequireAuth><BlogList /></RequireAuth>} />
        <Route path="/admin/blog/new" element={<RequireAuth><BlogForm /></RequireAuth>} />
        <Route path="/admin/blog/:id/edit" element={<RequireAuth><BlogForm /></RequireAuth>} />
        <Route path="/admin/media" element={<RequireAuth><MediaLibrary /></RequireAuth>} />
        <Route path="/admin/submissions" element={<RequireAuth><Submissions /></RequireAuth>} />
        <Route path="/admin/team" element={<RequireAuth><TeamList /></RequireAuth>} />
        <Route path="/admin/team/new" element={<RequireAuth><TeamForm /></RequireAuth>} />
        <Route path="/admin/team/:id/edit" element={<RequireAuth><TeamForm /></RequireAuth>} />
        <Route path="/admin/careers" element={<RequireAuth><JobsList /></RequireAuth>} />
        <Route path="/admin/careers/new" element={<RequireAuth><JobForm /></RequireAuth>} />
        <Route path="/admin/careers/:id/edit" element={<RequireAuth><JobForm /></RequireAuth>} />
        <Route path="/admin/faqs" element={<RequireAuth><FaqList /></RequireAuth>} />
        <Route path="/admin/faqs/new" element={<RequireAuth><FaqForm /></RequireAuth>} />
        <Route path="/admin/faqs/:id/edit" element={<RequireAuth><FaqForm /></RequireAuth>} />
        <Route path="/admin/industries" element={<RequireAuth><IndustriesList /></RequireAuth>} />
        <Route path="/admin/industries/new" element={<RequireAuth><IndustryForm /></RequireAuth>} />
        <Route path="/admin/industries/:id/edit" element={<RequireAuth><IndustryForm /></RequireAuth>} />
        <Route path="/admin/testimonials" element={<RequireAuth><TestimonialsList /></RequireAuth>} />
        <Route path="/admin/testimonials/new" element={<RequireAuth><TestimonialForm /></RequireAuth>} />
        <Route path="/admin/testimonials/:id/edit" element={<RequireAuth><TestimonialForm /></RequireAuth>} />
        <Route path="/admin/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/admin/organizations" element={<RequireAuth><OrganizationsList /></RequireAuth>} />
        <Route path="/admin/roles" element={<RequireAuth><RolesPermissions /></RequireAuth>} />
        <Route path="/admin/subscriptions" element={<RequireAuth><SubscriptionsAdmin /></RequireAuth>} />
        <Route path="/admin/audit-log" element={<RequireAuth><AuditLogViewer /></RequireAuth>} />

        {/* Admin CRM (legacy CMS admin) */}
        <Route path="/admin/crm" element={<RequireAuth><CrmDashboard /></RequireAuth>} />
        <Route path="/admin/crm/leads" element={<RequireAuth><LeadsList /></RequireAuth>} />
        <Route path="/admin/crm/leads/new" element={<RequireAuth><LeadForm /></RequireAuth>} />
        <Route path="/admin/crm/leads/:id" element={<RequireAuth><LeadForm /></RequireAuth>} />
        <Route path="/admin/crm/pipeline" element={<RequireAuth><Pipeline /></RequireAuth>} />
        <Route path="/admin/crm/opportunities" element={<RequireAuth><OpportunitiesList /></RequireAuth>} />
        <Route path="/admin/crm/opportunities/new" element={<RequireAuth><OpportunityForm /></RequireAuth>} />
        <Route path="/admin/crm/opportunities/:id" element={<RequireAuth><OpportunityForm /></RequireAuth>} />
        <Route path="/admin/crm/contacts" element={<RequireAuth><ContactsList /></RequireAuth>} />
        <Route path="/admin/crm/companies" element={<RequireAuth><CompaniesList /></RequireAuth>} />
        <Route path="/admin/crm/tasks" element={<RequireAuth><TasksList /></RequireAuth>} />
        <Route path="/admin/crm/tickets" element={<RequireAuth><TicketsList /></RequireAuth>} />
        <Route path="/admin/crm/reports" element={<RequireAuth><CrmReports /></RequireAuth>} />

        {/* Organization Portal */}
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/register" element={<PortalRegister />} />
        <Route path="/portal/verify" element={<PortalVerify />} />
        <Route path="/portal" element={<RequirePortalAuth><PortalLayout /></RequirePortalAuth>}>
          <Route index element={<PortalInquiry />} />
          <Route path="inquiry" element={<PortalInquiry />} />
          <Route path="services" element={<PortalServices />} />
          <Route path="pricing" element={<PortalPricing />} />
          {/* CRM removed from the client portal — clients submit inquiries instead.
              Admin CRM (/admin/crm/...) is untouched. */}
          <Route path="team" element={<TeamMembers />} />
          <Route path="workspace" element={<Workspace />} />
          <Route path="profile" element={<PortalProfile />} />
        </Route>

        {/* Candidate Portal */}
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/register" element={<CandidateRegister />} />
        <Route path="/candidate/verify" element={<CandidateVerify />} />
        <Route path="/candidate" element={<RequireCandidateAuth><CandidateLayout /></RequireCandidateAuth>}>
          <Route index element={<CandidateServices />} />
          <Route path="services" element={<CandidateServices />} />
          <Route path="pricing" element={<CandidatePricing />} />
          <Route path="profile" element={<CandidateProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}