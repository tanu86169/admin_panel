const API_ROOT =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}/job_portal/job-portal-api`;

export const API_BASE = `${API_ROOT}/api`;

export default API_ROOT;