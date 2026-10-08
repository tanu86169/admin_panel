import React, { useEffect, useMemo, useState } from "react";

import {
  Users,
  BriefcaseBusiness,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Award,
  RefreshCw,
  Download,
  ChevronDown,
  X,
  Mail,
  Phone,
  Building2,
  Search,
  Loader2,
  ShieldCheck,
  CalendarDays,
  Hash,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
  MapPin,
  Globe,
  Lock,
  Save,
} from "lucide-react";

// =====================================================
// API URLS
// =====================================================

const API_URL =
  "http://localhost/job_portal/job-portal-api/api/admin/recruiters.php";

const ADD_RECRUITER_URL =
  "http://localhost/job_portal/job-portal-api/api/admin/add-recruiter.php";

const UPDATE_RECRUITER_URL =
  "http://localhost/job_portal/job-portal-api/api/admin/update-recruiter.php";

const DELETE_RECRUITER_URL =
  "http://localhost/job_portal/job-portal-api/api/admin/delete-recruiter.php";

// =====================================================
// DEFAULT SUMMARY
// =====================================================

const DEFAULT_SUMMARY = {
  total_recruiters: 0,
  total_posts: 0,
  active_posts: 0,
  closed_posts: 0,
  total_applied: 0,
  interviews: 0,
  rejected: 0,
  selected: 0,
};

// =====================================================
// EMPTY FORM
// =====================================================

const EMPTY_FORM = {
  id: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  company_name: "",
  location: "",
  website: "",
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const AdminRecruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filterRecruiter, setFilterRecruiter] = useState("all");
  const [postStatusFilter, setPostStatusFilter] = useState("all");

  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  // Add/Edit Modal
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  // Delete
  const [deleteLoading, setDeleteLoading] = useState(false);

  // =====================================================
  // FETCH RECRUITERS
  // =====================================================

  const fetchRecruiters = async (refresh = false) => {
    try {
      setError("");

      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || `Server error: ${response.status}`
        );
      }

      const recruiterList = Array.isArray(data.recruiters)
        ? data.recruiters
        : [];

      setRecruiters(recruiterList);

      setSummary({
        ...DEFAULT_SUMMARY,
        ...(data.summary || {}),
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Unable to fetch recruiters.");
      setRecruiters([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  // =====================================================
  // SUCCESS MESSAGE
  // =====================================================

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  // =====================================================
  // STATUS COUNTS
  // =====================================================

  const statusCounts = useMemo(() => {
    return {
      all: recruiters.length,
      active: recruiters.filter((item) => Number(item.active_jobs) > 0)
        .length,
      closed: recruiters.filter((item) => Number(item.closed_jobs) > 0)
        .length,
    };
  }, [recruiters]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredRecruiters = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return recruiters.filter((item) => {
      const matchesSearch =
        !searchValue ||
        String(item.name || "").toLowerCase().includes(searchValue) ||
        String(item.email || "").toLowerCase().includes(searchValue) ||
        String(item.phone || "").toLowerCase().includes(searchValue) ||
        String(item.company_name || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesRecruiter =
        filterRecruiter === "all" ||
        String(item.id) === String(filterRecruiter);

      let matchesStatus = true;
      if (postStatusFilter === "active")
        matchesStatus = Number(item.active_jobs) > 0;
      if (postStatusFilter === "closed")
        matchesStatus = Number(item.closed_jobs) > 0;

      return matchesSearch && matchesRecruiter && matchesStatus;
    });
  }, [recruiters, search, filterRecruiter, postStatusFilter]);

  // =====================================================
  // DISPLAY SUMMARY
  // =====================================================

  const displaySummary = useMemo(() => {
    if (filterRecruiter === "all") return summary;

    const recruiter = recruiters.find(
      (item) => String(item.id) === String(filterRecruiter)
    );

    if (!recruiter) return summary;

    return {
      total_recruiters: 1,
      total_posts: Number(recruiter.total_jobs) || 0,
      active_posts: Number(recruiter.active_jobs) || 0,
      closed_posts: Number(recruiter.closed_jobs) || 0,
      total_applied: Number(recruiter.total_applications) || 0,
      interviews: Number(recruiter.interviews) || 0,
      rejected: Number(recruiter.rejected) || 0,
      selected: Number(recruiter.selected) || 0,
    };
  }, [summary, recruiters, filterRecruiter]);

  // =====================================================
  // GET JOB COUNT
  // =====================================================

  const getJobCount = (recruiter) => Number(recruiter?.total_jobs) || 0;

  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddRecruiter = () => {
    setEditMode(false);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditRecruiter = (recruiter) => {
    setEditMode(true);

    setForm({
      id: recruiter.id || "",
      name: recruiter.name || "",
      email: recruiter.email || "",
      phone: recruiter.phone || "",
      password: "",
      company_name: recruiter.company_name || "",
      location: recruiter.location || "",
      website: recruiter.website || "",
    });

    setError("");
    setShowForm(true);
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password;

    if (!name) return "Recruiter name is required.";
    if (!email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email.";
    if (!phone) return "Phone number is required.";
    if (!/^[0-9]{10}$/.test(phone))
      return "Phone number must contain exactly 10 digits.";
    if (!editMode && !password) return "Password is required.";
    if (password && password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.website.trim() && !/^https?:\/\/.+/i.test(form.website.trim()))
      return "Website must start with http:// or https://";

    return "";
  };

  // =====================================================
  // ADD / UPDATE RECRUITER
  // =====================================================

  const handleSubmitRecruiter = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company_name: form.company_name.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
      };

      if (form.password.trim()) payload.password = form.password.trim();

      if (editMode) {
        payload.id = Number(form.id);
        payload.recruiter_id = Number(form.id);
      }

      const url = editMode ? UPDATE_RECRUITER_URL : ADD_RECRUITER_URL;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to save recruiter.");
      }

      setShowForm(false);
      setForm(EMPTY_FORM);

      showSuccessMessage(
        data.message ||
          (editMode
            ? "Recruiter updated successfully."
            : "Recruiter added successfully.")
      );

      await fetchRecruiters(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Unable to save recruiter.");
    } finally {
      setFormLoading(false);
    }
  };

  // =====================================================
  // DELETE RECRUITER
  // =====================================================

  const handleDeleteRecruiter = async (recruiter) => {
    if (!recruiter?.id) {
      alert("Recruiter ID not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${recruiter.name || "this recruiter"}?\n\n` +
        `Recruiter ID: #${recruiter.id}\n` +
        `Jobs Posted: ${getJobCount(recruiter)}\n\n` +
        `This will also remove related recruiter data.`
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      setError("");

      const response = await fetch(DELETE_RECRUITER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: Number(recruiter.id),
          recruiter_id: Number(recruiter.id),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete recruiter.");
      }

      setSelectedRecruiter(null);

      showSuccessMessage(
        data.message || "Recruiter deleted successfully."
      );

      await fetchRecruiters(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Unable to delete recruiter.");
      alert(err?.message || "Unable to delete recruiter.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // =====================================================
  // CSV EXPORT
  // =====================================================

  const exportCSV = () => {
    const headers = [
      "Recruiter",
      "Email",
      "Phone",
      "Company",
      "Jobs Posted",
      "Active",
      "Closed",
      "Total Applied",
      "Interviews",
      "Rejected",
      "Selected",
    ];

    const rows = filteredRecruiters.map((recruiter) => [
      recruiter.name || "",
      recruiter.email || "",
      recruiter.phone || "",
      recruiter.company_name || "",
      recruiter.total_jobs || 0,
      recruiter.active_jobs || 0,
      recruiter.closed_jobs || 0,
      recruiter.total_applications || 0,
      recruiter.interviews || 0,
      recruiter.rejected || 0,
      recruiter.selected || 0,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "recruiter-analytics.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // STATUS FILTER BUTTON
  // =====================================================

  const StatusFilterButton = ({ value, label, count }) => {
    const active = postStatusFilter === value;

    return (
      <button
        type="button"
        onClick={() => setPostStatusFilter(value)}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition ${
          active
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        {label}
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  // =====================================================
  // SUMMARY CARDS
  // =====================================================

  const cards = [
    {
      title: "TOTAL POSTS",
      value: displaySummary.total_posts,
      subtitle: "Posted by recruiters",
      icon: BriefcaseBusiness,
      iconClass: "text-blue-600 bg-blue-50 border-blue-100",
      valueClass: "text-slate-900",
    },
    {
      title: "ACTIVE POSTS",
      value: displaySummary.active_posts,
      subtitle: "Open for applications",
      icon: CheckCircle2,
      iconClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
      valueClass: "text-emerald-600",
    },
    {
      title: "CLOSED POSTS",
      value: displaySummary.closed_posts,
      subtitle: "Closed / archived",
      icon: XCircle,
      iconClass: "text-slate-500 bg-slate-100 border-slate-200",
      valueClass: "text-slate-700",
    },
    {
      title: "TOTAL APPLIED",
      value: displaySummary.total_applied,
      subtitle: "Candidate applications",
      icon: Users,
      iconClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
      valueClass: "text-indigo-600",
    },
    {
      title: "INTERVIEWS",
      value: displaySummary.interviews,
      subtitle: "Interview stage",
      icon: UserCheck,
      iconClass: "text-amber-600 bg-amber-50 border-amber-100",
      valueClass: "text-amber-600",
    },
    {
      title: "REJECTED",
      value: displaySummary.rejected,
      subtitle: "Applications rejected",
      icon: UserX,
      iconClass: "text-rose-600 bg-rose-50 border-rose-100",
      valueClass: "text-rose-600",
    },
    {
      title: "SELECTED",
      value: displaySummary.selected,
      subtitle: "Selected / hired",
      icon: Award,
      iconClass: "text-cyan-600 bg-cyan-50 border-cyan-100",
      valueClass: "text-cyan-600",
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 p-3 text-slate-800 sm:p-4 md:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-[1500px]">
        {/* =================================================
            TOP ACTION BAR
        ================================================= */}

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0 flex-1">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recruiter name, email, phone, company..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={openAddRecruiter}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 sm:flex-none sm:px-4 sm:text-sm"
            >
              <Plus size={17} />
              <span>Add Recruiter</span>
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 sm:flex-none sm:px-3.5 sm:text-sm"
            >
              <Download size={16} />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => fetchRecruiters(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 sm:px-3.5 sm:text-sm"
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

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* =================================================
            MASTER ADMIN
        ================================================= */}

        <div className="mb-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
              <BriefcaseBusiness size={22} className="text-blue-600" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  Portal Master Admin
                </h2>
                <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {filterRecruiter === "all"
                    ? "All Recruiters View"
                    : "Filtered Recruiter View"}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>{summary.total_recruiters} Recruiters Registered</span>
                <span>{summary.total_posts} Assigned Posts</span>
                <span>{summary.total_applied} Candidate Applications</span>
              </div>
            </div>
          </div>

          <div className="relative w-full lg:max-w-[280px]">
            <select
              value={filterRecruiter}
              onChange={(e) => setFilterRecruiter(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">
                All Recruiters ({recruiters.length})
              </option>
              {recruiters.map((recruiter) => (
                <option key={recruiter.id} value={recruiter.id}>
                  {recruiter.name || "Unnamed Recruiter"}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold">Recruiter Error</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-[10px] font-semibold tracking-wider text-slate-500">
                    {card.title}
                  </p>
                  <div
                    className={`rounded-lg border p-1.5 ${card.iconClass}`}
                  >
                    <Icon size={14} />
                  </div>
                </div>
                <p
                  className={`mt-2 text-xl font-bold sm:text-2xl ${card.valueClass}`}
                >
                  {card.value ?? 0}
                </p>
                <p className="mt-2 truncate text-[10px] text-slate-400">
                  {card.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* =================================================
            LOADING / TABLE
        ================================================= */}

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-16 shadow-sm">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="mt-3 text-sm text-slate-500">
              Loading recruiter analytics...
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* TABLE HEADER */}

            <div className="border-b border-slate-200 p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                      Recruiters Performance & Activity Roster
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Manage recruiter activity and job performance.
                  </p>
                </div>

                <div className="flex w-fit items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <StatusFilterButton
                    value="all"
                    label="All"
                    count={statusCounts.all}
                  />
                  <StatusFilterButton
                    value="active"
                    label="Active"
                    count={statusCounts.active}
                  />
                  <StatusFilterButton
                    value="closed"
                    label="Closed"
                    count={statusCounts.closed}
                  />
                </div>
              </div>
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    <th className="px-4 py-3">Recruiter</th>
                    <th className="px-3 py-3 text-center">Jobs</th>
                    <th className="px-3 py-3 text-center">Applied</th>
                    <th className="px-3 py-3 text-center">Interview</th>
                    <th className="px-3 py-3 text-center">Rejected</th>
                    <th className="px-3 py-3 text-center">Selected</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRecruiters.map((recruiter) => {
                    const jobCount = getJobCount(recruiter);
                    return (
                      <tr key={recruiter.id} className="hover:bg-slate-50">
                        {/* RECRUITER */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                              {recruiter.name?.charAt(0)?.toUpperCase() ||
                                "R"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {recruiter.name || "N/A"}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {recruiter.email || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* JOBS */}
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
                            <BriefcaseBusiness size={13} />
                            {jobCount}
                          </span>
                        </td>

                        {/* APPLIED */}
                        <td className="px-3 py-3 text-center font-bold text-indigo-600">
                          {Number(recruiter.total_applications) || 0}
                        </td>

                        {/* INTERVIEW */}
                        <td className="px-3 py-3 text-center font-bold text-amber-600">
                          {Number(recruiter.interviews) || 0}
                        </td>

                        {/* REJECTED */}
                        <td className="px-3 py-3 text-center font-bold text-rose-600">
                          {Number(recruiter.rejected) || 0}
                        </td>

                        {/* SELECTED */}
                        <td className="px-3 py-3 text-center font-bold text-cyan-600">
                          {Number(recruiter.selected) || 0}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedRecruiter(recruiter)}
                              className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              <Eye size={12} />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditRecruiter(recruiter)}
                              className="rounded-md border border-amber-200 bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteRecruiter(recruiter)}
                              disabled={deleteLoading}
                              className="rounded-md border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* EMPTY */}

            {filteredRecruiters.length === 0 && (
              <div className="p-12 text-center text-sm text-slate-500">
                No recruiter found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editMode ? "Edit Recruiter" : "Add New Recruiter"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {editMode
                    ? "Update recruiter information."
                    : "Create a new recruiter account."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitRecruiter}
              className="space-y-5 p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Recruiter Name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  icon={Users}
                  placeholder="Enter recruiter name"
                  required
                />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  icon={Mail}
                  placeholder="recruiter@example.com"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setForm((prev) => ({ ...prev, phone: value }));
                  }}
                  icon={Phone}
                  placeholder="10 digit mobile"
                  required
                />
                <FormInput
                  label={
                    editMode ? "New Password (optional)" : "Password"
                  }
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                  icon={Lock}
                  placeholder={
                    editMode
                      ? "Leave blank to keep old password"
                      : "Minimum 6 characters"
                  }
                  required={!editMode}
                />
              </div>

              <FormInput
                label="Company Name"
                name="company_name"
                value={form.company_name}
                onChange={handleFormChange}
                icon={Building2}
                placeholder="Company name"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  icon={MapPin}
                  placeholder="Lucknow, Noida..."
                />
                <FormInput
                  label="Website"
                  name="website"
                  value={form.website}
                  onChange={handleFormChange}
                  icon={Globe}
                  placeholder="https://company.com"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={formLoading}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editMode ? "Update Recruiter" : "Add Recruiter"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm">
          <div className="my-auto max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Recruiter Complete Analytics
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  #{selectedRecruiter.id} - {selectedRecruiter.name || "N/A"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecruiter(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* CONTACT */}

              <div className="grid gap-3 md:grid-cols-3">
                <InfoBox
                  icon={Mail}
                  label="Email"
                  value={selectedRecruiter.email}
                />
                <InfoBox
                  icon={Phone}
                  label="Phone"
                  value={selectedRecruiter.phone}
                />
                <InfoBox
                  icon={Building2}
                  label="Company"
                  value={selectedRecruiter.company_name}
                />
              </div>

              {/* BASIC */}

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBox
                  icon={Hash}
                  label="Recruiter ID"
                  value={selectedRecruiter.id}
                />
                <InfoBox
                  icon={CalendarDays}
                  label="Created At"
                  value={selectedRecruiter.created_at}
                />
              </div>

              {/* STATS */}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <ModalStat
                  label="Total Jobs"
                  value={selectedRecruiter.total_jobs}
                />
                <ModalStat
                  label="Active"
                  value={selectedRecruiter.active_jobs}
                  valueClass="text-emerald-600"
                />
                <ModalStat
                  label="Closed"
                  value={selectedRecruiter.closed_jobs}
                />
                <ModalStat
                  label="Applied"
                  value={selectedRecruiter.total_applications}
                  valueClass="text-indigo-600"
                />
                <ModalStat
                  label="Unique Candidates"
                  value={selectedRecruiter.unique_candidates}
                />
                <ModalStat
                  label="Interviews"
                  value={selectedRecruiter.interviews}
                  valueClass="text-amber-600"
                />
                <ModalStat
                  label="Rejected"
                  value={selectedRecruiter.rejected}
                  valueClass="text-rose-600"
                />
                <ModalStat
                  label="Selected"
                  value={selectedRecruiter.selected}
                  valueClass="text-cyan-600"
                />
              </div>

              {/* JOB BREAKDOWN */}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Job / Position Breakdown
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Jobs posted by this recruiter.
                    </p>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                    {selectedRecruiter.total_jobs} Jobs
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-slate-50">
                      <tr className="text-xs text-slate-500">
                        <th className="p-4 text-left">Job Title</th>
                        <th className="p-4 text-center">Positions</th>
                        <th className="p-4 text-center">Total</th>
                        <th className="p-4 text-center">Active</th>
                        <th className="p-4 text-center">Closed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(selectedRecruiter.job_breakdown) &&
                      selectedRecruiter.job_breakdown.length > 0 ? (
                        selectedRecruiter.job_breakdown.map((job, index) => (
                          <tr
                            key={`${job.name}-${index}`}
                            className="border-t border-slate-100"
                          >
                            <td className="p-4 text-sm font-medium">
                              {job.name || "N/A"}
                            </td>
                            <td className="p-4 text-center">
                              <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600">
                                {Number(job.vacancies) || 0}
                              </span>
                            </td>
                            <td className="p-4 text-center font-bold">
                              {Number(job.total) || 0}
                            </td>
                            <td className="p-4 text-center font-bold text-emerald-600">
                              {Number(job.active) || 0}
                            </td>
                            <td className="p-4 text-center font-bold text-slate-500">
                              {Number(job.closed) || 0}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="p-8 text-center text-sm text-slate-400"
                          >
                            No jobs posted.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedRecruiter(null)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
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

// =====================================================
// FORM INPUT
// =====================================================

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  icon: Icon,
  required = false,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
};

// =====================================================
// INFO BOX
// =====================================================

const InfoBox = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <Icon size={18} className="mt-1 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-all text-sm font-medium text-slate-800">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
};

// =====================================================
// MODAL STAT
// =====================================================

const ModalStat = ({
  label,
  value,
  valueClass = "text-slate-900",
}) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{value ?? 0}</p>
    </div>
  );
};

export default AdminRecruiters;