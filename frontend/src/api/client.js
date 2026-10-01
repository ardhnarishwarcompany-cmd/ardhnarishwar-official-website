import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE,
});

// Resolve media / upload URLs so they work on local and live.
// - Absolute http(s) URLs are left as-is (except localhost → current API origin)
// - Relative paths like /uploads/foo.png are prefixed with the API origin
export function mediaUrl(url) {
  if (!url) return '';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const origin = String(apiBase).replace(/\/api\/?$/, '');
  if (/^https?:\/\//i.test(url)) {
    // Rewrite legacy localhost upload URLs to the current API origin
    try {
      const u = new URL(url);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        return origin + u.pathname + u.search;
      }
    } catch {}
    return url;
  }
  return origin + (url.startsWith('/') ? url : '/' + url);
}


// --- JWT expiry helper ----------------------------------------------------
// isAuthed()/isPlatformAuthed()/isCandidateAuthed() used to only check
// whether a token *string* was sitting in localStorage — never whether it
// had actually expired. That meant a browser that had logged in once would
// keep showing "logged in" (e.g. skip the login gate on a service page)
// indefinitely, even long after the token was no longer valid. This decodes
// the token's `exp` claim (no signature check — that's the backend's job,
// this is purely a client-side "is it worth treating as logged in" check).
function isJwtExpired(token) {
  if (!token) return true;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (!decoded.exp) return false; // no expiry claim on this token — don't force-expire it
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true; // malformed/unreadable token — treat as not authed
  }
}

// --- Admin auth token handling -------------------------------------------
const TOKEN_KEY = 'ardh_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isAuthed = () => {
  const token = getToken();
  if (!token) return false;
  if (isJwtExpired(token)) { clearToken(); return false; }
  return true;
};

client.interceptors.request.use((config) => {
  // Do not attach an access token to the refresh-token call itself
  const url = config.url || '';
  if (url.includes('/platform-auth/refresh-token')) {
    return config;
  }

  const platformToken = typeof localStorage !== 'undefined' ? localStorage.getItem('ardh_platform_access') : null;
  const adminToken = typeof localStorage !== 'undefined' ? localStorage.getItem('ardh_admin_token') : null;
  const candidateToken = typeof localStorage !== 'undefined' ? localStorage.getItem('ardh_candidate_access') : null;
  const superAdminToken = typeof localStorage !== 'undefined' ? localStorage.getItem('ardh_superadmin_access') : null;

  // Candidate routes get their own token — never mixed with org/admin tokens.
  if (url.startsWith('/candidate-auth') || url.startsWith('/candidate')) {
    if (candidateToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${candidateToken}`;
    }
    return config;
  }

  // Portal APIs must ONLY use the platform (client) token — never the CMS
  // admin token, and never the Super Admin token either — those two are
  // internal-panel-only and must never act as a client login.
  if (url.startsWith('/portal')) {
    if (platformToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${platformToken}`;
    }
  } else if (isSharedPlatformUrl(url)) {
    // These endpoints (/notifications, /users, /roles/catalog,
    // /subscriptions, ...) are used by BOTH the internal admin panel and the
    // Client Portal. Pick the token by which area of the app is making the
    // call: /admin/* -> Super Admin token, everywhere else (Client Portal,
    // public site) -> the client's platform token. Previously these always
    // got the Super Admin token, which a client never has, so every portal
    // page got a 401 and was thrown to /admin/login.
    const tokenForArea = inAdminArea() ? superAdminToken : platformToken;
    if (tokenForArea) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${tokenForArea}`;
    }
  } else if (url.startsWith('/platform-auth')) {
    // The client portal's own auth endpoints (login/me/etc, refresh-token
    // already returned above) — always the platform (client) token, same
    // as before.
    if (platformToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${platformToken}`;
    }
  } else {
    const token = adminToken || platformToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Multi-tenant: send active organization for platform APIs
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('ardh_platform_user') : null;
    if (raw) {
      const u = JSON.parse(raw);
      const orgId = u.organizationId || (u.organizations && u.organizations[0] && u.organizations[0].id);
      if (orgId) {
        config.headers = config.headers || {};
        config.headers['x-organization-id'] = String(orgId);
      }
    }
  } catch (_) { /* ignore */ }
  return config;
});

// Public content
export const getServices = () => client.get('/services').then(r => r.data);
export const getServiceBySlug = (slug) => client.get(`/services/${slug}`).then(r => r.data);
// Real numbers from the live product (see liveStatsUrl in the admin service
// form). Resolves to null whenever nothing's configured or the product is
// unreachable, so callers can just fall back to demo content.
export const getServiceLiveStats = (slug) =>
  client.get(`/services/${slug}/live-stats`).then(r => r.data).catch(() => null);
export const getBlogPosts = () => client.get('/blog').then(r => r.data);
export const getBlogPostBySlug = (slug) => client.get(`/blog/${slug}`).then(r => r.data);
export const submitContactForm = (payload) => client.post('/contact', payload).then(r => r.data);
export const getTeam = () => client.get('/team').then(r => r.data);
export const getJobs = () => client.get('/jobs').then(r => r.data);
export const getJobBySlug = (slug) => client.get(`/jobs/${slug}`).then(r => r.data);
export const getFaqs = () => client.get('/faqs').then(r => r.data);
export const getIndustries = () => client.get('/industries').then(r => r.data);
export const getIndustryBySlug = (slug) => client.get(`/industries/${slug}`).then(r => r.data);
export const getTestimonials = () => client.get('/testimonials').then(r => r.data);

// --- Admin: auth ----------------------------------------------------------
export const adminLogin = (email, password) =>
  client.post('/auth/login', { email, password }).then(r => r.data);
export const getMe = () => client.get('/auth/me').then(r => r.data);

// --- Admin: services --------------------------------------------------
export const getAllServices = () =>
  client.get('/services', { params: { all: 'true' } }).then(r => r.data);
export const createService = (data) => client.post('/services', data).then(r => r.data);
export const updateService = (id, data) => client.put(`/services/${id}`, data).then(r => r.data);
export const deleteService = (id) => client.delete(`/services/${id}`).then(r => r.data);

// --- Admin: blog posts ------------------------------------------------
export const getAllBlogPosts = () =>
  client.get('/blog', { params: { all: 'true' } }).then(r => r.data);
export const createBlogPost = (data) => client.post('/blog', data).then(r => r.data);
export const updateBlogPost = (id, data) => client.put(`/blog/${id}`, data).then(r => r.data);
export const deleteBlogPost = (id) => client.delete(`/blog/${id}`).then(r => r.data);

// --- Admin: media -------------------------------------------------------
export const uploadMedia = (file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post('/media', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};
export const getMedia = () => client.get('/media').then(r => r.data);
export const deleteMedia = (id) => client.delete(`/media/${id}`).then(r => r.data);

// --- Admin: contact submissions ------------------------------------------
export const getSubmissions = () => client.get('/contact').then(r => r.data);
export const updateSubmissionStatus = (id, status) =>
  client.put(`/contact/${id}/status`, { status }).then(r => r.data);

// --- Admin: team members --------------------------------------------------
export const getAllTeam = () => client.get('/team', { params: { all: 'true' } }).then(r => r.data);
export const createTeamMember = (data) => client.post('/team', data).then(r => r.data);
export const updateTeamMember = (id, data) => client.put(`/team/${id}`, data).then(r => r.data);
export const deleteTeamMember = (id) => client.delete(`/team/${id}`).then(r => r.data);

// --- Admin: job openings ----------------------------------------------
export const getAllJobs = () => client.get('/jobs', { params: { all: 'true' } }).then(r => r.data);
export const createJob = (data) => client.post('/jobs', data).then(r => r.data);
export const updateJob = (id, data) => client.put(`/jobs/${id}`, data).then(r => r.data);
export const deleteJob = (id) => client.delete(`/jobs/${id}`).then(r => r.data);

// --- Admin: FAQs ------------------------------------------------------
export const getAllFaqs = () => client.get('/faqs', { params: { all: 'true' } }).then(r => r.data);
export const createFaq = (data) => client.post('/faqs', data).then(r => r.data);
export const updateFaq = (id, data) => client.put(`/faqs/${id}`, data).then(r => r.data);
export const deleteFaq = (id) => client.delete(`/faqs/${id}`).then(r => r.data);

// --- Admin: industries --------------------------------------------------
export const getAllIndustries = () => client.get('/industries', { params: { all: 'true' } }).then(r => r.data);
export const createIndustry = (data) => client.post('/industries', data).then(r => r.data);
export const updateIndustry = (id, data) => client.put(`/industries/${id}`, data).then(r => r.data);
export const deleteIndustry = (id) => client.delete(`/industries/${id}`).then(r => r.data);

export const getAllTestimonials = () => client.get('/testimonials', { params: { all: 'true' } }).then(r => r.data);
export const createTestimonial = (data) => client.post('/testimonials', data).then(r => r.data);
export const updateTestimonial = (id, data) => client.put(`/testimonials/${id}`, data).then(r => r.data);
export const deleteTestimonial = (id) => client.delete(`/testimonials/${id}`).then(r => r.data);

// --- Settings: platform links (Job Portal / Smart Attendance / HRMS live on
// their own domains), contact info and social links. Public read, admin write.
export const getSettings = () => client.get('/settings').then(r => r.data);
export const updateSettings = (data) => client.put('/settings', data).then(r => r.data);

export default client;

// --- CRM --------------------------------------------------------------
export const crmDashboard = () => client.get('/crm/dashboard').then(r => r.data);
export const crmReports = () => client.get('/crm/reports').then(r => r.data);
export const crmSearch = (q) => client.get('/crm/search', { params: { q } }).then(r => r.data);
export const crmExport = (type) =>
  client.get(`/crm/export/${type}`, { responseType: 'blob' }).then(r => r.data);

export const crmListLeads = (params) => client.get('/crm/leads', { params }).then(r => r.data);
export const crmGetLead = (id) => client.get(`/crm/leads/${id}`).then(r => r.data);
export const crmCreateLead = (data) => client.post('/crm/leads', data).then(r => r.data);
export const crmUpdateLead = (id, data) => client.put(`/crm/leads/${id}`, data).then(r => r.data);
export const crmDeleteLead = (id) => client.delete(`/crm/leads/${id}`).then(r => r.data);

export const crmListContacts = (params) => client.get('/crm/contacts', { params }).then(r => r.data);
export const crmGetContact = (id) => client.get(`/crm/contacts/${id}`).then(r => r.data);
export const crmCreateContact = (data) => client.post('/crm/contacts', data).then(r => r.data);
export const crmUpdateContact = (id, data) => client.put(`/crm/contacts/${id}`, data).then(r => r.data);
export const crmDeleteContact = (id) => client.delete(`/crm/contacts/${id}`).then(r => r.data);

export const crmListCompanies = (params) => client.get('/crm/companies', { params }).then(r => r.data);
export const crmGetCompany = (id) => client.get(`/crm/companies/${id}`).then(r => r.data);
export const crmCreateCompany = (data) => client.post('/crm/companies', data).then(r => r.data);
export const crmUpdateCompany = (id, data) => client.put(`/crm/companies/${id}`, data).then(r => r.data);
export const crmDeleteCompany = (id) => client.delete(`/crm/companies/${id}`).then(r => r.data);

export const crmListOpportunities = (params) => client.get('/crm/opportunities', { params }).then(r => r.data);
export const crmGetOpportunity = (id) => client.get(`/crm/opportunities/${id}`).then(r => r.data);
export const crmCreateOpportunity = (data) => client.post('/crm/opportunities', data).then(r => r.data);
export const crmUpdateOpportunity = (id, data) => client.put(`/crm/opportunities/${id}`, data).then(r => r.data);
export const crmDeleteOpportunity = (id) => client.delete(`/crm/opportunities/${id}`).then(r => r.data);

export const crmGetPipeline = (params) => client.get('/crm/pipeline', { params }).then(r => r.data);
export const crmMoveStage = (id, stage) => client.patch(`/crm/pipeline/${id}/stage`, { stage }).then(r => r.data);

export const crmListActivities = (params) => client.get('/crm/activities', { params }).then(r => r.data);
export const crmCreateActivity = (data) => client.post('/crm/activities', data).then(r => r.data);
export const crmUpdateActivity = (id, data) => client.put(`/crm/activities/${id}`, data).then(r => r.data);
export const crmDeleteActivity = (id) => client.delete(`/crm/activities/${id}`).then(r => r.data);

export const crmListTasks = (params) => client.get('/crm/tasks', { params }).then(r => r.data);
export const crmCreateTask = (data) => client.post('/crm/tasks', data).then(r => r.data);
export const crmUpdateTask = (id, data) => client.put(`/crm/tasks/${id}`, data).then(r => r.data);
export const crmDeleteTask = (id) => client.delete(`/crm/tasks/${id}`).then(r => r.data);

export const crmListFollowUps = (params) => client.get('/crm/followups', { params }).then(r => r.data);
export const crmCreateFollowUp = (data) => client.post('/crm/followups', data).then(r => r.data);
export const crmUpdateFollowUp = (id, data) => client.put(`/crm/followups/${id}`, data).then(r => r.data);
export const crmDeleteFollowUp = (id) => client.delete(`/crm/followups/${id}`).then(r => r.data);

export const crmListNotes = (params) => client.get('/crm/notes', { params }).then(r => r.data);
export const crmCreateNote = (data) => client.post('/crm/notes', data).then(r => r.data);
export const crmDeleteNote = (id) => client.delete(`/crm/notes/${id}`).then(r => r.data);

export const crmListTickets = (params) => client.get('/crm/tickets', { params }).then(r => r.data);
export const crmGetTicket = (id) => client.get(`/crm/tickets/${id}`).then(r => r.data);
export const crmCreateTicket = (data) => client.post('/crm/tickets', data).then(r => r.data);
export const crmUpdateTicket = (id, data) => client.put(`/crm/tickets/${id}`, data).then(r => r.data);
export const crmAddTicketComment = (id, data) => client.post(`/crm/tickets/${id}/comments`, data).then(r => r.data);
export const crmDeleteTicket = (id) => client.delete(`/crm/tickets/${id}`).then(r => r.data);

export const crmConvertSubmission = (id) => client.post(`/crm/convert-submission/${id}`).then(r => r.data);


// --- Platform (organization user) auth ---------------------------------
const PLATFORM_ACCESS_KEY = 'ardh_platform_access';
const PLATFORM_REFRESH_KEY = 'ardh_platform_refresh';
const PLATFORM_USER_KEY = 'ardh_platform_user';

export const getPlatformAccess = () => localStorage.getItem(PLATFORM_ACCESS_KEY);
export const getPlatformRefresh = () => localStorage.getItem(PLATFORM_REFRESH_KEY);
export const getPlatformUser = () => {
  try { return JSON.parse(localStorage.getItem(PLATFORM_USER_KEY) || 'null'); } catch { return null; }
};
export const setPlatformSession = ({ accessToken, refreshToken, user } = {}) => {
  if (accessToken) localStorage.setItem(PLATFORM_ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(PLATFORM_REFRESH_KEY, refreshToken);
  if (user) localStorage.setItem(PLATFORM_USER_KEY, JSON.stringify(user));
};
export const clearPlatformSession = () => {
  localStorage.removeItem(PLATFORM_ACCESS_KEY);
  localStorage.removeItem(PLATFORM_REFRESH_KEY);
  localStorage.removeItem(PLATFORM_USER_KEY);
};
export const isPlatformAuthed = () => {
  const token = getPlatformAccess();
  if (!token) return false;
  // Access tokens are short-lived (15m) and normally get silently rotated by
  // the response interceptor below on a 401. Here we're checking auth state
  // synchronously (e.g. to decide whether to show a login gate), so an
  // expired access token still counts as authed as long as a refresh token
  // is present — the very next API call will transparently refresh it.
  if (isJwtExpired(token) && !getPlatformRefresh()) { clearPlatformSession(); return false; }
  return true;
};

// --- Super Admin session (internal admin panel only) --------------------
// Deliberately a SEPARATE token/localStorage namespace from the Client
// Portal session above (ardh_platform_*). It is the same underlying
// platform User/JWT system on the backend (super-admin-only routes like
// /organizations, /roles, /modules, /subscriptions, /audit-logs still need
// a real platform JWT with isSuperAdmin=true), but keeping it out of
// ardh_platform_* means isPlatformAuthed() — which the public website uses
// to decide whether to gate a service behind login — never sees it. So
// signing into the CMS admin panel (and, through it, Super Admin) never
// makes the public site think a visitor is a logged-in client.
const SUPERADMIN_ACCESS_KEY = 'ardh_superadmin_access';
const SUPERADMIN_REFRESH_KEY = 'ardh_superadmin_refresh';
const SUPERADMIN_USER_KEY = 'ardh_superadmin_user';

export const getSuperAdminAccess = () => localStorage.getItem(SUPERADMIN_ACCESS_KEY);
export const getSuperAdminRefresh = () => localStorage.getItem(SUPERADMIN_REFRESH_KEY);
export const getSuperAdminUser = () => {
  try { return JSON.parse(localStorage.getItem(SUPERADMIN_USER_KEY) || 'null'); } catch { return null; }
};
export const setSuperAdminSession = ({ accessToken, refreshToken, user } = {}) => {
  if (accessToken) localStorage.setItem(SUPERADMIN_ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(SUPERADMIN_REFRESH_KEY, refreshToken);
  if (user) localStorage.setItem(SUPERADMIN_USER_KEY, JSON.stringify(user));
};
export const clearSuperAdminSession = () => {
  localStorage.removeItem(SUPERADMIN_ACCESS_KEY);
  localStorage.removeItem(SUPERADMIN_REFRESH_KEY);
  localStorage.removeItem(SUPERADMIN_USER_KEY);
};
export const isSuperAdminAuthed = () => {
  const token = getSuperAdminAccess();
  if (!token) return false;
  if (isJwtExpired(token) && !getSuperAdminRefresh()) { clearSuperAdminSession(); return false; }
  return Boolean(getSuperAdminUser()?.isSuperAdmin);
};

// URL prefixes for platform-backed endpoints (Organizations, Roles, Modules,
// Subscriptions, Audit Log, CRM, Notifications, Users/Permissions). They are
// SHARED: the internal admin panel calls them with the Super Admin session,
// the Client Portal calls a few of them (notifications, team members, role
// catalog, subscription/plans) with the client's platform session.
const SHARED_PLATFORM_PREFIXES = [
  '/crm', '/notifications', '/organizations', '/users',
  '/roles', '/modules', '/subscriptions', '/audit-logs', '/permissions',
];
function isSharedPlatformUrl(url) {
  return SHARED_PLATFORM_PREFIXES.some((p) => url.startsWith(p));
}
// Which area of the app is the browser currently in? Decides which session
// (Super Admin vs Client Portal) a shared endpoint belongs to.
function inAdminArea() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
}
function inPortalArea() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/portal');
}

// When an access token expires (15m), a single refresh call is made.
// Concurrent 401s wait on the same promise so we do not rotate the refresh
// token more than once (backend revokes the old refresh token on each use).
let isRefreshing = false;
let refreshWaiters = []; // array of { resolve, reject }

function subscribeTokenRefresh() {
  return new Promise((resolve, reject) => {
    refreshWaiters.push({ resolve, reject });
  });
}

function resolveRefreshWaiters(error, token) {
  refreshWaiters.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshWaiters = [];
}

/**
 * Call the refresh endpoint with the stored refresh token.
 * On success, stores the new access + refresh pair and returns the new access token.
 * On failure, clears the platform session.
 */
async function doPlatformRefresh() {
  const refreshToken = getPlatformRefresh();
  if (!refreshToken) {
    clearPlatformSession();
    throw new Error('No refresh token');
  }

  // Use a bare axios call (not `client`) so request/response interceptors
  // do not recurse into the refresh flow.
  const { data } = await axios.post(
    `${API_BASE}/platform-auth/refresh-token`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );

  setPlatformSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data.accessToken;
}

/**
 * Same idea as doPlatformRefresh, but for the separate Super Admin session
 * (ardh_superadmin_*). Uses the same backend refresh-token endpoint (it's
 * the same underlying platform User/JWT system) — just stores the result
 * under the Super Admin keys instead of the Client Portal ones.
 */
async function doSuperAdminRefresh() {
  const refreshToken = getSuperAdminRefresh();
  if (!refreshToken) {
    clearSuperAdminSession();
    throw new Error('No refresh token');
  }

  const { data } = await axios.post(
    `${API_BASE}/platform-auth/refresh-token`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );

  setSuperAdminSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data.accessToken;
}

let isRefreshingSuperAdmin = false;
let superAdminRefreshWaiters = [];

function subscribeSuperAdminRefresh() {
  return new Promise((resolve, reject) => {
    superAdminRefreshWaiters.push({ resolve, reject });
  });
}

function resolveSuperAdminRefreshWaiters(error, token) {
  superAdminRefreshWaiters.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  superAdminRefreshWaiters = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);

    const status = error.response?.status;
    const url = original.url || '';

    const isAuthEndpoint =
      url.includes('/platform-auth/login') ||
      url.includes('/platform-auth/register') ||
      url.includes('/platform-auth/refresh-token') ||
      url.includes('/platform-auth/forgot-password') ||
      url.includes('/platform-auth/reset-password') ||
      url.includes('/platform-auth/verify-email');

    if (status !== 401 || isAuthEndpoint || original._retry) {
      return Promise.reject(error);
    }

    // --- Super Admin session routes (only when the call came from an /admin
    // page): refresh/expire independently of the Client Portal session —
    // never touch ardh_platform_*, never redirect to /portal/login.
    if (isSharedPlatformUrl(url) && inAdminArea()) {
      if (!getSuperAdminRefresh()) {
        clearSuperAdminSession();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
          window.location.assign('/admin/login');
        }
        return Promise.reject(error);
      }

      original._retry = true;

      if (isRefreshingSuperAdmin) {
        try {
          const newToken = await subscribeSuperAdminRefresh();
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return client(original);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshingSuperAdmin = true;
      try {
        const newAccessToken = await doSuperAdminRefresh();
        resolveSuperAdminRefreshWaiters(null, newAccessToken);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(original);
      } catch (refreshError) {
        resolveSuperAdminRefreshWaiters(refreshError, null);
        clearSuperAdminSession();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
          window.location.assign('/admin/login');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshingSuperAdmin = false;
      }
    }

    // --- Client Portal session routes.
    // Shared endpoints called from outside /admin (i.e. the Client Portal)
    // belong to the client session too — they must NEVER bounce to /admin/login.
    const isPlatformRoute =
      url.includes('/platform-auth/') || url.startsWith('/portal') || isSharedPlatformUrl(url);
    if (!isPlatformRoute) {
      return Promise.reject(error);
    }

    // If we have no refresh token, force logout
    if (!getPlatformRefresh()) {
      clearPlatformSession();
      if (inPortalArea() && !window.location.pathname.startsWith('/portal/login')) {
        window.location.assign('/portal/login');
      }
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      // Queue this request until the in-flight refresh finishes
      try {
        const newToken = await subscribeTokenRefresh();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    isRefreshing = true;
    try {
      const newAccessToken = await doPlatformRefresh();
      resolveRefreshWaiters(null, newAccessToken);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return client(original);
    } catch (refreshError) {
      resolveRefreshWaiters(refreshError, null);
      clearPlatformSession();
      if (inPortalArea() && !window.location.pathname.startsWith('/portal/login')) {
        window.location.assign('/portal/login');
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const platformRegister = (data) =>
  client.post('/platform-auth/register', data).then(r => r.data);
export const platformLogin = (email, password) =>
  client.post('/platform-auth/login', { email, password }).then(r => r.data);
export const platformLogout = () =>
  client.post('/platform-auth/logout', { refreshToken: getPlatformRefresh() }).then(r => r.data).catch(() => {});
export const platformMe = () =>
  client.get('/platform-auth/me').then(r => r.data);
export const platformRefresh = () =>
  doPlatformRefresh();
export const platformForgotPassword = (email) =>
  client.post('/platform-auth/forgot-password', { email }).then(r => r.data);
export const platformResetPassword = (token, password) =>
  client.post('/platform-auth/reset-password', { token, password }).then(r => r.data);
// Step 2 of Register -> Verify -> Login
export const platformVerifyOtp = (email, otp) =>
  client.post('/platform-auth/verify-email', { email, otp }).then(r => r.data);
export const platformResendOtp = (email) =>
  client.post('/platform-auth/resend-otp', { email }).then(r => r.data);

// Platform (client/org) subscription upgrade (request-based)
export const platformListPlans = () =>
  client.get('/platform-auth/plans').then(r => r.data);
export const platformRequestPlanUpgrade = (planId, message) =>
  client.post('/platform-auth/plan-request', { planId, message }).then(r => r.data);
export const platformListPlanRequests = () =>
  client.get('/platform-auth/plan-requests').then(r => r.data);

// --- Candidate (job-seeker) auth ----------------------------------------
const CANDIDATE_ACCESS_KEY = 'ardh_candidate_access';
const CANDIDATE_REFRESH_KEY = 'ardh_candidate_refresh';
const CANDIDATE_KEY = 'ardh_candidate';

export const getCandidateAccess = () => localStorage.getItem(CANDIDATE_ACCESS_KEY);
export const getCandidateRefresh = () => localStorage.getItem(CANDIDATE_REFRESH_KEY);
export const getCandidate = () => {
  try { return JSON.parse(localStorage.getItem(CANDIDATE_KEY) || 'null'); } catch { return null; }
};
export const setCandidateSession = ({ accessToken, refreshToken, candidate } = {}) => {
  if (accessToken) localStorage.setItem(CANDIDATE_ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(CANDIDATE_REFRESH_KEY, refreshToken);
  if (candidate) localStorage.setItem(CANDIDATE_KEY, JSON.stringify(candidate));
};
export const clearCandidateSession = () => {
  localStorage.removeItem(CANDIDATE_ACCESS_KEY);
  localStorage.removeItem(CANDIDATE_REFRESH_KEY);
  localStorage.removeItem(CANDIDATE_KEY);
};
export const isCandidateAuthed = () => {
  const token = getCandidateAccess();
  if (!token) return false;
  if (isJwtExpired(token) && !getCandidateRefresh()) { clearCandidateSession(); return false; }
  return true;
};

export const candidateRegister = (data) =>
  client.post('/candidate-auth/register', data).then(r => r.data);
export const candidateLogin = (email, password) =>
  client.post('/candidate-auth/login', { email, password }).then(r => r.data);
export const candidateLogout = () =>
  client.post('/candidate-auth/logout', { refreshToken: getCandidateRefresh() }).then(r => r.data).catch(() => {});
export const candidateMe = () =>
  client.get('/candidate-auth/me').then(r => r.data);
export const candidateVerifyOtp = (email, otp) =>
  client.post('/candidate-auth/verify-email', { email, otp }).then(r => r.data);
export const candidateResendOtp = (email) =>
  client.post('/candidate-auth/resend-otp', { email }).then(r => r.data);

// Candidate subscription upgrade (request-based)
export const candidateListPlans = () =>
  client.get('/candidate-auth/plans').then(r => r.data);
export const candidateRequestPlanUpgrade = (planId, message) =>
  client.post('/candidate-auth/plan-request', { planId, message }).then(r => r.data);
export const candidateListPlanRequests = () =>
  client.get('/candidate-auth/plan-requests').then(r => r.data);

// Notifications
export const listNotifications = (params) =>
  client.get('/notifications', { params }).then(r => r.data);
export const markNotificationRead = (id) =>
  client.patch(`/notifications/${id}/read`).then(r => r.data);
export const markAllNotificationsRead = () =>
  client.patch('/notifications/read-all').then(r => r.data);

// --- Org team / roles --------------------------------------------------
export const listOrgMembers = (params) =>
  client.get('/users', { params }).then(r => r.data);
export const inviteOrgMember = (data) =>
  client.post('/users/invite', data).then(r => r.data);
export const updateMemberRole = (userId, roleName) =>
  client.patch(`/users/${userId}/role`, { roleName }).then(r => r.data);
export const updateMemberStatus = (userId, status) =>
  client.patch(`/users/${userId}/status`, { status }).then(r => r.data);
export const listRoleCatalog = () =>
  client.get('/roles/catalog').then(r => r.data);

// --- Workspace: subscription -------------------------------------------
export const getOrgSubscription = (organizationId) =>
  client.get(`/subscriptions/organization/${organizationId}`).then(r => r.data);
export const listSubscriptionPlans = () =>
  client.get('/subscriptions/plans').then(r => r.data);

// --- Super Admin: Organizations ------------------------------------------
export const listAllOrganizations = (params) =>
  client.get('/organizations', { params }).then(r => r.data);
export const getOrganization = (id) =>
  client.get(`/organizations/${id}`).then(r => r.data);
export const createOrganization = (data) =>
  client.post('/organizations', data).then(r => r.data);
export const updateOrganization = (id, data) =>
  client.put(`/organizations/${id}`, data).then(r => r.data);
export const setOrganizationStatus = (id, status) =>
  client.patch(`/organizations/${id}/status`, { status }).then(r => r.data);
export const listOrganizationUsers = (id) =>
  client.get(`/organizations/${id}/users`).then(r => r.data);

// --- Super Admin: Roles & Permissions -------------------------------------
export const listAllRoles = () =>
  client.get('/roles').then(r => r.data);
export const createRole = (data) =>
  client.post('/roles', data).then(r => r.data);
export const updateRole = (id, data) =>
  client.put(`/roles/${id}`, data).then(r => r.data);
export const deleteRole = (id) =>
  client.delete(`/roles/${id}`).then(r => r.data);
export const setRolePermissions = (id, permissionIds) =>
  client.put(`/roles/${id}/permissions`, { permissionIds }).then(r => r.data);
export const listAllPermissions = () =>
  client.get('/permissions').then(r => r.data);

// --- Super Admin: Subscription plans ---------------------------------------
export const createSubscriptionPlan = (data) =>
  client.post('/subscriptions/plans', data).then(r => r.data);
export const updateSubscriptionPlan = (id, data) =>
  client.put(`/subscriptions/plans/${id}`, data).then(r => r.data);
export const assignSubscriptionPlan = (organizationId, data) =>
  client.post(`/subscriptions/organization/${organizationId}`, data).then(r => r.data);

// --- Super Admin: Audit Log --------------------------------------------------
export const listAuditLogs = (params) =>
  client.get('/audit-logs', { params }).then(r => r.data);

// --- Client portal: inquiries -----------------------------------------------
// GENERAL = free-text inquiry the client submits from the portal.
// Plan upgrades are a separate flow — see platformRequestPlanUpgrade below.
export const submitPortalInquiry = (data) =>
  client.post('/portal/inquiries', data).then(r => r.data);
export const listMyPortalInquiries = () =>
  client.get('/portal/inquiries/mine').then(r => r.data);