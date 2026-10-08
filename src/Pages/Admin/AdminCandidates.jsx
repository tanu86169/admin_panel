import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  BriefcaseBusiness,
  Users,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
  Tags,
  AlertCircle,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Save,
  UserRound,
  MessageCircle,
  Download,
  Filter,
} from "lucide-react";

// ============================================================
// AdminCandidates.jsx
// Job Portal Admin - Candidate Management
// ============================================================

const API_BASE =
  "http://localhost/job_portal/job-portal-api/api/admin";

const API_URL = `${API_BASE}/candidates.php`;
const CATEGORIES_API_URL = `${API_BASE}/categories.php`;
const ADD_CANDIDATE_API_URL = `${API_BASE}/add-candidate.php`;
const UPDATE_CANDIDATE_API_URL = `${API_BASE}/update-candidate.php`;
const DELETE_CANDIDATE_API_URL = `${API_BASE}/delete-candidate.php`;
const UPDATE_APPLICATION_API_URL = `${API_BASE}/update-application.php`;

// ============================================================
// EMPTY FORM
// ============================================================

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  category_id: "",
  skills: "",
  experience: "",
  status: "active",
};

// ============================================================
// STAGES
// ============================================================

const STAGES = [
  "All Stages",
  "Active",
  "Inactive",
  "Applied",
  "Screening",
  "Interview Scheduled",
  "Interviewed",
  "Shortlisted",
  "Hired",
  "Rejected",
];

// ============================================================
// API HELPERS
// ============================================================

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Server returned invalid JSON: ${
        text.slice(0, 250) || response.status
      }`
    );
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
};

const getJson = (url) => requestJson(url, { method: "GET" });
const postJson = (url, body) =>
  requestJson(url, { method: "POST", body: JSON.stringify(body) });

// ============================================================
// SMALL UI COMPONENTS
// ============================================================

const StatCard = ({ title, value, icon: Icon, iconClass }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-slate-500">
          {title}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={19} />
      </div>
    </div>
  </div>
);

const InputField = ({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  </label>
);

const ModalShell = ({
  title,
  subtitle,
  onClose,
  children,
  width = "max-w-2xl",
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-5">
    <div
      className={`flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
    >
      <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="min-w-0 pr-4">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  </div>
);

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {Icon && <Icon size={12} />}
      {label}
    </div>
    <div className="break-words text-sm font-medium text-slate-800">
      {value || "Not available"}
    </div>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const AdminCandidates = () => {
  const navigate = useNavigate();

  // DATA
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);

  // FILTERS
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  // LOADING
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ERROR
  const [error, setError] = useState("");

  // TOAST
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // VIEW
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // ADD / EDIT
  const [formMode, setFormMode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [editTarget, setEditTarget] = useState(null);

  // DELETE
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // APPLICATION ACTION
  const [actionCandidate, setActionCandidate] = useState(null);
  const [actionType, setActionType] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewNote, setInterviewNote] = useState("");

  // ==========================================================
  // TOAST
  // ==========================================================

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    window.setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // ==========================================================
  // FETCH CANDIDATES
  // ==========================================================

  const fetchCandidates = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const data = await getJson(API_URL);

      setCandidates(
        Array.isArray(data.candidates) ? data.candidates : []
      );
    } catch (err) {
      console.error("Candidates API error:", err);
      setCandidates([]);
      setError(
        err.message ||
          "Unable to load candidates. Please check your PHP API."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // FETCH CATEGORIES
  // ==========================================================

  const fetchCategories = async () => {
    try {
      const response = await getJson(CATEGORIES_API_URL);
      const latestCategories = Array.isArray(response.data)
        ? response.data
        : [];
      setCategories(latestCategories);
      return latestCategories;
    } catch (err) {
      console.error("Categories API error:", err);
      setCategories([]);
      return [];
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchCandidates();
    fetchCategories();
  }, []);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const refreshAll = async () => {
    await Promise.all([fetchCandidates(true), fetchCategories()]);
  };

  // ==========================================================
  // HELPERS
  // ==========================================================

  const normalize = (value) =>
    String(value ?? "").trim().toLowerCase();

  const getCandidateProfileId = (candidate) => {
    const possibleIds = [
      candidate?.candidate_id,
      candidate?.candidateId,
      candidate?.id,
    ];
    for (const value of possibleIds) {
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }
    return null;
  };

  const getCandidateTableId = (candidate) =>
    candidate?.candidate_profile_id ?? candidate?.profile_id ?? null;

  const getUserId = (candidate) =>
    candidate?.user_id ??
    candidate?.candidate_user_id ??
    candidate?.userId ??
    candidate?.candidate_id ??
    null;

  const getRowId = (candidate) =>
    getCandidateProfileId(candidate) ??
    getCandidateTableId(candidate) ??
    getUserId(candidate) ??
    null;

  const getApplicationId = (candidate) =>
    candidate?.application_id ?? candidate?.applicationId ?? null;

  const getApplications = (candidate) => {
    if (Array.isArray(candidate?.applications)) {
      return candidate.applications;
    }
    return getApplicationId(candidate) ? [candidate] : [];
  };

  const isCandidateSelected = (candidate) =>
    getApplications(candidate).some((application) =>
      ["hired", "selected", "select"].includes(
        normalize(application.application_status)
      )
    );

  const getName = (candidate) =>
    candidate?.candidate_name ??
    candidate?.name ??
    candidate?.full_name ??
    "Unknown Candidate";

  const getEmail = (candidate) =>
    candidate?.candidate_email ?? candidate?.email ?? "N/A";

  const getPhone = (candidate) =>
    candidate?.candidate_phone ?? candidate?.phone ?? "N/A";

  const getSkills = (candidate) => candidate?.skills ?? "";

  const getExperience = (candidate) => {
    const experience = candidate?.experience;
    if (!experience) return "Fresher";
    if (typeof experience !== "string") return String(experience);

    const value = experience.trim();
    if (!value) return "Fresher";

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const experiences = parsed
          .map((item) => {
            if (!item || typeof item !== "object") return "";
            if (item.experience !== undefined && String(item.experience).trim())
              return String(item.experience).trim();
            if (
              item.experience_years !== undefined &&
              String(item.experience_years).trim()
            )
              return `${String(item.experience_years).trim()} Years`;
            if (item.years !== undefined && String(item.years).trim())
              return `${String(item.years).trim()} Years`;
            if (
              item.designation !== undefined &&
              String(item.designation).trim()
            )
              return String(item.designation).trim();
            return "";
          })
          .filter(Boolean);
        return experiences.length ? experiences.join(", ") : "Fresher";
      }

      if (parsed && typeof parsed === "object") {
        if (parsed.experience && String(parsed.experience).trim())
          return String(parsed.experience).trim();
        if (parsed.experience_years !== undefined)
          return `${String(parsed.experience_years).trim()} Years`;
        if (parsed.years !== undefined)
          return `${String(parsed.years).trim()} Years`;
        if (parsed.designation) return String(parsed.designation).trim();
      }
    } catch {
      // normal text
    }

    return value;
  };

  const getAccountStatus = (candidate) =>
    candidate?.candidate_status ??
    candidate?.user_status ??
    candidate?.status ??
    "active";

  const getApplicationStatus = (candidate) =>
    candidate?.application_status ?? "";

  const getJobTitle = (candidate) =>
    candidate?.job_title ??
    candidate?.applied_role ??
    candidate?.position ??
    "";

  const getCompanyName = (candidate) =>
    candidate?.company_name ?? candidate?.company ?? "";

  const getRecruiterName = (candidate) =>
    candidate?.recruiter_name ?? candidate?.recruiter ?? "";

  const getLocation = (candidate) =>
    candidate?.location ??
    candidate?.candidate_location ??
    candidate?.job_location ??
    "";

  const getProfileImage = (candidate) =>
    candidate?.profile_image ?? candidate?.profileImage ?? "";

  const getCreatedAt = (candidate) =>
    candidate?.candidate_created_at ?? candidate?.created_at ?? "";

  const getInterviewDate = (candidate) => candidate?.interview_date ?? "";

  const getInterviewNote = (candidate) =>
    candidate?.interview_note ?? candidate?.interview_notes ?? "";

  const hasApplication = (candidate) => Boolean(getApplicationId(candidate));

  const splitSkills = (skills) =>
    String(skills || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(String(value).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTimeLocal = (value) => {
    if (!value) return "";
    const normalized = String(value).replace(" ", "T");
    return normalized.slice(0, 16);
  };

  const capitalize = (value) =>
    String(value || "").replace(/^./, (character) =>
      character.toUpperCase()
    );

  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  const statusClass = (status) => {
    const value = normalize(status);
    if (value.includes("reject") || value.includes("inactive"))
      return "border-rose-200 bg-rose-50 text-rose-700";
    if (
      value.includes("hired") ||
      value.includes("shortlist") ||
      value.includes("select") ||
      value === "active"
    )
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (value.includes("interview"))
      return "border-blue-200 bg-blue-50 text-blue-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  // ==========================================================
  // CATEGORY HELPERS
  // ==========================================================

  const getCategoryId = (candidate) => {
    if (!candidate) return null;
    const possibleIds = [
      candidate.category_id,
      candidate.career_field_id,
      candidate.categoryId,
      candidate.careerFieldId,
      candidate.category?.id,
      candidate.career_field?.id,
    ];
    for (const value of possibleIds) {
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== "" &&
        !Number.isNaN(Number(value))
      ) {
        return Number(value);
      }
    }
    return null;
  };

  const getCategoryName = (candidate) => {
    if (!candidate) return "";

    if (candidate.category && typeof candidate.category === "object") {
      const objectName =
        candidate.category.name ||
        candidate.category.title ||
        candidate.category.label ||
        "";
      if (String(objectName).trim()) return String(objectName).trim();
    }

    const possibleNames = [
      candidate.category_name,
      candidate.career_field,
      candidate.career_field_name,
      candidate.categoryName,
      candidate.category_title,
      candidate.job_category,
      candidate.category,
    ];

    for (const value of possibleNames) {
      if (value !== null && value !== undefined) {
        const text = String(value).trim();
        if (text && !/^\d+$/.test(text)) return text;
      }
    }

    const categoryId = getCategoryId(candidate);
    if (categoryId) {
      const category = categories.find(
        (item) => String(item.id) === String(categoryId)
      );
      if (category) return String(category.name || "").trim();
    }

    return "";
  };

  // ==========================================================
  // CATEGORY OPTIONS
  // ==========================================================

  const categoryOptions = useMemo(
    () => [
      "All Categories",
      ...categories.map((category) => category.name).filter(Boolean),
    ],
    [categories]
  );

  // ==========================================================
  // FILTERED CANDIDATES
  // ==========================================================

  const filteredCandidates = useMemo(() => {
    const query = normalize(search);

    return candidates.filter((candidate) => {
      const searchable = [
        getName(candidate),
        getEmail(candidate),
        getPhone(candidate),
        getSkills(candidate),
        getExperience(candidate),
        getCategoryName(candidate),
        getAccountStatus(candidate),
        getApplicationStatus(candidate),
        ...getApplications(candidate).flatMap((application) => [
          getJobTitle(application),
          getCompanyName(application),
          getRecruiterName(application),
          getApplicationStatus(application),
        ]),
        getLocation(candidate),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      const selectedStage = normalize(stageFilter);
      const accountStatus = normalize(getAccountStatus(candidate));
      const applicationStatuses = getApplications(candidate).map((application) =>
        normalize(getApplicationStatus(application))
      );

      const matchesStage =
        stageFilter === "All Stages" ||
        accountStatus === selectedStage ||
        applicationStatuses.includes(selectedStage);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        normalize(getCategoryName(candidate)) === normalize(categoryFilter);

      return matchesSearch && matchesStage && matchesCategory;
    });
  }, [candidates, categories, search, stageFilter, categoryFilter]);

  // ==========================================================
  // STATS
  // ==========================================================

  const totalCandidates = candidates.length;

  const screeningCount = candidates.filter((candidate) =>
    getApplications(candidate).some((application) =>
      ["applied", "screening"].includes(
        normalize(getApplicationStatus(application))
      )
    )
  ).length;

  const interviewCount = candidates.filter((candidate) =>
    getApplications(candidate).some((application) =>
      normalize(getApplicationStatus(application)).includes("interview")
    )
  ).length;

  const selectedCount = candidates.filter((candidate) =>
    getApplications(candidate).some((application) =>
      ["shortlisted", "hired", "selected"].includes(
        normalize(getApplicationStatus(application))
      )
    )
  ).length;

  // ==========================================================
  // EXPORT CSV
  // ==========================================================

  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      showToast("No candidates to export", "error");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Category",
      "Skills",
      "Experience",
      "Account Status",
      "Application Status",
      "Job Title",
      "Company",
      "Joined",
    ];

    const rows = filteredCandidates.map((candidate) => [
      getRowId(candidate) ?? "",
      `"${(getName(candidate) || "").replace(/"/g, '""')}"`,
      `"${(getEmail(candidate) || "").replace(/"/g, '""')}"`,
      `"${(getPhone(candidate) || "").replace(/"/g, '""')}"`,
      `"${(getCategoryName(candidate) || "").replace(/"/g, '""')}"`,
      `"${(getSkills(candidate) || "").replace(/"/g, '""')}"`,
      `"${(getExperience(candidate) || "").replace(/"/g, '""')}"`,
      getAccountStatus(candidate),
      getApplicationStatus(candidate) || "Not Applied",
      `"${(getJobTitle(candidate) || "").replace(/"/g, '""')}"`,
      `"${(getCompanyName(candidate) || "").replace(/"/g, '""')}"`,
      getCreatedAt(candidate) || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `jobportal_candidates_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Candidate list exported to CSV successfully");
  };

  // ==========================================================
  // VIEW MODAL
  // ==========================================================

  const openViewModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedCandidate(null);
  };

  // ==========================================================
  // ADD MODAL
  // ==========================================================

  const openAddModal = async () => {
    const latestCategories = await fetchCategories();
    console.log("Add Candidate categories:", latestCategories);

    setForm({ ...EMPTY_FORM });
    setEditTarget(null);
    setFormError("");
    setFormMode("add");
  };

  // ==========================================================
  // EDIT MODAL
  // ==========================================================

  const openEditModal = async (candidate) => {
    setFormError("");

    let latestCategories = await fetchCategories();
    if (!Array.isArray(latestCategories)) latestCategories = categories;

    const currentCategoryId = getCategoryId(candidate);
    let categoryId = "";

    if (currentCategoryId) {
      const category = latestCategories.find(
        (item) => String(item.id) === String(currentCategoryId)
      );
      if (category) categoryId = String(category.id);
    }

    if (!categoryId) {
      const categoryName = normalize(getCategoryName(candidate));
      if (categoryName) {
        const category = latestCategories.find(
          (item) => normalize(item.name) === categoryName
        );
        if (category) categoryId = String(category.id);
      }
    }

    setEditTarget(candidate);

    setForm({
      name: getName(candidate) === "Unknown Candidate" ? "" : getName(candidate),
      email: getEmail(candidate) === "N/A" ? "" : getEmail(candidate),
      phone: getPhone(candidate) === "N/A" ? "" : getPhone(candidate),
      password: "",
      category_id: categoryId,
      skills: getSkills(candidate),
      experience: getExperience(candidate),
      status:
        normalize(getAccountStatus(candidate)) === "inactive"
          ? "inactive"
          : "active",
    });

    setFormMode("edit");
  };

  const closeFormModal = () => {
    if (saveLoading) return;
    setFormMode(null);
    setEditTarget(null);
    setFormError("");
    setForm({ ...EMPTY_FORM });
  };

  const setField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  // ==========================================================
  // ADD / EDIT SAVE
  // ==========================================================

  const handleSaveCandidate = async () => {
    setFormError("");

    const isEdit = formMode === "edit";
    const name = String(form.name || "").trim();
    const email = String(form.email || "").trim();
    const phone = String(form.phone || "").trim();
    const password = String(form.password || "");

    if (!name) return setFormError("Candidate name is required.");
    if (!email) return setFormError("Email is required.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setFormError("Enter a valid email address.");
    if (!phone) return setFormError("Phone number is required.");
    if (!/^\d{10}$/.test(phone))
      return setFormError("Phone number must be exactly 10 digits.");
    if (!isEdit && !password) return setFormError("Password is required.");
    if (password && password.length < 6)
      return setFormError("Password must be at least 6 characters.");
    if (!form.category_id)
      return setFormError("Please select a career field.");

    const selectedCategory = categories.find(
      (category) => String(category.id) === String(form.category_id)
    );

    const payload = {
      name,
      email,
      phone,
      category_id: form.category_id ? Number(form.category_id) : null,
      category: selectedCategory ? selectedCategory.name : "",
      skills: String(form.skills || "").trim(),
      experience: String(form.experience || "").trim(),
      status: form.status || "active",
    };

    if (password) payload.password = password;

    if (isEdit) {
      const candidateId = getCandidateProfileId(editTarget);
      const userId = getUserId(editTarget);

      if (!candidateId && !userId)
        return setFormError("Candidate ID/User ID not found.");

      if (candidateId) {
        payload.candidate_id = Number(candidateId);
        payload.id = Number(candidateId);
      }
      if (userId) payload.user_id = Number(userId);
    }

    try {
      setSaveLoading(true);

      const endpoint = isEdit
        ? UPDATE_CANDIDATE_API_URL
        : ADD_CANDIDATE_API_URL;

      const data = await postJson(endpoint, payload);

      showToast(
        data.message ||
          (isEdit
            ? "Candidate updated successfully."
            : "Candidate added successfully.")
      );

      closeFormModal();
      await fetchCandidates(true);
    } catch (err) {
      console.error("Save candidate error:", err);
      setFormError(err.message || "Unable to save candidate.");
    } finally {
      setSaveLoading(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const openDeleteModal = (candidate) => setDeleteCandidate(candidate);

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteCandidate(null);
  };

  const handleDeleteCandidate = async () => {
    if (!deleteCandidate) return;

    const candidateId = getCandidateProfileId(deleteCandidate);
    const userId = getUserId(deleteCandidate);

    if (!candidateId && !userId) {
      showToast("Candidate ID/User ID not found.", "error");
      return;
    }

    try {
      setDeleteLoading(true);

      const data = await postJson(DELETE_CANDIDATE_API_URL, {
        candidate_id: candidateId ? Number(candidateId) : null,
        user_id: userId ? Number(userId) : null,
        id: candidateId
          ? Number(candidateId)
          : userId
          ? Number(userId)
          : null,
      });

      showToast(data.message || "Candidate deleted successfully.");
      closeDeleteModal();
      await fetchCandidates(true);
    } catch (err) {
      console.error("Delete candidate error:", err);
      showToast(err.message || "Unable to delete candidate.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==========================================================
  // APPLICATION ACTIONS
  // ==========================================================

  const openActionModal = (candidate, type) => {
    if (!hasApplication(candidate)) {
      showToast("This candidate has no application.", "error");
      return;
    }

    setActionCandidate(candidate);
    setActionType(type);
    setInterviewDate(
      formatDateTimeLocal(getInterviewDate(candidate))
    );
    setInterviewNote(getInterviewNote(candidate));
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    if (actionLoading) return;
    setShowActionModal(false);
    setActionCandidate(null);
    setActionType("");
    setInterviewDate("");
    setInterviewNote("");
  };

  const handleUpdateApplication = async () => {
    if (!actionCandidate) return;

    const applicationId = getApplicationId(actionCandidate);
    if (!applicationId) {
      showToast("Application ID not found.", "error");
      return;
    }

    let status = "Applied";

    if (actionType === "interview") {
      status = "Interview Scheduled";
      if (!interviewDate) {
        showToast("Please select interview date.", "error");
        return;
      }
    }
    if (actionType === "reject") status = "Rejected";
    if (actionType === "select") status = "Hired";

    try {
      setActionLoading(true);

      const data = await postJson(UPDATE_APPLICATION_API_URL, {
        application_id: Number(applicationId),
        status,
        interview_date: interviewDate
          ? interviewDate.replace("T", " ")
          : null,
        interview_note: interviewNote.trim() || null,
      });

      showToast(data.message || "Application updated successfully.");
      closeActionModal();
      await fetchCandidates(true);
    } catch (err) {
      console.error("Application update error:", err);
      showToast(err.message || "Unable to update application.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // FORM CATEGORIES
  // ==========================================================

  const formCategories = useMemo(() => categories, [categories]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full w-full overflow-x-hidden bg-slate-50 p-3 text-slate-800 sm:p-5 lg:p-6">
      {/* TOAST */}
      {toast.show && (
        <div
          className={`fixed bottom-5 right-5 z-[300] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={19} className="shrink-0" />
          ) : (
            <CheckCircle2 size={19} className="shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() =>
              setToast({ show: false, message: "", type: "success" })
            }
            className="rounded p-1 text-slate-400 hover:bg-white/70 hover:text-slate-700"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* TOP ACTION BAR */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg md:text-xl">
            Candidates Directory
          </h1>
          <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
            {filteredCandidates.length} candidate
            {filteredCandidates.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 sm:flex-none sm:px-3.5 sm:text-sm"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={refreshAll}
            disabled={refreshing || loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-60 sm:px-3.5 sm:text-sm"
          >
            <RefreshCw
              size={16}
              className={refreshing || loading ? "animate-spin text-blue-600" : ""}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 sm:flex-none sm:px-4 sm:text-sm"
          >
            <Plus size={17} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Candidates"
          value={totalCandidates}
          icon={Users}
          iconClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Screening"
          value={screeningCount}
          icon={Clock}
          iconClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Interviews"
          value={interviewCount}
          icon={BriefcaseBusiness}
          iconClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Selected"
          value={selectedCount}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* FILTERS */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone, skills, job or company..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white lg:w-48"
          >
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white lg:w-56"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>
            Showing <strong>{filteredCandidates.length}</strong> of{" "}
            <strong>{candidates.length}</strong> candidates
          </span>

          {(search ||
            stageFilter !== "All Stages" ||
            categoryFilter !== "All Categories") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStageFilter("All Stages");
                setCategoryFilter("All Categories");
              }}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-slate-800">
            Candidates
          </h2>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">
            {filteredCandidates.length} Results
          </span>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="p-12 text-center">
            <Loader2
              size={30}
              className="mx-auto mb-3 animate-spin text-blue-600"
            />
            <p className="text-sm text-slate-500">Loading candidates...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="p-12 text-center">
            <AlertTriangle
              size={32}
              className="mx-auto mb-3 text-rose-500"
            />
            <p className="mx-auto mb-4 max-w-xl text-sm text-rose-600">
              {error}
            </p>
            <button
              type="button"
              onClick={() => fetchCandidates()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredCandidates.length === 0 && (
          <div className="p-12 text-center">
            <Users
              size={36}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="text-sm font-medium text-slate-600">
              No candidates found.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try changing the filters or add a new candidate.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={15} />
              Add Candidate
            </button>
          </div>
        )}

        {/* DESKTOP TABLE */}
        {!loading && !error && filteredCandidates.length > 0 && (
          <div className="hidden w-full lg:block">
            <table className="w-full table-fixed text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="w-[22%] px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Candidate
                  </th>
                  <th className="w-[15%] px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>
                  <th className="w-[12%] px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Experience
                  </th>
                  <th className="w-[11%] px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="w-[22%] px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Application
                  </th>
                  <th className="w-[18%] px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((candidate) => {
                  const candidateId = getRowId(candidate);
                  const name = getName(candidate);
                  const applicationId = getApplicationId(candidate);

                  return (
                    <tr
                      key={`${candidateId}-${applicationId || "none"}`}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          {getProfileImage(candidate) ? (
                            <img
                              src={getProfileImage(candidate)}
                              alt={name}
                              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p
                              className="truncate text-xs font-bold text-slate-900"
                              title={name}
                            >
                              {name}
                            </p>
                            <p
                              className="truncate text-[10px] text-slate-500"
                              title={getEmail(candidate)}
                            >
                              {getEmail(candidate)}
                            </p>
                            <p
                              className="truncate text-[10px] text-slate-400"
                              title={getPhone(candidate)}
                            >
                              {getPhone(candidate)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        {getCategoryName(candidate) ? (
                          <span
                            className="inline-flex max-w-full items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700"
                            title={getCategoryName(candidate)}
                          >
                            <Tags size={10} />
                            <span className="truncate">
                              {getCategoryName(candidate)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Not set
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className="block truncate text-[11px] text-slate-600"
                          title={getExperience(candidate)}
                        >
                          {getExperience(candidate) || "Not set"}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex max-w-full whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-semibold ${statusClass(
                            getAccountStatus(candidate)
                          )}`}
                        >
                          {capitalize(getAccountStatus(candidate))}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        {applicationId ? (
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-slate-700">
                              Applied to {getApplications(candidate).length}{" "}
                              {getApplications(candidate).length === 1
                                ? "job"
                                : "jobs"}
                            </p>
                            {getJobTitle(candidate) && (
                              <p
                                className="mt-0.5 truncate text-[10px] text-slate-400"
                                title={getJobTitle(candidate)}
                              >
                                Latest: {getJobTitle(candidate)}
                              </p>
                            )}
                            <span
                              className={`mt-1 inline-flex max-w-full truncate rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${statusClass(
                                getApplicationStatus(candidate) || "Applied"
                              )}`}
                            >
                              {getApplicationStatus(candidate) || "Applied"}
                            </span>
                          </div>
                        ) : (
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">
                            Not Applied
                          </span>
                        )}
                      </td>

                      <td className="px-2 py-3">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          <button
                            type="button"
                            title="View Candidate"
                            onClick={() => openViewModal(candidate)}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            title="Edit Candidate"
                            onClick={() => openEditModal(candidate)}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            title="Delete Candidate"
                            onClick={() => openDeleteModal(candidate)}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                          >
                            <Trash2 size={14} />
                          </button>

                          {applicationId && (
                            <>
                              <button
                                type="button"
                                title="Schedule Interview"
                                onClick={() =>
                                  openActionModal(candidate, "interview")
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-white text-blue-600 transition hover:bg-blue-50"
                              >
                                <CalendarDays size={14} />
                              </button>

                              <button
                                type="button"
                                title="Reject Application"
                                onClick={() =>
                                  openActionModal(candidate, "reject")
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50"
                              >
                                <X size={14} />
                              </button>

                              {!isCandidateSelected(candidate) && (
                                <button
                                  type="button"
                                  title="Select / Hire"
                                  onClick={() =>
                                    openActionModal(candidate, "select")
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-600 transition hover:bg-emerald-50"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MOBILE */}
        {!loading && !error && filteredCandidates.length > 0 && (
          <div className="divide-y divide-slate-100 lg:hidden">
            {filteredCandidates.map((candidate) => {
              const name = getName(candidate);
              const applicationId = getApplicationId(candidate);
              const skills = splitSkills(getSkills(candidate));

              return (
                <div key={getRowId(candidate)} className="p-4">
                  <div className="flex items-start gap-3">
                    {getProfileImage(candidate) ? (
                      <img
                        src={getProfileImage(candidate)}
                        alt={name}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {name}
                          </p>
                          <p className="mt-0.5 break-all text-[11px] text-slate-500">
                            {getEmail(candidate)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {getPhone(candidate)}
                          </p>
                        </div>

                        <span
                          className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${statusClass(
                            getAccountStatus(candidate)
                          )}`}
                        >
                          {capitalize(getAccountStatus(candidate))}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <DetailItem
                          label="Category"
                          value={getCategoryName(candidate) || "Not set"}
                          icon={Tags}
                        />
                        <DetailItem
                          label="Experience"
                          value={getExperience(candidate) || "Not set"}
                          icon={BriefcaseBusiness}
                        />
                      </div>

                      {skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {skills.slice(0, 6).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {applicationId && (
                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Applications ({getApplications(candidate).length})
                              </p>
                              <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                                {getJobTitle(candidate) ||
                                  `Application #${applicationId}`}
                              </p>
                              {getCompanyName(candidate) && (
                                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                  {getCompanyName(candidate)}
                                </p>
                              )}
                            </div>
                            <span
                              className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold ${statusClass(
                                getApplicationStatus(candidate) || "Applied"
                              )}`}
                            >
                              {getApplicationStatus(candidate) || "Applied"}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <button
                          type="button"
                          onClick={() => openViewModal(candidate)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(candidate)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-100"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(candidate)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>

                        {applicationId && (
                          <button
                            type="button"
                            onClick={() =>
                              openActionModal(candidate, "interview")
                            }
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            <CalendarDays size={14} />
                            Interview
                          </button>
                        )}

                        {applicationId && !isCandidateSelected(candidate) && (
                          <button
                            type="button"
                            onClick={() =>
                              openActionModal(candidate, "select")
                            }
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckCircle2 size={14} />
                            Select
                          </button>
                        )}
                      </div>

                      {applicationId && (
                        <button
                          type="button"
                          onClick={() =>
                            openActionModal(candidate, "reject")
                          }
                          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <X size={14} />
                          Reject Application
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================
          VIEW MODAL
      ====================================================== */}

      {showViewModal && selectedCandidate && (
        <ModalShell
          title="Candidate Details"
          subtitle="Complete candidate and application information"
          onClose={closeViewModal}
          width="max-w-5xl"
        >
          <div className="p-4 sm:p-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {getProfileImage(selectedCandidate) ? (
                  <img
                    src={getProfileImage(selectedCandidate)}
                    alt={getName(selectedCandidate)}
                    className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-sm"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-600 ring-4 ring-white shadow-sm">
                    {getName(selectedCandidate).charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {getName(selectedCandidate)}
                    </h3>
                    <span
                      className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${statusClass(
                        getAccountStatus(selectedCandidate)
                      )}`}
                    >
                      {capitalize(getAccountStatus(selectedCandidate))}
                    </span>
                  </div>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {getEmail(selectedCandidate)}
                  </p>

                  {getCategoryName(selectedCandidate) && (
                    <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                      <Tags size={11} />
                      {getCategoryName(selectedCandidate)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <UserRound size={14} />
                Candidate Profile
              </h4>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Full Name"
                  value={getName(selectedCandidate)}
                  icon={UserRound}
                />
                <DetailItem
                  label="Email"
                  value={getEmail(selectedCandidate)}
                  icon={Mail}
                />
                <DetailItem
                  label="Phone"
                  value={getPhone(selectedCandidate)}
                  icon={Phone}
                />
                <DetailItem
                  label="Location"
                  value={getLocation(selectedCandidate) || "Not set"}
                  icon={MapPin}
                />
                <DetailItem
                  label="Career Field"
                  value={getCategoryName(selectedCandidate) || "Not set"}
                  icon={Tags}
                />
                <DetailItem
                  label="Experience"
                  value={getExperience(selectedCandidate) || "Not set"}
                  icon={BriefcaseBusiness}
                />
                <DetailItem
                  label="Account Status"
                  value={capitalize(getAccountStatus(selectedCandidate))}
                  icon={ShieldCheck}
                />
                <DetailItem
                  label="Joined"
                  value={formatDate(getCreatedAt(selectedCandidate))}
                  icon={CalendarDays}
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Tags size={14} />
                Skills
              </h4>

              {splitSkills(getSkills(selectedCandidate)).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {splitSkills(getSkills(selectedCandidate)).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-4 text-center">
                  <p className="text-sm text-slate-400">No skills added.</p>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <BriefcaseBusiness size={14} />
                Applications ({getApplications(selectedCandidate).length})
              </h4>

              {getApplications(selectedCandidate).length > 0 ? (
                <div className="space-y-3">
                  {getApplications(selectedCandidate).map((application) => (
                    <div
                      key={application.application_id}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h5 className="text-sm font-bold text-slate-900">
                          {application.job_title ||
                            `Job #${application.job_id}`}
                        </h5>
                        <span
                          className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${statusClass(
                            application.application_status || "Applied"
                          )}`}
                        >
                          {application.application_status || "Applied"}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailItem
                          label="Company"
                          value={application.company_name}
                          icon={BriefcaseBusiness}
                        />
                        <DetailItem
                          label="Recruiter"
                          value={application.recruiter_name}
                          icon={UserRound}
                        />
                        <DetailItem
                          label="Applied On"
                          value={formatDateTime(application.applied_at)}
                          icon={CalendarDays}
                        />
                        <DetailItem
                          label="Application ID"
                          value={application.application_id}
                          icon={CheckCircle2}
                        />
                      </div>

                      {(application.interview_date ||
                        application.interview_note) && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {application.interview_date && (
                            <DetailItem
                              label="Interview Date"
                              value={formatDateTime(
                                application.interview_date
                              )}
                              icon={CalendarDays}
                            />
                          )}
                          {application.interview_note && (
                            <DetailItem
                              label="Interview Note"
                              value={application.interview_note}
                              icon={BriefcaseBusiness}
                            />
                          )}
                        </div>
                      )}

                      {application.cover_letter && (
                        <div className="mt-3">
                          <DetailItem
                            label="Cover Letter"
                            value={application.cover_letter}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-5 text-center">
                  <BriefcaseBusiness
                    size={28}
                    className="mx-auto mb-2 text-slate-300"
                  />
                  <p className="text-sm font-medium text-slate-500">
                    No application found.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    This candidate has not applied to a job yet.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const candidate = selectedCandidate;
                  closeViewModal();
                  openEditModal(candidate);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
              >
                <Pencil size={15} />
                Edit Candidate
              </button>

              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {formMode && (
        <ModalShell
          title={formMode === "add" ? "Add Candidate" : "Edit Candidate"}
          subtitle={
            formMode === "add"
              ? "Create a candidate account and profile."
              : "Update candidate account and profile."
          }
          onClose={closeFormModal}
          width="max-w-2xl"
        >
          <div className="p-4 sm:p-6">
            {formError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Full Name"
                required
                value={form.name}
                placeholder="Enter candidate name"
                onChange={(value) => setField("name", value)}
              />
              <InputField
                label="Email"
                required
                type="email"
                value={form.email}
                placeholder="candidate@example.com"
                onChange={(value) => setField("email", value)}
              />
              <InputField
                label="Phone"
                required
                type="tel"
                value={form.phone}
                placeholder="10 digit mobile number"
                onChange={(value) =>
                  setField(
                    "phone",
                    value.replace(/\D/g, "").slice(0, 10)
                  )
                }
              />
              <InputField
                label={
                  formMode === "add"
                    ? "Password"
                    : "New Password (optional)"
                }
                required={formMode === "add"}
                type="password"
                value={form.password}
                placeholder={
                  formMode === "add"
                    ? "Minimum 6 characters"
                    : "Leave blank to keep current"
                }
                onChange={(value) => setField("password", value)}
              />

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Career Field
                  <span className="ml-1 text-rose-500">*</span>
                </span>

                <select
                  value={form.category_id}
                  onChange={(event) =>
                    setField("category_id", event.target.value)
                  }
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select career field</option>
                  {formCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {formCategories.length === 0 && (
                  <p className="mt-1 text-[10px] text-rose-500">
                    No career fields found. Please check categories API.
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Account Status
                </span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setField("status", event.target.value)
                  }
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Skills
                </span>
                <textarea
                  rows={3}
                  value={form.skills}
                  onChange={(event) =>
                    setField("skills", event.target.value)
                  }
                  placeholder="React, JavaScript, Node.js, MongoDB"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Separate skills with commas.
                </p>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Experience
                </span>
                <input
                  type="text"
                  value={form.experience}
                  onChange={(event) =>
                    setField("experience", event.target.value)
                  }
                  placeholder="Fresher / 1-2 years / 3-5 years"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeFormModal}
                disabled={saveLoading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCandidate}
                disabled={saveLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {formMode === "add" ? "Add Candidate" : "Save Changes"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      {deleteCandidate && (
        <ModalShell
          title="Delete Candidate"
          subtitle="This action may remove related candidate records."
          onClose={closeDeleteModal}
          width="max-w-md"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
                <Trash2 size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-800">
                  Delete {getName(deleteCandidate)}?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-rose-700">
                  The candidate profile may be removed along with related
                  records according to your backend delete logic.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCandidate}
                disabled={deleteLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleteLoading && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Delete Candidate
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ======================================================
          APPLICATION ACTION MODAL
      ====================================================== */}

      {showActionModal && actionCandidate && (
        <ModalShell
          title={
            actionType === "interview"
              ? "Schedule Interview"
              : actionType === "reject"
              ? "Reject Application"
              : "Select Candidate"
          }
          subtitle={`Application for ${getName(actionCandidate)}`}
          onClose={closeActionModal}
          width="max-w-lg"
        >
          <div className="p-5 sm:p-6">
            {actionType === "interview" && (
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Interview Date & Time
                    <span className="ml-1 text-rose-500">*</span>
                  </span>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(event) =>
                      setInterviewDate(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Interview Note
                  </span>
                  <textarea
                    rows={4}
                    value={interviewNote}
                    onChange={(event) =>
                      setInterviewNote(event.target.value)
                    }
                    placeholder="Interview instructions or note..."
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
            )}

            {actionType === "reject" && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-rose-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-rose-800">
                      Reject this application?
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-rose-700">
                      Application status will be changed to{" "}
                      <strong>Rejected</strong>.
                    </p>
                  </div>
                </div>
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-semibold text-rose-800">
                    Optional Note
                  </span>
                  <textarea
                    rows={3}
                    value={interviewNote}
                    onChange={(event) =>
                      setInterviewNote(event.target.value)
                    }
                    placeholder="Reason / internal note..."
                    className="w-full resize-none rounded-lg border border-rose-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-400"
                  />
                </label>
              </div>
            )}

            {actionType === "select" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      Select this candidate?
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                      Application status will be changed to{" "}
                      <strong>Hired</strong>.
                    </p>
                  </div>
                </div>
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-semibold text-emerald-800">
                    Optional Note
                  </span>
                  <textarea
                    rows={3}
                    value={interviewNote}
                    onChange={(event) =>
                      setInterviewNote(event.target.value)
                    }
                    placeholder="Selection note..."
                    className="w-full resize-none rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                  />
                </label>
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={actionLoading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateApplication}
                disabled={actionLoading}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                  actionType === "reject"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : actionType === "select"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {actionLoading && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {actionType === "interview"
                  ? "Schedule Interview"
                  : actionType === "reject"
                  ? "Reject Application"
                  : "Select Candidate"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default AdminCandidates;