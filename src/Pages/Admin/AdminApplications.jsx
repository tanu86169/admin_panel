import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Mail,
  Phone,
  BriefcaseBusiness,
  Building2,
  MapPin,
  CalendarDays,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock3,
  Users,
  ChevronDown,
  AlertCircle,
  Edit3,
  Trash2,
  Plus,
  FileText,
  Upload,
} from "lucide-react";

const API_BASE = "http://localhost/job_portal/job-portal-api";
const API_URL = `${API_BASE}/api/admin/applications.php`;

const STATUS_LIST = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Hired",
  "Rejected",
];

const getInitialForm = () => ({
  candidate_id: "",
  job_id: "",
  status: "Applied",
  applied_at: "",
  cover_letter: "",
  interview_date: "",
  interview_note: "",
  resume: null,
});

const getTime = (value) => {
  if (!value) return 0;
  const time = new Date(String(value).replace(" ", "T")).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const getGroupKey = (application) => {
  if (application.candidate_id) {
    return `id-${application.candidate_id}`;
  }
  if (application.candidate_email) {
    return `email-${String(application.candidate_email)
      .toLowerCase()
      .trim()}`;
  }
  return `app-${application.application_id}`;
};

const groupApplications = (list) => {
  const map = new Map();

  list.forEach((application) => {
    const key = getGroupKey(application);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(application);
  });

  return Array.from(map.entries()).map(([key, items]) => {
    const sorted = [...items].sort((a, b) => {
      const dateDifference = getTime(b.applied_at) - getTime(a.applied_at);
      if (dateDifference === 0) {
        return (
          Number(b.application_id || 0) - Number(a.application_id || 0)
        );
      }
      return dateDifference;
    });

    return {
      ...sorted[0],
      key,
      applications: sorted,
      totalApplications: sorted.length,
    };
  });
};

const StatCard = ({ title, value, icon, iconBg, iconColor, border }) => (
  <div
    className={`bg-white border ${border} rounded-2xl p-4 shadow-sm flex items-center justify-between`}
  >
    <div>
      <p className="text-[10px] font-bold tracking-wider text-slate-400 mb-1">
        {title}
      </p>
      <h3 className="text-xl font-bold text-slate-800">{value}</h3>
    </div>
    <div
      className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}
    >
      {icon}
    </div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-1">
      {icon}
      {label}
    </div>
    <p className="text-xs font-semibold text-slate-700 break-words">
      {value || "N/A"}
    </p>
  </div>
);

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formDataLoading, setFormDataLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedKey, setSelectedKey] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editingApplication, setEditingApplication] = useState(null);
  const [form, setForm] = useState(getInitialForm());
  const [removeResume, setRemoveResume] = useState(false);

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const fetchApplications = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load applications.");
      }

      setApplications(
        Array.isArray(data.applications) ? data.applications : []
      );
    } catch (err) {
      console.error("Applications API Error:", err);
      setApplications([]);
      setError(err.message || "Unable to connect to Applications API.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchApplicationFormData = async () => {
    try {
      setFormDataLoading(true);

      const response = await fetch(`${API_URL}?action=form-data`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load candidates and jobs.");
      }

      setCandidates(Array.isArray(data.candidates) ? data.candidates : []);
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      console.error("Application Form Data Error:", err);
      alert(err.message || "Unable to load candidates and jobs.");
    } finally {
      setFormDataLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchApplicationFormData();
  }, []);

  const toDateTimeLocal = (value) => {
    if (!value) return "";
    return String(value).replace(" ", "T").slice(0, 16);
  };

  const handleOpenAddModal = async () => {
    setFormMode("add");
    setEditingApplication(null);
    setForm(getInitialForm());
    setRemoveResume(false);
    setShowFormModal(true);

    if (candidates.length === 0 || jobs.length === 0) {
      await fetchApplicationFormData();
    }
  };

  const handleOpenEditModal = async (application) => {
    setFormMode("edit");
    setEditingApplication(application);
    setRemoveResume(false);

    setForm({
      candidate_id: application.candidate_id
        ? String(application.candidate_id)
        : "",
      job_id: application.job_id ? String(application.job_id) : "",
      status: application.status || "Applied",
      applied_at: toDateTimeLocal(application.applied_at),
      cover_letter: application.cover_letter || "",
      interview_date: toDateTimeLocal(application.interview_date),
      interview_note: application.interview_note || "",
      resume: null,
    });

    setShowFormModal(true);

    if (candidates.length === 0 || jobs.length === 0) {
      await fetchApplicationFormData();
    }
  };

  const handleCloseFormModal = () => {
    if (saving) return;

    setShowFormModal(false);
    setFormMode("add");
    setEditingApplication(null);
    setRemoveResume(false);
    setForm(getInitialForm());
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "resume") {
      setForm((prev) => ({
        ...prev,
        resume: files?.[0] || null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateResume = () => {
    if (!form.resume) return true;

    const extension = form.resume.name.toLowerCase().split(".").pop();

    if (!["pdf", "doc", "docx"].includes(extension)) {
      alert("Only PDF, DOC and DOCX resume files are allowed.");
      return false;
    }

    if (form.resume.size > 5 * 1024 * 1024) {
      alert("Resume size must be less than 5MB.");
      return false;
    }

    return true;
  };

  const handleSaveApplication = async (e) => {
    e.preventDefault();

    if (!form.candidate_id) return alert("Please select a candidate.");
    if (!form.job_id) return alert("Please select a job.");
    if (!form.status) return alert("Please select application status.");
    if (!validateResume()) return;

    if (formMode === "edit" && !editingApplication?.application_id) {
      alert("Application ID is missing.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("candidate_id", String(form.candidate_id));
      formData.append("job_id", String(form.job_id));
      formData.append("status", form.status);
      formData.append("applied_at", form.applied_at || "");
      formData.append("cover_letter", form.cover_letter || "");
      formData.append("interview_date", form.interview_date || "");
      formData.append("interview_note", form.interview_note || "");

      if (form.resume) {
        formData.append("resume", form.resume);
      }

      if (formMode === "edit") {
        formData.append("remove_resume", removeResume ? "1" : "0");
        formData.append(
          "application_id",
          String(editingApplication.application_id)
        );
      }

      const url =
        formMode === "edit" ? `${API_URL}?action=update` : API_URL;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save application.");
      }

      setShowFormModal(false);
      setEditingApplication(null);
      setForm(getInitialForm());
      setRemoveResume(false);

      await fetchApplications(true);

      alert(
        formMode === "edit"
          ? "Application updated successfully."
          : "Application added successfully."
      );
    } catch (err) {
      console.error("Save Application Error:", err);
      alert(err.message || "Error saving application.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewApplication = (group) => setSelectedKey(group.key);

  const handleDeleteApplication = async (applicationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?\n\nThis action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setDeletingId(applicationId);

      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ application_id: applicationId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete application.");
      }

      setApplications((prev) =>
        prev.filter(
          (application) =>
            String(application.application_id) !== String(applicationId)
        )
      );

      alert("Application deleted successfully.");
    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.message || "Error deleting application.");
    } finally {
      setDeletingId(null);
    }
  };

  const allGroups = useMemo(
    () => groupApplications(applications),
    [applications]
  );

  const filteredGroups = useMemo(() => {
    const value = search.toLowerCase().trim();

    return allGroups.filter((group) => {
      const candidateName = String(group.candidate_name || "").toLowerCase();
      const candidateEmail = String(group.candidate_email || "").toLowerCase();
      const candidatePhone = String(group.candidate_phone || "").toLowerCase();

      const matchesCandidate =
        candidateName.includes(value) ||
        candidateEmail.includes(value) ||
        candidatePhone.includes(value);

      const matchesAnyJob = group.applications.some((application) => {
        const jobTitle = String(application.job_title || "").toLowerCase();
        const companyName = String(
          application.company_name || ""
        ).toLowerCase();

        return jobTitle.includes(value) || companyName.includes(value);
      });

      const matchesSearch = !value || matchesCandidate || matchesAnyJob;

      const latestStatus = String(group.status || "Applied").toLowerCase();

      const matchesStatus =
        statusFilter === "All" ||
        latestStatus === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [allGroups, search, statusFilter]);

  const selectedApplication = useMemo(() => {
    if (!selectedKey) return null;
    return allGroups.find((group) => group.key === selectedKey) || null;
  }, [selectedKey, allGroups]);

  const stats = useMemo(() => {
    const getCount = (status) =>
      applications.filter(
        (application) =>
          String(application.status || "Applied").toLowerCase() ===
          status.toLowerCase()
      ).length;

    return {
      total: applications.length,
      applied: getCount("Applied"),
      screening: getCount("Screening"),
      shortlisted: getCount("Shortlisted"),
      interview: getCount("Interview"),
      rejected: getCount("Rejected"),
    };
  }, [applications]);

  const getStatusBadge = (status) => {
    switch (String(status || "Applied").toLowerCase()) {
      case "screening":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "shortlisted":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "interview":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "hired":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "rejected":
        return "bg-rose-50 text-rose-600 border-rose-200";
      default:
        return "bg-amber-50 text-amber-600 border-amber-200";
    }
  };

  const getStatusDot = (status) => {
    switch (String(status || "Applied").toLowerCase()) {
      case "screening":
        return "bg-blue-500";
      case "shortlisted":
        return "bg-emerald-500";
      case "interview":
        return "bg-purple-500";
      case "hired":
        return "bg-indigo-500";
      case "rejected":
        return "bg-rose-500";
      default:
        return "bg-amber-500";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(String(date).replace(" ", "T"));
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(String(date).replace(" ", "T"));
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitial = (name) =>
    name ? name.trim().charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* TOP ACTION BAR */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg md:text-xl">
              Applications Directory
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
              {filteredGroups.length} candidate
              {filteredGroups.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleOpenAddModal}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 sm:flex-none sm:px-4 sm:text-sm"
            >
              <Plus size={17} />
              <span>Add Application</span>
            </button>

            <button
              onClick={() => fetchApplications(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-60 sm:px-3.5 sm:text-sm"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin text-blue-600" : ""}
              />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-5 grid grid-cols-2 gap-3.5 sm:mb-6 md:grid-cols-3 xl:grid-cols-6">
          <StatCard title="TOTAL APPLICATIONS" value={stats.total} icon={<Users size={17} />} iconBg="bg-indigo-50" iconColor="text-indigo-600" border="border-indigo-100" />
          <StatCard title="APPLIED" value={stats.applied} icon={<Clock3 size={17} />} iconBg="bg-amber-50" iconColor="text-amber-600" border="border-amber-100" />
          <StatCard title="SCREENING" value={stats.screening} icon={<Search size={17} />} iconBg="bg-blue-50" iconColor="text-blue-600" border="border-blue-100" />
          <StatCard title="SHORTLISTED" value={stats.shortlisted} icon={<CheckCircle2 size={17} />} iconBg="bg-emerald-50" iconColor="text-emerald-600" border="border-emerald-100" />
          <StatCard title="INTERVIEW" value={stats.interview} icon={<CalendarDays size={17} />} iconBg="bg-purple-50" iconColor="text-purple-600" border="border-purple-100" />
          <StatCard title="REJECTED" value={stats.rejected} icon={<XCircle size={17} />} iconBg="bg-rose-50" iconColor="text-rose-600" border="border-rose-100" />
        </div>

        {/* SEARCH / FILTER */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, job or company..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-xs font-medium outline-none focus:border-blue-500 lg:w-48"
              >
                <option value="All">All Statuses</option>
                {STATUS_LIST.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex h-11 items-center justify-center whitespace-nowrap rounded-xl border border-blue-100 bg-blue-50 px-4 text-xs font-semibold text-blue-600">
              {filteredGroups.length} Candidates
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <AlertCircle size={19} className="mt-0.5 text-rose-500" />
            <div>
              <p className="text-xs font-semibold text-rose-800">
                Unable to load applications
              </p>
              <p className="mt-0.5 text-[11px] text-rose-600">{error}</p>
              <button
                onClick={() => fetchApplications()}
                className="mt-2 text-xs font-semibold text-rose-700 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 shadow-sm">
            <Loader2 size={26} className="animate-spin text-blue-600" />
            <p className="mt-4 text-xs font-semibold text-slate-500">
              Loading applications...
            </p>
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Candidate", "Latest Job", "Company", "Applied Date", "Latest Status", "Actions"].map((heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-500 ${heading === "Actions" ? "text-center" : ""}`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-slate-400">
                        <BriefcaseBusiness size={28} className="mx-auto mb-3 text-slate-300" />
                        <p className="font-semibold">No applications found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => {
                      const latest = group;
                      const isDeleting =
                        String(deletingId) === String(latest.application_id);

                      return (
                        <tr key={group.key} className="hover:bg-slate-50/80">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 font-bold text-purple-600">
                                {getInitial(group.candidate_name)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800">
                                  {group.candidate_name || "Unknown Candidate"}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {group.candidate_email || "No email"}
                                </p>
                                {group.totalApplications > 1 && (
                                  <p className="mt-1 text-[10px] font-semibold text-blue-600">
                                    {group.totalApplications} total applications
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-start gap-2">
                              <BriefcaseBusiness size={14} className="mt-0.5 shrink-0 text-blue-500" />
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {latest.job_title || "Job Not Available"}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Job ID: #{latest.job_id || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-start gap-2">
                              <Building2 size={14} className="mt-0.5 shrink-0 text-indigo-500" />
                              <div>
                                <p className="font-medium text-slate-700">
                                  {latest.company_name || "N/A"}
                                </p>
                                {latest.location && (
                                  <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                                    <MapPin size={11} />
                                    {latest.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <CalendarDays size={13} />
                              {formatDate(latest.applied_at)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusBadge(latest.status)}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(latest.status)}`} />
                              {latest.status || "Applied"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                title="View all applications"
                                onClick={() => handleViewApplication(group)}
                                className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                title="Edit latest application"
                                onClick={() => handleOpenEditModal(latest)}
                                className="rounded-lg border border-purple-100 bg-purple-50 p-2 text-purple-600 hover:bg-purple-100"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                title="Delete latest application"
                                disabled={isDeleting}
                                onClick={() => handleDeleteApplication(latest.application_id)}
                                className="rounded-lg border border-rose-100 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                  {formMode === "edit" ? <Edit3 size={18} /> : <Plus size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {formMode === "edit" ? "Edit Application" : "Add Application"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {formMode === "edit"
                      ? "Update application information."
                      : "Create a new candidate application."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseFormModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-5 p-6">
              {formDataLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-600">
                  <Loader2 size={15} className="animate-spin" />
                  Loading candidates and jobs...
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Candidate *
                  </label>
                  <div className="relative">
                    <select
                      name="candidate_id"
                      value={form.candidate_id}
                      onChange={handleFormChange}
                      disabled={formDataLoading}
                      required
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-10 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="">Select Candidate</option>
                      {candidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name || "Unnamed Candidate"}
                          {candidate.email ? ` - ${candidate.email}` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Job *
                  </label>
                  <div className="relative">
                    <select
                      name="job_id"
                      value={form.job_id}
                      onChange={handleFormChange}
                      disabled={formDataLoading}
                      required
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-10 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="">Select Job</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.job_title || "Untitled Job"} - {job.company_name || "Company N/A"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {form.job_id && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  {(() => {
                    const selectedJob = jobs.find(
                      (job) => String(job.id) === String(form.job_id)
                    );
                    if (!selectedJob) return null;
                    return (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <InfoItem icon={<BriefcaseBusiness size={14} />} label="Job" value={selectedJob.job_title} />
                        <InfoItem icon={<Building2 size={14} />} label="Company" value={selectedJob.company_name} />
                        <InfoItem icon={<MapPin size={14} />} label="Location" value={selectedJob.location} />
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Application Status *
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      required
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-10 text-xs outline-none focus:border-blue-500"
                    >
                      {STATUS_LIST.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Applied Date
                  </label>
                  <input
                    type="datetime-local"
                    name="applied_at"
                    value={form.applied_at}
                    onChange={handleFormChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Empty = current date/time
                  </p>
                </div>
              </div>

              {/* RESUME */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Resume
                </label>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Upload size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <input
                        type="file"
                        name="resume"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFormChange}
                        className="w-full text-xs text-slate-600"
                      />
                      <p className="mt-1 text-[10px] text-slate-400">
                        PDF, DOC or DOCX • Max 5MB
                      </p>
                      {form.resume && (
                        <p className="mt-2 truncate text-[11px] font-medium text-blue-600">
                          Selected: {form.resume.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {formMode === "edit" &&
                    (editingApplication?.resume_url || editingApplication?.resume) && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <FileText size={16} className="shrink-0 text-blue-600" />
                            <span className="truncate text-xs text-slate-600">
                              Existing Resume
                            </span>
                          </div>
                          {editingApplication.resume_url && (
                            <a
                              href={editingApplication.resume_url}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 text-xs font-semibold text-blue-600 hover:underline"
                            >
                              View
                            </a>
                          )}
                        </div>

                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-rose-600">
                          <input
                            type="checkbox"
                            checked={removeResume}
                            onChange={(e) => setRemoveResume(e.target.checked)}
                            className="accent-rose-600"
                          />
                          Remove current resume
                        </label>
                      </div>
                    )}
                </div>
              </div>

              {/* COVER LETTER */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Cover Letter
                </label>
                <textarea
                  name="cover_letter"
                  value={form.cover_letter}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="Enter candidate cover letter..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* INTERVIEW */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <h4 className="mb-4 text-sm font-bold text-slate-900">
                  Interview Information
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Interview Date
                    </label>
                    <input
                      type="datetime-local"
                      name="interview_date"
                      value={form.interview_date}
                      onChange={handleFormChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Interview Note
                    </label>
                    <input
                      type="text"
                      name="interview_note"
                      value={form.interview_note}
                      onChange={handleFormChange}
                      placeholder="Interview note..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  disabled={saving}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || formDataLoading}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {formMode === "edit" ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                      {formMode === "edit" ? "Update Application" : "Add Application"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ALL APPLICATIONS FOR SELECTED CANDIDATE */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Candidate Applications
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedApplication.candidate_name || "Unknown Candidate"} ·{" "}
                    {selectedApplication.applications.length}{" "}
                    {selectedApplication.applications.length === 1
                      ? "application"
                      : "applications"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedKey(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto p-6">
              {/* CANDIDATE DETAILS */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 font-bold text-purple-600">
                    {getInitial(selectedApplication.candidate_name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {selectedApplication.candidate_name || "Unknown Candidate"}
                    </h4>
                    <p className="text-[11px] text-slate-500">Candidate</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoItem icon={<Mail size={14} />} label="Email" value={selectedApplication.candidate_email} />
                  <InfoItem icon={<Phone size={14} />} label="Phone" value={selectedApplication.candidate_phone} />
                </div>
              </div>

              {/* EVERY APPLICATION FOR THIS CANDIDATE */}
              <div className="space-y-3">
                {selectedApplication.applications.map((application) => {
                  const isDeleting =
                    String(deletingId) === String(application.application_id);

                  return (
                    <section
                      key={application.application_id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {application.job_title || "Job Not Available"}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            {application.company_name || "Company N/A"} · Job #
                            {application.job_id || "N/A"}
                          </p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadge(application.status)}`}>
                          {application.status || "Applied"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoItem icon={<MapPin size={14} />} label="Location" value={application.location} />
                        <InfoItem icon={<CalendarDays size={14} />} label="Applied Date" value={formatDateTime(application.applied_at)} />
                        <InfoItem icon={<CalendarDays size={14} />} label="Interview Date" value={formatDateTime(application.interview_date)} />
                        <InfoItem icon={<FileText size={14} />} label="Interview Note" value={application.interview_note} />
                      </div>

                      {application.resume_url && (
                        <a
                          href={application.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600"
                        >
                          <FileText size={14} />
                          View Resume
                        </a>
                      )}

                      {application.cover_letter && (
                        <div className="mt-3 rounded-lg bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-500">
                            Cover Letter
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedKey(null);
                            handleOpenEditModal(application);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteApplication(application.application_id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setSelectedKey(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;