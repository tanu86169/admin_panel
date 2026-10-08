import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserRound,
  BriefcaseBusiness,
  FileText,
  Bell,
  Search,
  ArrowUpRight,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Layers,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ================= API URLS =================

const USERS_API =
  "http://localhost/job_portal/job-portal-api/api/admin/users.php";

const JOBS_API =
  "http://localhost/job_portal/job-portal-api/api/admin/jobs.php";

const REPORTS_API =
  "http://localhost/job_portal/job-portal-api/api/admin/reports.php";

const NOTIFICATIONS_API =
  "http://localhost/job_portal/job-portal-api/api/admin/notifications.php";

// ================= STAT CARD =================

const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick }) => {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      bar: "from-blue-600 to-cyan-500",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      bar: "from-indigo-600 to-blue-500",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      bar: "from-emerald-500 to-teal-500",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      bar: "from-amber-500 to-orange-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
      bar: "from-purple-600 to-pink-500",
    },
  };

  const theme = colorStyles[color] || colorStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`group relative w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Top Accent Line */}
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${theme.bar}`} />

      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${theme.bg} ${theme.text} ${theme.border}`}
        >
          <Icon size={22} />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          <TrendingUp size={12} className="text-emerald-500" />
          <span>Live</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
};

// ================= SECTION HEADER =================

const SectionHeader = ({ title, subtitle, action, onClick }) => {
  return (
    <div className="mb-5 flex w-full min-w-0 items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      {action && (
        <button
          onClick={onClick}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
        >
          {action}
          <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
};

// ================= MAIN COMPONENT =================

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, candidates: 0, recruiters: 0, admins: 0 },
    jobs: { total: 0, active: 0, closed: 0 },
    applications: { total: 0, statuses: [] },
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    try {
      const savedAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
      setAdmin(savedAdmin);
    } catch (err) {
      console.error("Admin data error:", err);
    }
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [reportsResponse, usersResponse, jobsResponse, notificationsResponse] =
        await Promise.all([
          axios.get(REPORTS_API),
          axios.get(USERS_API),
          axios.get(JOBS_API),
          axios.get(NOTIFICATIONS_API),
        ]);

      if (reportsResponse.data?.success) {
        const reportData = reportsResponse.data;
        setDashboardData((previous) => ({
          ...previous,
          ...reportData,
          users: { ...previous.users, ...(reportData.users || {}) },
          jobs: { ...previous.jobs, ...(reportData.jobs || {}) },
          applications: {
            ...previous.applications,
            ...(reportData.applications || {}),
          },
        }));
      }

      if (usersResponse.data?.success) {
        const users = usersResponse.data.users || [];
        setRecentUsers([...users].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5));
      }

      if (jobsResponse.data?.success) {
        const jobs = jobsResponse.data.jobs || [];
        setRecentJobs([...jobs].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5));
      }

      if (notificationsResponse.data?.success) {
        const notifications = notificationsResponse.data.notifications || [];
        const unread = notifications.filter((item) => Number(item.is_read) === 0).length;
        setUnreadNotifications(unread);
      }
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setError("Dashboard data load nahi ho raha. Backend APIs check karein.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getApplicationCount = (status) => {
    const statuses = dashboardData.applications?.statuses || [];
    const item = statuses.find(
      (statusItem) => String(statusItem.status).toLowerCase() === status.toLowerCase()
    );
    return item ? Number(item.total) : 0;
  };

  const totalApplications = Number(dashboardData.applications?.total) || 0;
  const hiredApplications = getApplicationCount("Hired");
  const rejectedApplications = getApplicationCount("Rejected");
  const shortlistedApplications = getApplicationCount("Shortlisted");

  const searchedUsers = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return recentUsers;

    return recentUsers.filter((user) => {
      return (
        user.name?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value) ||
        String(user.id).includes(value)
      );
    });
  }, [recentUsers, search]);

  const searchedJobs = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return recentJobs;

    return recentJobs.filter((job) => {
      return (
        job.job_title?.toLowerCase().includes(value) ||
        job.company_name?.toLowerCase().includes(value) ||
        job.location?.toLowerCase().includes(value)
      );
    });
  }, [recentJobs, search]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={36} className="animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading dashboard analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        
        {/* TOP WELCOME BANNER (Matching Image Gradient) */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-6 shadow-lg sm:p-8 text-white">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                  Admin Workspace
                </span>
                <span className="flex items-center gap-1.5 text-xs text-blue-100">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  System Live
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {admin.name || "Admin"} 👋
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Here is an overview of your job portal activity and metrics.
              </p>
            </div>

            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* SUMMARY BAR */}
        <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Layers size={18} className="text-blue-600" />
                Portal Overview
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Real-time snapshot of system activities
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs">
                <span className="text-slate-500">Users: </span>
                <span className="font-bold text-slate-900">
                  {dashboardData.users?.total || 0}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs">
                <span className="text-slate-500">Jobs: </span>
                <span className="font-bold text-slate-900">
                  {dashboardData.jobs?.total || 0}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs">
                <span className="text-slate-500">Applications: </span>
                <span className="font-bold text-slate-900">{totalApplications}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        {/* SEARCH & NOTIFICATION */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-blue-500">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users or jobs by title, company, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none sm:text-sm"
            />
          </div>

          <button
            onClick={() => navigate("/admin/notifications")}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* STATS GRID */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Users"
            value={dashboardData.users?.total || 0}
            subtitle="All platform accounts"
            icon={Users}
            color="blue"
            onClick={() => navigate("/admin/users")}
          />
          <StatCard
            title="Candidates"
            value={dashboardData.users?.candidates || 0}
            subtitle="Active job seekers"
            icon={UserRound}
            color="indigo"
            onClick={() => navigate("/admin/users")}
          />
          <StatCard
            title="Recruiters"
            value={dashboardData.users?.recruiters || 0}
            subtitle="Hiring managers"
            icon={UserCheck}
            color="emerald"
            onClick={() => navigate("/admin/users")}
          />
          <StatCard
            title="Total Jobs"
            value={dashboardData.jobs?.total || 0}
            subtitle="All created job listings"
            icon={BriefcaseBusiness}
            color="amber"
            onClick={() => navigate("/admin/jobs")}
          />
          <StatCard
            title="Applications"
            value={totalApplications}
            subtitle="Submitted candidate resumes"
            icon={FileText}
            color="purple"
            onClick={() => navigate("/admin/applications")}
          />
          <StatCard
            title="Hired Candidates"
            value={hiredApplications}
            subtitle="Successful placements"
            icon={CheckCircle}
            color="emerald"
          />
        </div>

        {/* JOB + APPLICATION OVERVIEW */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* JOB OVERVIEW */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              title="Job Posting Overview"
              subtitle="Status break-up of all job listings"
              action="View Jobs"
              onClick={() => navigate("/admin/jobs")}
            />

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <p className="text-[11px] font-semibold text-slate-500">Total</p>
                <h4 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                  {dashboardData.jobs?.total || 0}
                </h4>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 sm:p-4">
                <p className="text-[11px] font-semibold text-emerald-600">Active</p>
                <h4 className="mt-1 text-xl font-bold text-emerald-600 sm:text-2xl">
                  {dashboardData.jobs?.active || 0}
                </h4>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50/50 p-3 sm:p-4">
                <p className="text-[11px] font-semibold text-red-500">Closed</p>
                <h4 className="mt-1 text-xl font-bold text-red-500 sm:text-2xl">
                  {dashboardData.jobs?.closed || 0}
                </h4>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-slate-500">Active Listings</span>
                  <span className="font-semibold text-emerald-600">
                    {dashboardData.jobs?.active || 0}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{
                      width:
                        dashboardData.jobs?.total > 0
                          ? `${Math.min(100, (dashboardData.jobs.active / dashboardData.jobs.total) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-slate-500">Closed Listings</span>
                  <span className="font-semibold text-red-500">
                    {dashboardData.jobs?.closed || 0}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-400 to-rose-500 transition-all duration-500"
                    style={{
                      width:
                        dashboardData.jobs?.total > 0
                          ? `${Math.min(100, (dashboardData.jobs.closed / dashboardData.jobs.total) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* APPLICATION OVERVIEW */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              title="Application Pipeline"
              subtitle="Candidate applications by status"
              action="View Applications"
              onClick={() => navigate("/admin/applications")}
            />

            <div className="mb-6 flex justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[8px] border-blue-500 bg-blue-50 shadow-md sm:h-36 sm:w-36">
                <div className="text-center">
                  <span className="text-2xl font-black text-slate-900 sm:text-3xl">
                    {totalApplications}
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Total Apps
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Applied
                </span>
                <span className="font-bold text-slate-900">
                  {getApplicationCount("Applied")}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Shortlisted
                </span>
                <span className="font-bold text-amber-600">
                  {shortlistedApplications}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Rejected
                </span>
                <span className="font-bold text-red-500">
                  {rejectedApplications}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Hired
                </span>
                <span className="font-bold text-emerald-600">
                  {hiredApplications}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT USERS + JOBS */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* RECENT USERS */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <SectionHeader
                title="Recent Registrations"
                subtitle="Newly joined platform users"
                action="View All"
                onClick={() => navigate("/admin/users")}
              />
            </div>

            <div className="divide-y divide-slate-100">
              {searchedUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No registered users found.
                </div>
              ) : (
                searchedUsers.map((user) => {
                  const role =
                    user.role === "recruiter"
                      ? "Recruiter"
                      : user.role === "candidate"
                      ? "Candidate"
                      : "Admin";

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-bold text-blue-600">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                            {user.name || "Unknown User"}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {user.email || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                          {role}
                        </span>
                        <p className="mt-1 text-[10px] text-slate-400">
                          ID #{user.id}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RECENT JOBS */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <SectionHeader
                title="Recent Job Postings"
                subtitle="Latest job openings added"
                action="View All"
                onClick={() => navigate("/admin/jobs")}
              />
            </div>

            <div className="divide-y divide-slate-100">
              {searchedJobs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No job listings found.
                </div>
              ) : (
                searchedJobs.map((job) => (
                  <div key={job.id} className="p-4 transition hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600">
                          <BriefcaseBusiness size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                            {job.job_title || "Untitled Job"}
                          </p>
                          <p className="truncate text-[11px] font-medium text-slate-600">
                            {job.company_name || "-"}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {job.location || "-"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          job.status === "active"
                            ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                            : "border border-slate-200 bg-slate-100 text-slate-500"
                        }`}
                      >
                        {job.status || "Unknown"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-[10px] font-medium text-slate-400">
                      <span>{job.job_type || "-"}</span>
                      <span>•</span>
                      <span>{job.experience || "-"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} />
                        {formatDate(job.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Quick Management"
            subtitle="Fast access to core administration modules"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              <Users size={20} className="mb-2 text-blue-600 transition group-hover:scale-110" />
              <p className="text-xs font-bold text-slate-900 sm:text-sm">Manage Users</p>
              <p className="mt-0.5 text-[11px] text-slate-500">View & Edit</p>
            </button>

            <button
              onClick={() => navigate("/admin/jobs")}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/50"
            >
              <BriefcaseBusiness size={20} className="mb-2 text-amber-600 transition group-hover:scale-110" />
              <p className="text-xs font-bold text-slate-900 sm:text-sm">Manage Jobs</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Postings & Status</p>
            </button>

            <button
              onClick={() => navigate("/admin/applications")}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-purple-300 hover:bg-purple-50/50"
            >
              <FileText size={20} className="mb-2 text-purple-600 transition group-hover:scale-110" />
              <p className="text-xs font-bold text-slate-900 sm:text-sm">Applications</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Track candidates</p>
            </button>

            <button
              onClick={() => navigate("/admin/notifications")}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <Bell size={20} className="mb-2 text-emerald-600 transition group-hover:scale-110" />
              <p className="text-xs font-bold text-slate-900 sm:text-sm">Notifications</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Alerts & System</p>
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-900">
                JobPortal Administration System
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span>Users: {dashboardData.users?.total || 0}</span>
              <span>•</span>
              <span>Jobs: {dashboardData.jobs?.total || 0}</span>
              <span>•</span>
              <span>Apps: {totalApplications}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;