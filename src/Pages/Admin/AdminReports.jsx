import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  Briefcase,
  FileText,
  Building2,
  Tags,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

const API_URL =
  "http://localhost/job_portal/job-portal-api/api/admin/reports.php";

/* ---------- Small reusable components ---------- */

const StatCard = ({ label, value, icon: Icon, gradient }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div
      className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${gradient} opacity-10 transition group-hover:opacity-20`}
    />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-800">{value}</h2>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${gradient} text-white shadow-lg`}
      >
        <Icon size={22} />
      </div>
    </div>
    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full w-2/3 rounded-full ${gradient}`} />
    </div>
  </div>
);

const SecondaryCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
    <div className="mb-3 flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
      >
        <Icon size={18} />
      </div>
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-slate-800">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
  </div>
);

const ProgressBar = ({ label, value, total, color }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className={`text-sm font-bold ${color.text}`}>{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color.bar} transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

/* ---------- Main component ---------- */

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      if (response.data.success) {
        setReports(response.data);
      } else {
        setError(response.data.message || "Failed to fetch reports");
      }
    } catch (err) {
      console.error("Reports API Error:", err);
      setError("Unable to fetch reports. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getApplicationCount = (status) => {
    if (!reports?.applications?.statuses) return 0;
    const item = reports.applications.statuses.find(
      (item) => item.status?.toLowerCase() === status.toLowerCase()
    );
    return item ? item.total : 0;
  };

  const getCompanyCount = (status) => {
    if (!reports?.companies?.statuses) return 0;
    const item = reports.companies.statuses.find(
      (item) => item.status?.toLowerCase() === status.toLowerCase()
    );
    return item ? item.total : 0;
  };

  const getCategoryCount = (status) => {
    if (!reports?.categories?.statuses) return 0;
    const item = reports.categories.statuses.find(
      (item) => item.status?.toLowerCase() === status.toLowerCase()
    );
    return item ? item.total : 0;
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
            <RefreshCw size={28} className="animate-spin text-blue-600" />
          </div>
          <p className="font-medium text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <XCircle size={28} className="text-red-500" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-slate-800">
            Something went wrong
          </h2>
          <p className="mb-6 text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchReports}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Main Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={reports.users.total}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <StatCard
            label="Candidates"
            value={reports.users.candidates}
            icon={UserCheck}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Total Jobs"
            value={reports.jobs.total}
            icon={Briefcase}
            gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
          />
          <StatCard
            label="Applications"
            value={reports.applications.total}
            icon={FileText}
            gradient="bg-gradient-to-br from-orange-500 to-amber-600"
          />
        </div>

        {/* Secondary Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SecondaryCard
            icon={Building2}
            title="Companies"
            value={reports.companies.total}
            subtitle="Registered companies"
            color="bg-blue-50 text-blue-600"
          />
          <SecondaryCard
            icon={Tags}
            title="Categories"
            value={reports.categories.total}
            subtitle="Job categories"
            color="bg-indigo-50 text-indigo-600"
          />
          <SecondaryCard
            icon={UserCheck}
            title="Recruiters"
            value={reports.users.recruiters}
            subtitle="Registered recruiters"
            color="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Jobs & Applications */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Jobs */}
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Activity size={18} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Job Overview
              </h2>
            </div>

            <div className="space-y-5">
              <ProgressBar
                label="Total Jobs"
                value={reports.jobs.total}
                total={reports.jobs.total}
                color={{
                  text: "text-blue-600",
                  bar: "bg-gradient-to-r from-blue-500 to-indigo-500",
                }}
              />
              <ProgressBar
                label="Active Jobs"
                value={reports.jobs.active}
                total={reports.jobs.total}
                color={{
                  text: "text-emerald-600",
                  bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
                }}
              />
              <ProgressBar
                label="Closed Jobs"
                value={reports.jobs.closed}
                total={reports.jobs.total}
                color={{
                  text: "text-rose-600",
                  bar: "bg-gradient-to-r from-rose-500 to-red-500",
                }}
              />
            </div>
          </div>

          {/* Applications */}
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <TrendingUp size={18} className="text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Application Overview
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Applied",
                  value: getApplicationCount("Applied"),
                  icon: FileText,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "Shortlisted",
                  value: getApplicationCount("Shortlisted"),
                  icon: Clock,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
                {
                  label: "Rejected",
                  value: getApplicationCount("Rejected"),
                  icon: XCircle,
                  color: "text-rose-600",
                  bg: "bg-rose-50",
                },
                {
                  label: "Hired",
                  value: getApplicationCount("Hired"),
                  icon: CheckCircle,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-200 hover:shadow-md"
                >
                  <div
                    className={`mb-3 inline-flex items-center gap-2 rounded-lg px-2 py-1 ${item.bg} ${item.color}`}
                  >
                    <item.icon size={14} />
                    <span className="text-xs font-semibold">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company & Category Status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Companies */}
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <Building2 size={18} className="text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Company Status
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Pending",
                  value: "pending",
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                  dot: "bg-amber-500",
                },
                {
                  label: "Approved",
                  value: "approved",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  dot: "bg-emerald-500",
                },
                {
                  label: "Rejected",
                  value: "rejected",
                  color: "text-rose-600",
                  bg: "bg-rose-50",
                  dot: "bg-rose-500",
                },
                {
                  label: "Blocked",
                  value: "blocked",
                  color: "text-slate-600",
                  bg: "bg-slate-50",
                  dot: "bg-slate-500",
                },
              ].map((row) => (
                <div
                  key={row.value}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${row.bg} transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${row.dot}`} />
                    <span className="text-sm font-medium text-slate-700">
                      {row.label}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${row.color}`}>
                    {getCompanyCount(row.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-50">
                <Tags size={18} className="text-fuchsia-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Category Status
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 transition-all hover:scale-[1.01]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Active
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  {getCategoryCount("active")}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition-all hover:scale-[1.01]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Inactive
                  </span>
                </div>
                <span className="text-lg font-bold text-slate-600">
                  {getCategoryCount("inactive")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;