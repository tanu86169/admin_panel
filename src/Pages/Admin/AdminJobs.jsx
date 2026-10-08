import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Download,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Eye,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  UserRound,
  Mail,
  Phone,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  GraduationCap,
  IndianRupee,
  Upload,
  ChevronDown,
  ExternalLink,
  AlertCircle,
  Loader2,
  Filter,
  CircleDot,
} from "lucide-react";

const API_BASE = "http://localhost/job_portal/job-portal-api/api/admin";

const API_URL = `${API_BASE}/jobs.php`;
const RECRUITERS_URL = `${API_BASE}/jobs.php?action=recruiters`;
const CATEGORIES_URL = `${API_BASE}/categories.php`;

const JOB_TYPES = ["Full Time", "Part Time", "Internship", "Contract"];

const WORKPLACE_TYPES = ["On-site", "Remote", "Hybrid"];

const JOB_STATUSES = ["active", "closed", "draft", "suspended"];

const JOB_VIEW_EXCLUDED_FIELDS = new Set([
  "applications",
  "applied_count",
  "applications_count",
  "interview_count",
  "rejected_count",
  "hired_count",
  "selected_count",
  "recruiter_name",
  "recruiter_email",
  "recruiter_phone",
]);

const initialForm = {
  recruiter_id: "",
  job_title: "",
  position: "",
  company_name: "",
  location: "",
  vacancies: "",
  job_type: "",
  workplace_type: "",
  category: "",
  education: "",
  experience: "",
  salary: "",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: "",
  deadline: "",
  status: "active",
  positions: "",
  company_logo: null,
};

function formatDate(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();

  if (value === "active") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value === "closed") {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  if (value === "draft") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (value === "suspended") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-blue-50 text-blue-700 border-blue-200";
}

function getStatusIcon(status) {
  const value = String(status || "").toLowerCase();

  if (value === "active") return <CheckCircle2 size={14} />;
  if (value === "closed") return <XCircle size={14} />;
  if (value === "draft") return <Clock3 size={14} />;
  if (value === "suspended") return <AlertCircle size={14} />;

  return <CircleDot size={14} />;
}

function getJobStatus(job) {
  if (!job) return "";

  const values = [job.status, job.job_status, job.status_name, job.state];

  for (const value of values) {
    if (value !== null && value !== undefined) {
      const text = String(value).trim();
      if (text) return text;
    }
  }

  return "";
}

const SERVER_HOST = "http://localhost";
const SERVER_ROOT = "http://localhost/job_portal/job-portal-api";

function buildFileCandidates(value) {
  if (!value) return [];

  const text = String(value).trim().replace(/\\/g, "/");

  if (!text) return [];

  if (/^(https?:|blob:|data:)/i.test(text)) return [text];

  const clean = text.replace(/^(\.{1,2}\/)+/, "").replace(/^\/+/, "");

  const list = [];

  if (text.startsWith("/") || /^job_portal\//i.test(clean)) {
    list.push(`${SERVER_HOST}/${clean}`);
  }

  list.push(`${SERVER_ROOT}/${clean}`);

  if (!/^uploads\//i.test(clean)) {
    list.push(`${SERVER_ROOT}/uploads/${clean}`);
    list.push(`${SERVER_ROOT}/uploads/logos/${clean}`);
    list.push(`${SERVER_ROOT}/uploads/company_logos/${clean}`);
  }

  list.push(`${API_BASE}/${clean}`);

  return Array.from(new Set(list));
}

function buildLogoUrl(value) {
  return buildFileCandidates(value)[0] || "";
}

function buildResumeUrl(value) {
  return buildFileCandidates(value)[0] || "";
}

function LogoImage({ value, fallback = null, className = "", alt = "" }) {
  const candidates = useMemo(() => buildFileCandidates(value), [value]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [value]);

  if (!candidates.length || index >= candidates.length) return fallback;

  return (
    <img
      src={candidates[index]}
      alt={alt}
      className={className}
      onError={() => setIndex((prev) => prev + 1)}
    />
  );
}

function getInitials(name = "") {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((item) => item[0]?.toUpperCase())
      .join("") || "J"
  );
}

function getCategoryValue(job) {
  if (!job) return "";

  const rawCategory = job.category;

  if (rawCategory && typeof rawCategory === "object") {
    return String(
      rawCategory.name || rawCategory.title || rawCategory.label || "",
    ).trim();
  }

  const direct = [
    rawCategory,
    job.category_name,
    job.categoryName,
    job.job_category,
    job.category_title,
  ];

  for (const value of direct) {
    if (value !== null && value !== undefined) {
      const text = String(value).trim();
      if (text) return text;
    }
  }

  return "";
}

function normalizeJob(job) {
  if (!job || typeof job !== "object") return job;

  return {
    ...job,
    category: getCategoryValue(job),
  };
}

function showValue(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string" && value.trim() === "") {
    return "-";
  }

  return value;
}

function formatFieldLabel(value) {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/* -------------------------------------------------------
   Reusable Input
------------------------------------------------------- */

function Field({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  disabled = false,
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
}

/* -------------------------------------------------------
   Select
------------------------------------------------------- */

function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  required = false,
  includeUnlistedValue = true,
}) {
  const getOptionValue = (option) =>
    String(typeof option === "object" ? (option.value ?? "") : option);

  const currentValueExists = options.some(
    (option) => getOptionValue(option) === String(value ?? ""),
  );

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="">{placeholder}</option>

          {includeUnlistedValue && value && !currentValueExists && (
            <option value={value}>{value}</option>
          )}

          {options.map((option) => (
            <option key={getOptionValue(option)} value={getOptionValue(option)}>
              {typeof option === "object" ? option.label : option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Textarea
------------------------------------------------------- */

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  required = false,
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

/* -------------------------------------------------------
   Stat Card
------------------------------------------------------- */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass = "bg-blue-50 text-blue-600",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 truncate">
            {value}
          </h3>

          <p className="mt-1 text-xs text-slate-400 break-words">{subtitle}</p>
        </div>

        <div
          className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Main Component
------------------------------------------------------- */

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [recruiterFilter, setRecruiterFilter] = useState("all");

  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");

  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const [editingJob, setEditingJob] = useState(null);

  const [formData, setFormData] = useState({
    ...initialForm,
  });

  const [logoPreview, setLogoPreview] = useState("");

  /* -------------------------------------------------------
     Toast
  ------------------------------------------------------- */

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /* -------------------------------------------------------
     Fetch Jobs
  ------------------------------------------------------- */

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const json = await response.json();

      if (json.success !== true) {
        throw new Error(json.message || "Unable to load jobs.");
      }

      const data = Array.isArray(json.data) ? json.data : [];

      setJobs(data.map(normalizeJob));
    } catch (err) {
      console.error("Fetch jobs error:", err);

      const message =
        err instanceof TypeError
          ? "API connection failed. API URL aur CORS settings check karein."
          : err.message || "Unable to load jobs.";

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     Fetch Recruiters
  ------------------------------------------------------- */

  const fetchRecruiters = async () => {
    try {
      setLoadingRecruiters(true);

      const response = await fetch(RECRUITERS_URL);

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || "Unable to load recruiters.");
      }

      const data = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.recruiters)
            ? json.recruiters
            : [];

      setRecruiters(data);
    } catch (err) {
      console.error("Fetch recruiters error:", err);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  /* -------------------------------------------------------
     Fetch Categories
  ------------------------------------------------------- */

  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_URL);
      const json = await response.json();

      if (!response.ok || json?.success === false) {
        throw new Error(json?.message || "Unable to load categories.");
      }

      const data = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.categories)
            ? json.categories
            : [];

      setCategories(data);
    } catch (err) {
      console.error("Fetch categories error:", err);
      setCategories([]);
      showToast(err.message || "Unable to load categories.", "error");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchRecruiters();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------------------------------------
     Derived Data
  ------------------------------------------------------- */

  const stats = useMemo(() => {
    const total = jobs.length;

    const active = jobs.filter(
      (job) => getJobStatus(job).toLowerCase() === "active",
    ).length;

    const closed = jobs.filter(
      (job) => getJobStatus(job).toLowerCase() === "closed",
    ).length;

    const applications = jobs.reduce(
      (sum, job) =>
        sum + Number(job.applied_count || job.applications_count || 0),
      0,
    );

    const interviews = jobs.reduce(
      (sum, job) => sum + Number(job.interview_count || 0),
      0,
    );

    const selected = jobs.reduce(
      (sum, job) => sum + Number(job.hired_count || job.selected_count || 0),
      0,
    );

    return {
      total,
      active,
      closed,
      applications,
      interviews,
      selected,
    };
  }, [jobs]);

  const availableCategories = useMemo(() => {
    const values = categories
      .map((category) =>
        typeof category === "object"
          ? category.name || category.title || category.label
          : category,
      )
      .filter(Boolean);

    return Array.from(new Set(values));
  }, [categories]);

  const filteredJobs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !searchValue ||
        String(job.job_title || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(job.company_name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(job.location || "")
          .toLowerCase()
          .includes(searchValue) ||
        getCategoryValue(job).toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        getJobStatus(job).toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "all" || getCategoryValue(job) === categoryFilter;

      const matchesRecruiter =
        recruiterFilter === "all" ||
        String(job.recruiter_id || "") === String(recruiterFilter);

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesRecruiter
      );
    });
  }, [jobs, search, statusFilter, categoryFilter, recruiterFilter]);

  /* -------------------------------------------------------
     Form
  ------------------------------------------------------- */

  const resetForm = () => {
    setFormData({
      ...initialForm,
    });

    setEditingJob(null);
    setLogoPreview("");
  };

  const openAddModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEditModal = async (job) => {
    try {
      const response = await fetch(`${API_URL}?id=${job.id}`);
      const json = await response.json();

      if (!response.ok || json?.success === false) {
        throw new Error(json?.message || "Unable to load job for editing.");
      }

      const latestJob = normalizeJob(json?.data || json?.job || job);
      setEditingJob(latestJob);

      setFormData({
        recruiter_id: latestJob.recruiter_id ?? "",
        job_title: latestJob.job_title ?? "",
        position: latestJob.position ?? latestJob.job_title ?? "",
        company_name: latestJob.company_name ?? "",
        location: latestJob.location ?? "",
        vacancies: latestJob.vacancies ?? 1,
        job_type: latestJob.job_type ?? "Full Time",
        workplace_type: latestJob.workplace_type ?? "On-site",
        category: getCategoryValue(latestJob),
        education: latestJob.education ?? "",
        experience: latestJob.experience ?? "",
        salary: latestJob.salary ?? "",
        description: latestJob.description ?? "",
        responsibilities: latestJob.responsibilities ?? "",
        requirements: latestJob.requirements ?? "",
        skills: latestJob.skills ?? "",
        deadline: latestJob.deadline
          ? String(latestJob.deadline).slice(0, 10)
          : "",
        status: getJobStatus(latestJob) || "active",
        positions: latestJob.positions ?? latestJob.vacancies ?? 1,
        company_logo: null,
      });

      setLogoPreview(latestJob.company_logo || "");

      setShowFormModal(true);
    } catch (err) {
      showToast(err.message || "Unable to load job for editing.", "error");
    }
  };

  const closeFormModal = (force = false) => {
    if (saving && !force) return;

    setShowFormModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      company_logo: file,
    }));

    setLogoPreview(URL.createObjectURL(file));
  };

  /* -------------------------------------------------------
     Save Job
  ------------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.job_title.trim()) {
      showToast("Please enter job title.", "error");
      return;
    }

    if (!formData.company_name.trim()) {
      showToast("Please enter company name.", "error");
      return;
    }

    if (!formData.location.trim()) {
      showToast("Please enter job location.", "error");
      return;
    }

    if (!formData.recruiter_id) {
      showToast("Please select recruiter.", "error");
      return;
    }

    if (!formData.category) {
      showToast("Please select job category.", "error");
      return;
    }

    if (!formData.job_type) {
      showToast("Please select job type.", "error");
      return;
    }

    if (!formData.workplace_type) {
      showToast("Please select workplace type.", "error");
      return;
    }

    if (!String(formData.vacancies || "").trim()) {
      showToast("Please enter vacancies.", "error");
      return;
    }

    if (!String(formData.position || "").trim()) {
      showToast("Please enter position.", "error");
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();

      if (editingJob) {
        payload.append("action", "update");
        payload.append("id", String(editingJob.id));
      } else {
        payload.append("action", "create");
      }

      payload.append("recruiter_id", String(formData.recruiter_id));
      payload.append("job_title", formData.job_title.trim());
      payload.append("position", String(formData.position || "").trim());
      payload.append("company_name", formData.company_name.trim());
      payload.append("location", formData.location.trim());
      payload.append("vacancies", String(formData.vacancies || 1));
      payload.append("job_type", formData.job_type);
      payload.append("workplace_type", formData.workplace_type);
      payload.append("category", formData.category);
      payload.append("education", formData.education);
      payload.append("experience", formData.experience);
      payload.append("salary", formData.salary);
      payload.append("description", formData.description);
      payload.append("responsibilities", formData.responsibilities);
      payload.append("requirements", formData.requirements);
      payload.append("skills", formData.skills);
      payload.append("deadline", formData.deadline);
      payload.append("status", formData.status);
      payload.append(
        "positions",
        String(formData.positions || formData.vacancies || 1),
      );

      if (formData.company_logo instanceof File) {
        payload.append("company_logo", formData.company_logo);
      }

      const response = await fetch(API_URL, {
        method: "POST",
        body: payload,
      });

      const json = await response.json();

      if (!response.ok || json?.success === false) {
        throw new Error(json?.message || "Unable to save job.");
      }

      showToast(
        editingJob ? "Job updated successfully." : "Job added successfully.",
        "success",
      );

      setShowFormModal(false);
      resetForm();

      await fetchJobs();
    } catch (err) {
      console.error("Save job error:", err);

      showToast(err.message || "Unable to save job.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------
     Delete Job
  ------------------------------------------------------- */

  const handleDelete = async (job) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.job_title}"?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: job.id,
        }),
      });

      const json = await response.json();

      if (!response.ok || json?.success === false) {
        throw new Error(json?.message || "Unable to delete job.");
      }

      showToast("Job deleted successfully.", "success");

      if (selectedJob?.id === job.id) {
        setSelectedJob(null);
        setShowViewModal(false);
      }

      await fetchJobs();
    } catch (err) {
      console.error("Delete job error:", err);

      showToast(err.message || "Unable to delete job.", "error");
    }
  };

  /* -------------------------------------------------------
     View Job
  ------------------------------------------------------- */

  const openViewModal = async (job) => {
    try {
      setSelectedTab("overview");

      const response = await fetch(`${API_URL}?id=${job.id}`);

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || "Unable to load job details.");
      }

      const data = json?.data || json?.job || json;

      setSelectedJob(normalizeJob(data));
      setShowViewModal(true);
    } catch (err) {
      console.error("View job error:", err);

      showToast(err.message || "Unable to load job details.", "error");
    }
  };

  /* -------------------------------------------------------
     Export CSV
  ------------------------------------------------------- */

  const exportCSV = () => {
    if (!filteredJobs.length) {
      showToast("No jobs available for export.", "error");
      return;
    }

    const headers = [
      "ID",
      "Job Title",
      "Company",
      "Location",
      "Category",
      "Job Type",
      "Workplace",
      "Experience",
      "Salary",
      "Status",
      "Deadline",
    ];

    const rows = filteredJobs.map((job) => [
      job.id,
      job.job_title,
      job.company_name,
      job.location,
      getCategoryValue(job),
      job.job_type,
      job.workplace_type,
      job.experience,
      job.salary,
      getJobStatus(job),
      job.deadline,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "jobs.csv";
    link.click();

    URL.revokeObjectURL(url);

    showToast("Jobs exported successfully.", "success");
  };

  /* -------------------------------------------------------
     Recruiter Name
  ------------------------------------------------------- */

  const getRecruiterName = (job) => {
    if (job.recruiter_name) {
      return job.recruiter_name;
    }

    const recruiter = recruiters.find(
      (item) => String(item.id) === String(job.recruiter_id),
    );

    return recruiter?.name || recruiter?.email || "Recruiter";
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900 overflow-x-hidden">
      {/* Toast */}

      {toast && (
        <div
          className={`fixed left-4 right-4 top-4 z-[100] flex min-w-0 items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl sm:left-auto sm:right-6 sm:top-6 sm:min-w-[300px] sm:max-w-sm ${
            toast.type === "error" ? "border-red-200" : "border-emerald-200"
          }`}
        >
          {toast.type === "error" ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={18} />
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 break-words">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-700 shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
        {/* TOP ACTION BAR */}

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg md:text-xl">
              Jobs Directory
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={exportCSV}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 sm:flex-none sm:px-3.5 sm:text-sm"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchJobs}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 sm:px-3.5 sm:text-sm"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin text-blue-600" : ""}
              />
              <span className="hidden sm:inline">
                {loading ? "Refreshing..." : "Refresh"}
              </span>
            </button>

            <button
              onClick={openAddModal}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 sm:flex-none sm:px-4 sm:text-sm"
            >
              <Plus size={17} />
              <span>Add Job</span>
            </button>
          </div>
        </div>

        {/* Stats */}

        <div className="mb-5 sm:mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            title="Total Jobs"
            value={stats.total}
            subtitle="Posted on portal"
            icon={<BriefcaseBusiness size={20} />}
          />

          <StatCard
            title="Active Jobs"
            value={stats.active}
            subtitle="Open for applications"
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Closed Jobs"
            value={stats.closed}
            subtitle="Closed / archived"
            icon={<XCircle size={20} />}
            iconClass="bg-slate-100 text-slate-600"
          />

          <StatCard
            title="Applied"
            value={stats.applications}
            subtitle="Candidate applications"
            icon={<Users size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Interviews"
            value={stats.interviews}
            subtitle="Interview stage"
            icon={<UserRound size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Selected"
            value={stats.selected}
            subtitle="Selected / hired"
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-cyan-50 text-cyan-600"
          />
        </div>

        {/* Main Jobs Card */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          {/* Card Header */}

          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness size={20} className="text-blue-600 shrink-0" />

                  <h2 className="text-base sm:text-lg font-bold text-slate-900 break-words">
                    Jobs Performance & Activity
                  </h2>
                </div>

                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Manage all job postings and recruitment activity.
                </p>
              </div>

              {/* Search */}

              <div className="relative w-full xl:w-[300px]">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs..."
                  className="h-10 sm:h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Filters */}

            <div className="mt-4 sm:mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Filter                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="all">All Status</option>
                  {JOB_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <BriefcaseBusiness
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="all">All Categories</option>

                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <UserRound
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={recruiterFilter}
                  onChange={(e) => setRecruiterFilter(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="all">All Recruiters</option>

                  {recruiters.map((recruiter) => (
                    <option key={recruiter.id} value={recruiter.id}>
                      {recruiter.name ||
                        recruiter.email ||
                        `Recruiter ${recruiter.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setRecruiterFilter("all");
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <RefreshCw size={15} />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table */}

          <div className="w-full overflow-x-auto">
            {loading ? (
              <div className="flex min-h-[300px] sm:min-h-[350px] items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={30}
                    className="mx-auto animate-spin text-blue-600"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Loading jobs...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-[300px] sm:min-h-[350px] items-center justify-center px-4 sm:px-6">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <AlertCircle size={22} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Unable to load jobs
                  </p>

                  <p className="mt-1 max-w-md text-sm text-slate-500 break-words">
                    {error}
                  </p>

                  <button
                    onClick={fetchJobs}
                    className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex min-h-[300px] sm:min-h-[350px] items-center justify-center px-4">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <BriefcaseBusiness size={25} />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-800">
                    No jobs found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or filters.
                  </p>

                  <button
                    onClick={openAddModal}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Add Job
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Job
                    </th>

                    <th className="px-3 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Recruiter
                    </th>

                    <th className="px-3 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Category
                    </th>

                    <th className="px-3 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Location
                    </th>

                    <th className="px-3 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Type
                    </th>

                    <th className="px-3 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Applied
                    </th>

                    <th className="px-3 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Status
                    </th>

                    <th className="px-3 py-3 sm:py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="transition hover:bg-blue-50/30">
                      {/* Job */}

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-blue-50">
                            <LogoImage
                              value={job.company_logo}
                              alt=""
                              className="h-full w-full object-cover"
                              fallback={
                                <span className="text-sm font-bold text-blue-600">
                                  {getInitials(job.company_name)}
                                </span>
                              }
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[140px] sm:max-w-[180px] truncate text-sm font-bold text-slate-900">
                              {showValue(job.job_title)}
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <Building2 size={13} className="shrink-0" />
                              <span className="max-w-[120px] sm:max-w-[160px] truncate">
                                {showValue(job.company_name)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Recruiter */}

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                            {getInitials(getRecruiterName(job))}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[90px] sm:max-w-[105px] truncate text-sm font-semibold text-slate-700">
                              {getRecruiterName(job)}
                            </p>

                            <p className="text-xs text-slate-400 whitespace-nowrap">
                              ID: {job.recruiter_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}

                      <td className="px-3 py-3">
                        <span className="inline-flex max-w-[100px] sm:max-w-full truncate rounded-lg bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-700">
                          {showValue(getCategoryValue(job))}
                        </span>
                      </td>

                      {/* Location */}

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 min-w-0">
                          <MapPin
                            size={14}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="max-w-[80px] sm:max-w-[100px] truncate">
                            {showValue(job.location)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-400 truncate max-w-[100px]">
                          {showValue(job.workplace_type)}
                        </p>
                      </td>

                      {/* Type */}

                      <td className="px-3 py-3">
                        <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                          {showValue(job.job_type)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400 truncate max-w-[90px]">
                          {showValue(job.experience)}
                        </p>
                      </td>

                      {/* Applied */}

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <Users size={15} />
                          </div>

                          <span className="text-sm font-bold text-violet-600">
                            {Number(
                              job.applied_count || job.applications_count || 0,
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Status */}

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-bold capitalize ${getStatusClass(
                            getJobStatus(job),
                          )}`}
                          title={getJobStatus(job) || "Unknown"}
                        >
                          {getStatusIcon(getJobStatus(job))}
                          <span className="truncate">
                            {getJobStatus(job) || "Unknown"}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1 sm:gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openViewModal(job)}
                            title="View"
                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-2 sm:px-2.5 text-[11px] font-bold text-white transition hover:bg-blue-700"
                          >
                            <Eye size={15} />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          <button
                            onClick={() => openEditModal(job)}
                            title="Edit"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => handleDelete(job)}
                            title="Delete"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}

          {!loading && !error && filteredJobs.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                Showing{" "}
                <span className="font-bold text-slate-700">
                  {filteredJobs.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-700">{jobs.length}</span>{" "}
                jobs
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ADD / EDIT JOB MODAL
      ===================================================== */}

      {showFormModal && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[94vh] sm:max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {editingJob ? <Pencil size={19} /> : <Plus size={20} />}
                </div>

                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {editingJob ? "Edit Job" : "Add New Job"}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-500">
                    {editingJob
                      ? "Update job posting details."
                      : "Create a new job posting."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => closeFormModal()}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="space-y-6 sm:space-y-7 p-4 sm:p-6">
                {/* Basic Details */}

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-blue-600" />

                    <h3 className="text-base font-bold text-slate-900">
                      Basic Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Field
                      label="Job Title"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      placeholder="Frontend Developer"
                      required
                    />

                    <Field
                      label="Company Name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="ABC Technologies"
                      required
                    />

                    <SelectField
                      label="Recruiter"
                      name="recruiter_id"
                      value={formData.recruiter_id}
                      onChange={handleChange}
                      required
                      placeholder={
                        loadingRecruiters
                          ? "Loading recruiters..."
                          : "Select Recruiter"
                      }
                      options={recruiters.map((recruiter) => ({
                        value: String(recruiter.id),
                        label:
                          recruiter.name ||
                          recruiter.email ||
                          `Recruiter ${recruiter.id}`,
                      }))}
                    />

                    <div className="md:col-span-2 lg:col-span-1">
                      <Field
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Noida, Uttar Pradesh"
                        required
                      />
                    </div>

                    {/* CATEGORY DROPDOWN */}

                    <SelectField
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      placeholder="Select Job Category"
                      includeUnlistedValue={false}
                      options={availableCategories}
                    />

                    <SelectField
                      label="Job Type"
                      name="job_type"
                      value={formData.job_type}
                      onChange={handleChange}
                      placeholder="Select Job Type"
                      required
                      options={JOB_TYPES}
                    />

                    <SelectField
                      label="Workplace Type"
                      name="workplace_type"
                      value={formData.workplace_type}
                      onChange={handleChange}
                      placeholder="Select Workplace Type"
                      required
                      options={WORKPLACE_TYPES}
                    />

                    <Field
                      label="Vacancies"
                      name="vacancies"
                      type="number"
                      value={formData.vacancies}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      required
                    />

                    <Field
                      label="Position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g. Frontend Developer"
                      required
                    />
                  </div>
                </section>

                {/* Professional Details */}

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-blue-600" />

                    <h3 className="text-base font-bold text-slate-900">
                      Professional Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Field
                      label="Education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="BCA / B.Tech / MCA"
                    />

                    <Field
                      label="Experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="0-1 Years"
                    />

                    <Field
                      label="Salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="₹3 - ₹6 LPA"
                    />

                    <div className="md:col-span-2 lg:col-span-1">
                      <Field
                        label="Application Deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleChange}
                      />
                    </div>

                    <SelectField
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      options={JOB_STATUSES}
                    />
                  </div>
                </section>

                {/* Description */}

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-blue-600" />

                    <h3 className="text-base font-bold text-slate-900">
                      Job Description
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <TextAreaField
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Write complete job description..."
                      rows={5}
                    />

                    <TextAreaField
                      label="Responsibilities"
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleChange}
                      placeholder="Enter job responsibilities..."
                      rows={4}
                    />

                    <TextAreaField
                      label="Requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      placeholder="Enter candidate requirements..."
                      rows={4}
                    />

                    <TextAreaField
                      label="Skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React.js, Node.js, MongoDB, JavaScript"
                      rows={3}
                    />
                  </div>
                </section>

                {/* Company Logo */}

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-blue-600" />

                    <h3 className="text-base font-bold text-slate-900">
                      Company Logo
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <LogoImage
                        value={logoPreview}
                        alt="Company logo"
                        className="h-full w-full object-cover"
                        fallback={
                          <Building2 size={28} className="text-slate-300" />
                        }
                      />
                    </div>

                    <div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                        <Upload size={17} />
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>

                      <p className="mt-2 text-xs text-slate-400">
                        PNG, JPG or WEBP. Recommended square image.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Modal Footer */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-2 sm:gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => closeFormModal()}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingJob ? "Update Job" : "Create Job"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW JOB MODAL
      ===================================================== */}

      {showViewModal && selectedJob && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[94vh] sm:max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5 shrink-0">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-blue-50">
                  <LogoImage
                    value={selectedJob.company_logo}
                    alt=""
                    className="h-full w-full object-cover"
                    fallback={<Building2 size={22} className="text-blue-600" />}
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-base sm:text-lg font-bold text-slate-900">
                    {selectedJob.job_title}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500">
                    <span className="flex items-center gap-1 min-w-0">
                      <Building2 size={14} className="shrink-0" />
                      <span className="truncate">{selectedJob.company_name}</span>
                    </span>

                    <span className="flex items-center gap-1 min-w-0">
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate">{selectedJob.location}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}

            <div className="border-b border-slate-200 px-4 sm:px-6 overflow-x-auto shrink-0">
              <div className="flex gap-4 sm:gap-6 min-w-max">
                <button
                  onClick={() => setSelectedTab("overview")}
                  className={`border-b-2 py-3 text-sm font-semibold transition whitespace-nowrap ${
                    selectedTab === "overview"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => setSelectedTab("job-data")}
                  className={`border-b-2 py-3 text-sm font-semibold transition whitespace-nowrap ${
                    selectedTab === "job-data"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All Data
                </button>

                <button
                  onClick={() => setSelectedTab("applications")}
                  className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition whitespace-nowrap ${
                    selectedTab === "applications"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Applications
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                    {Array.isArray(selectedJob.applications)
                      ? selectedJob.applications.length
                      : Number(selectedJob.applied_count || 0)}
                  </span>
                </button>
              </div>
            </div>

            {/* Content */}

            <div className="overflow-y-auto p-4 sm:p-6 flex-1">
              {selectedTab === "overview" ? (
                <div className="space-y-5 sm:space-y-6">
                  {/* Job Info */}

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <BriefcaseBusiness size={16} className="shrink-0" />
                        <span className="text-xs font-semibold">Job Type</span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-800 break-words">
                        {showValue(selectedJob.job_type)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Users size={16} className="shrink-0" />
                        <span className="text-xs font-semibold">Vacancies</span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-800">
                        {showValue(selectedJob.vacancies)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <IndianRupee size={16} className="shrink-0" />
                        <span className="text-xs font-semibold">Salary</span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-800 break-words">
                        {showValue(selectedJob.salary)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <CalendarDays size={16} className="shrink-0" />
                        <span className="text-xs font-semibold">Deadline</span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-800">
                        {formatDate(selectedJob.deadline)}
                      </p>
                    </div>
                  </div>

                  {/* Category / Education */}

                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 p-3 sm:p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Category
                      </p>

                      <p className="mt-2 text-sm font-bold text-blue-600 break-words">
                        {showValue(getCategoryValue(selectedJob))}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-slate-400 shrink-0" />

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Education
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-800 break-words">
                        {showValue(selectedJob.education)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3 sm:p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Experience
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-800 break-words">
                        {showValue(selectedJob.experience)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                      <FileText size={18} className="text-blue-600 shrink-0" />
                      Job Description
                    </h3>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <p className="whitespace-pre-line text-sm leading-7 text-slate-600 break-words">
                        {showValue(selectedJob.description)}
                      </p>
                    </div>
                  </div>

                  {/* Responsibilities */}

                  <div>
                    <h3 className="mb-3 text-base font-bold text-slate-900">
                      Responsibilities
                    </h3>

                    <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                      <p className="whitespace-pre-line text-sm leading-7 text-slate-600 break-words">
                        {showValue(selectedJob.responsibilities)}
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}

                  <div>
                    <h3 className="mb-3 text-base font-bold text-slate-900">
                      Requirements
                    </h3>

                    <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                      <p className="whitespace-pre-line text-sm leading-7 text-slate-600 break-words">
                        {showValue(selectedJob.requirements)}
                      </p>
                    </div>
                  </div>

                  {/* Skills */}

                  <div>
                    <h3 className="mb-3 text-base font-bold text-slate-900">
                      Skills
                    </h3>

                    <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                      <p className="whitespace-pre-line text-sm leading-7 text-slate-600 break-words">
                        {showValue(selectedJob.skills)}
                      </p>
                    </div>
                  </div>

                  {/* Recruiter */}

                  <div>
                    <h3 className="mb-3 text-base font-bold text-slate-900">
                      Recruiter Information
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 p-3 sm:p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <UserRound size={16} className="shrink-0" />
                          <span className="text-xs font-semibold">Name</span>
                        </div>

                        <p className="mt-2 text-sm font-bold text-slate-800 break-words">
                          {showValue(
                            selectedJob.recruiter_name || selectedJob.name,
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-3 sm:p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail size={16} className="shrink-0" />
                          <span className="text-xs font-semibold">Email</span>
                        </div>

                        <p className="mt-2 break-all text-sm font-bold text-slate-800">
                          {showValue(
                            selectedJob.recruiter_email || selectedJob.email,
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-3 sm:p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone size={16} className="shrink-0" />
                          <span className="text-xs font-semibold">Phone</span>
                        </div>

                        <p className="mt-2 text-sm font-bold text-slate-800 break-words">
                          {showValue(
                            selectedJob.recruiter_phone || selectedJob.phone,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedTab === "job-data" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(selectedJob)
                    .filter(([key]) => !JOB_VIEW_EXCLUDED_FIELDS.has(key))
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="min-w-0 rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <p className="text-xs font-semibold text-slate-500">
                          {formatFieldLabel(key)}
                        </p>
                        <div className="mt-1 break-words whitespace-pre-wrap text-sm font-medium text-slate-800">
                          {key === "company_logo" && value ? (
                            <a
                              href={buildLogoUrl(value)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline"
                            >
                              View company logo
                            </a>
                          ) : value === null || value === "" ? (
                            "Not provided"
                          ) : key === "deadline" || /_at$/i.test(key) ? (
                            formatDate(value)
                          ) : typeof value === "object" ? (
                            JSON.stringify(value, null, 2)
                          ) : (
                            String(value)
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                /* Applications */

                <div>
                  {Array.isArray(selectedJob.applications) &&
                  selectedJob.applications.length > 0 ? (
                    <div className="space-y-3">
                      {selectedJob.applications.map((app, index) => {
                        const resume = app.resume || app.resume_url;

                        return (
                          <div
                            key={app.application_id || app.id || index}
                            className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm"
                          >
                            <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                                  {getInitials(app.candidate_name)}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate">
                                    {showValue(app.candidate_name)}
                                  </p>

                                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 min-w-0">
                                    <Mail size={12} className="shrink-0" />
                                    <span className="truncate">{showValue(app.candidate_email)}</span>
                                  </p>

                                  {app.candidate_phone && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                      <Phone size={12} className="shrink-0" />
                                      {app.candidate_phone}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${getStatusClass(
                                    app.status,
                                  )}`}
                                >
                                  {app.status || "Applied"}
                                </span>

                                {resume && (
                                  <a
                                    href={buildResumeUrl(resume)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100"
                                  >
                                    <FileText size={14} />
                                    Resume
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:pt-4 md:grid-cols-3">
                              <div>
                                <p className="text-xs text-slate-400">
                                  Applied Date
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                  {formatDate(app.applied_at)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-400">
                                  Interview Date
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                  {formatDate(app.interview_date)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-400">
                                  Interview Note
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700 break-words">
                                  {showValue(app.interview_note)}
                                </p>
                              </div>
                            </div>

                            {app.cover_letter && (
                              <div className="mt-3 sm:mt-4 rounded-lg bg-slate-50 p-3">
                                <p className="text-xs font-semibold text-slate-400">
                                  Cover Letter
                                </p>

                                <p className="mt-1 whitespace-pre-line text-sm text-slate-600 break-words">
                                  {app.cover_letter}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-[240px] sm:min-h-[280px] items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <Users size={25} />
                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                          No applications yet
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Candidates have not applied to this job.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* View Footer */}

            <div className="flex flex-col-reverse gap-2 sm:gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 sm:py-4 sm:flex-row sm:justify-end shrink-0">
              <button
                onClick={() => setShowViewModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedJob);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Pencil size={16} />
                Edit Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}