import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  BriefcaseBusiness,
  ShieldCheck,
  Search,
  RefreshCw,
  Trash2,
  Edit3,
  Eye,
  X,
  Download,
  Mail,
  Phone,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Filter,
  UserPlus,
  FileText,
} from "lucide-react";

// ================= API URL =================
const USERS_API =
  "http://localhost/job_portal/job-portal-api/api/admin/users.php";

// ================= FIELD CONFIG =================
const HIDDEN_FIELDS = [
  "password",
  "password_hash",
  "token",
  "reset_token",
  "remember_token",
  "otp",
];

const READONLY_FIELDS = [
  "id",
  "created_at",
  "updated_at",
  "last_login",
  "jobs_count",
  "applications_count",
];

const BASE_FIELDS = ["name", "email", "phone", "role", "status"];

const TEXTAREA_REGEX =
  /address|bio|about|summary|description|skills|experience|education|headline|objective/i;

const formatLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ================= STAT CARD =================
const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colors = {
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };

  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-500/50 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:h-11 sm:w-11 ${
            colors[color] || colors.purple
          }`}
        >
          <Icon size={20} />
        </div>
        <TrendingUp size={16} className="shrink-0 text-slate-400" />
      </div>
      <p className="mt-4 break-words text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:mt-5">
        {title}
      </p>
      <h2 className="mt-1 truncate text-2xl font-bold text-slate-800 sm:text-3xl">
        {value}
      </h2>
      <p className="mt-2 break-words text-[11px] text-slate-500">{subtitle}</p>
    </div>
  );
};

// ================= MAIN COMPONENT =================
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View User Full Details state
  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Add / Edit / Delete modals states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [extraKeys, setExtraKeys] = useState([]);
  const [deleteUser, setDeleteUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "candidate",
    status: "active",
    password: "",
  });

  const currentAdmin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin") || "{}");
    } catch {
      return {};
    }
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // ---------- helpers ----------
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderValue = (key, value) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-slate-400 font-normal">Not provided</span>;
    }
    if (/(created_at|updated_at|last_login|joined|_at$)/i.test(key)) {
      return formatDate(value);
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === "string" && /^https?:\/\//i.test(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline break-all"
        >
          {value}
        </a>
      );
    }
    return String(value);
  };

  const fetchFullUser = async (id) => {
    const response = await axios.get(`${USERS_API}?id=${id}`);
    if (response.data && response.data.success && response.data.user) {
      return response.data.user;
    }
    return null;
  };

  const fetchUsers = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(USERS_API);

      if (response.data && response.data.success) {
        setUsers(response.data.users || []);
      } else {
        setError(response.data?.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Users API Error:", err);
      setError("Unable to load users. Please check backend API / database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= VIEW =================
  const handleOpenViewModal = async (user) => {
    setViewUser(user);
    setViewLoading(true);

    try {
      const full = await fetchFullUser(user.id);
      if (full) setViewUser({ ...user, ...full });
    } catch (err) {
      console.error("Failed to fetch complete user profile:", err);
    } finally {
      setViewLoading(false);
    }
  };

  // ================= FILTERS =================
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          String(u.id).includes(q)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter(
        (u) => u.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (u) => (u.status || "active").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return result;
  }, [users, search, roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalCandidates = users.filter((u) => u.role === "candidate").length;
  const totalRecruiters = users.filter((u) => u.role === "recruiter").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalActive = users.filter(
    (u) => (u.status || "active") === "active"
  ).length;

  // ================= EXPORT =================
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      showToast("No user records to export", "error");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Role",
      "Status",
      "Created At",
    ];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${(u.name || "").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      `"${(u.phone || "").replace(/"/g, '""')}"`,
      u.role,
      u.status || "active",
      u.created_at || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `jobportal_users_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("User list exported to CSV successfully");
  };

  // ================= ADD USER =================
  const handleOpenAddModal = () => {
    setEditUser(null);
    setExtraKeys([]);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "candidate",
      status: "active",
      password: "",
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) return setFormError("Full name is required");
    if (!formData.email.trim()) return setFormError("Email is required");
    if (!formData.password || formData.password.length < 6)
      return setFormError("Password must be at least 6 characters");

    try {
      setModalLoading(true);
      const res = await axios.post(USERS_API, formData);

      if (res.data && res.data.success) {
        showToast("User created successfully!");
        setIsAddModalOpen(false);
        fetchUsers(true);
      } else {
        setFormError(res.data?.message || "Failed to create user");
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || err.message || "Failed to create user"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // ================= EDIT USER =================
  const buildFormFromUser = (user) => {
    const extras = {};
    Object.keys(user).forEach((key) => {
      if (
        !BASE_FIELDS.includes(key) &&
        !HIDDEN_FIELDS.includes(key) &&
        !READONLY_FIELDS.includes(key) &&
        (user[key] === null || typeof user[key] !== "object")
      ) {
        extras[key] = user[key] ?? "";
      }
    });

    setExtraKeys(Object.keys(extras));
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "candidate",
      status: user.status || "active",
      password: "",
      ...extras,
    });
  };

  const handleOpenEditModal = async (user) => {
    setIsAddModalOpen(false);
    setEditUser(user);
    buildFormFromUser(user);
    setFormError("");

    setEditLoading(true);
    try {
      const full = await fetchFullUser(user.id);
      if (full) {
        const merged = { ...user, ...full };
        setEditUser(merged);
        buildFormFromUser(merged);
      }
    } catch (err) {
      console.error("Failed to fetch complete user profile:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const closeFormModal = () => {
    setIsAddModalOpen(false);
    setEditUser(null);
    setExtraKeys([]);
    setFormError("");
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setFormError("");

    if (!formData.name.trim()) return setFormError("Full name is required");
    if (!formData.email.trim()) return setFormError("Email is required");

    try {
      setModalLoading(true);

      const { password, ...rest } = formData;
      const payload = { id: editUser.id, ...rest };
      if (password && password.trim().length >= 6) {
        payload.password = password.trim();
      } else if (password && password.trim().length > 0) {
        setModalLoading(false);
        return setFormError("New password must be at least 6 characters");
      }

      const res = await axios.put(`${USERS_API}?id=${editUser.id}`, payload);

      if (res.data && res.data.success) {
        showToast("User details updated successfully!");
        closeFormModal();
        fetchUsers(true);
      } else {
        setFormError(res.data?.message || "Failed to update user");
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || err.message || "Failed to update user"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // ================= DELETE USER =================
  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    if (
      deleteUser.role === "admin" ||
      (currentAdmin.id && Number(currentAdmin.id) === Number(deleteUser.id))
    ) {
      showToast("Admin account is fixed and cannot be deleted!", "error");
      setDeleteUser(null);
      return;
    }

    try {
      setModalLoading(true);

      const res = await axios.delete(`${USERS_API}?id=${deleteUser.id}`, {
        data: { id: deleteUser.id },
        headers: { "Content-Type": "application/json" },
      });

      if (res.data && res.data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
        showToast("User deleted successfully!");
        setDeleteUser(null);
        fetchUsers(true);
      } else {
        showToast(res.data?.message || "Failed to delete user", "error");
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to delete user",
        "error"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // ================= BADGES =================
  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return {
          bg: "bg-purple-50 text-purple-600 border-purple-200",
          label: "Admin",
          icon: ShieldCheck,
        };
      case "recruiter":
        return {
          bg: "bg-blue-50 text-blue-600 border-blue-200",
          label: "Recruiter",
          icon: BriefcaseBusiness,
        };
      default:
        return {
          bg: "bg-emerald-50 text-emerald-600 border-emerald-200",
          label: "Candidate",
          icon: UserCheck,
        };
    }
  };

  const getAvatarGradient = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-600 text-white shadow-purple-200";
      case "recruiter":
        return "bg-blue-600 text-white shadow-blue-200";
      default:
        return "bg-emerald-600 text-white shadow-emerald-200";
    }
  };

  const viewEntries = viewUser
    ? [
        ...Object.entries(viewUser).filter(
          ([key]) =>
            !HIDDEN_FIELDS.includes(key) &&
            !["name", "id", "role", "details"].includes(key)
        ),
        ...Object.entries(viewUser.details || {}).map(([key, value]) => [
          `details_${key}`,
          value,
        ]),
      ]
    : [];

  const isFormModalOpen = isAddModalOpen || !!editUser;

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 p-3 text-slate-800 sm:p-4 md:p-6">
      {/* ================= TOAST NOTIFICATION ================= */}
      {toast.show && (
        <div
          className={`fixed bottom-4 left-4 right-4 z-[60] flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl transition-all duration-300 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={20} className="shrink-0 text-rose-500" />
          ) : (
            <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
          )}
          <span className="min-w-0 flex-1 break-words text-sm font-medium">
            {toast.message}
          </span>
          <button
            onClick={() =>
              setToast({ show: false, message: "", type: "success" })
            }
            className="shrink-0 text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ================= TOP ACTION BAR ================= */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg md:text-xl">
            Users Directory
          </h1>
          <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 sm:flex-none sm:px-3.5 sm:text-sm"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing || loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-60 sm:px-3.5 sm:text-sm"
          >
            <RefreshCw
              size={16}
              className={
                refreshing || loading ? "animate-spin text-blue-600" : ""
              }
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 sm:flex-none sm:px-4 sm:text-sm"
          >
            <UserPlus size={17} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* ================= ERROR BANNER ================= */}
      {error && (
        <div className="mb-5 flex w-full flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-500" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
          <button
            onClick={() => fetchUsers(true)}
            className="shrink-0 self-start text-xs font-semibold text-rose-600 underline hover:text-rose-800 sm:self-auto"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ================= STATS CARDS ================= */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Registered Users"
          value={users.length}
          subtitle="All platform accounts"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Active Candidates"
          value={totalCandidates}
          subtitle="Job seekers"
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Verified Recruiters"
          value={totalRecruiters}
          subtitle="Companies & hiring leads"
          icon={BriefcaseBusiness}
          color="blue"
        />
        <StatCard
          title="Platform Administrator"
          value={totalAdmins}
          subtitle="Fixed Superadmin"
          icon={ShieldCheck}
          color="amber"
        />
      </div>

      {/* ================= SEARCH & FILTER TOOLBAR ================= */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name, email, phone, or User ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs sm:text-sm">
              <Filter size={15} className="shrink-0 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="min-w-0 max-w-[140px] cursor-pointer bg-transparent text-slate-700 outline-none sm:max-w-none"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="candidate">Candidates ({totalCandidates})</option>
                <option value="recruiter">Recruiters ({totalRecruiters})</option>
                <option value="admin">Admins ({totalAdmins})</option>
              </select>
            </div>

            <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs sm:text-sm">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-w-0 cursor-pointer bg-transparent text-slate-700 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active ({totalActive})</option>
                <option value="inactive">
                  Inactive ({users.length - totalActive})
                </option>
              </select>
            </div>

            {(search || roleFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                className="px-2 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center sm:py-20">
            <RefreshCw size={36} className="mx-auto animate-spin text-blue-600" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading users directory...
            </p>
          </div>
        ) : (
          <div className="-mx-0 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">
                    User
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">
                    Contact Info
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">
                    Role
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">
                    Portal Activity
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-right sm:px-5 sm:py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center sm:py-16">
                      <Users
                        size={44}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="text-base font-semibold text-slate-700">
                        No users found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try modifying your search or filter criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const roleInfo = getRoleBadge(user.role);
                    const RoleIcon = roleInfo.icon;
                    const isCurrentUser =
                      currentAdmin.id &&
                      Number(currentAdmin.id) === Number(user.id);

                    return (
                      <tr
                        key={user.id}
                        className="text-slate-700 transition hover:bg-slate-50/80"
                      >
                        {/* USER */}
                        <td className="px-3 py-3 sm:px-5 sm:py-4">
                          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm sm:h-10 sm:w-10 ${getAvatarGradient(
                                user.role
                              )}`}
                            >
                              {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : "U"}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="max-w-[120px] truncate font-semibold text-slate-900 sm:max-w-[160px]">
                                  {user.name}
                                </span>
                                {isCurrentUser && (
                                  <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400 sm:gap-2">
                                <span className="whitespace-nowrap">
                                  ID: #{user.id}
                                </span>
                                {user.created_at && (
                                  <>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="hidden whitespace-nowrap sm:inline">
                                      Joined {formatDate(user.created_at)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="px-3 py-3 sm:px-5 sm:py-4">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Mail
                                size={13}
                                className="shrink-0 text-slate-400"
                              />
                              <span className="max-w-[140px] truncate sm:max-w-[180px]">
                                {user.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Phone
                                size={13}
                                className="shrink-0 text-slate-400"
                              />
                              <span className="truncate">
                                {user.phone || "Not provided"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-3 py-3 sm:px-5 sm:py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 text-xs font-semibold sm:px-2.5 ${roleInfo.bg}`}
                          >
                            <RoleIcon size={13} />
                            {roleInfo.label}
                          </span>
                        </td>

                        {/* ACTIVITY */}
                        <td className="px-3 py-3 sm:px-5 sm:py-4">
                          {user.role === "recruiter" && (
                            <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-blue-700">
                              <BriefcaseBusiness
                                size={14}
                                className="shrink-0 text-blue-500"
                              />
                              <span>
                                <b>{user.jobs_count || 0}</b> Jobs
                              </span>
                            </div>
                          )}
                          {user.role === "candidate" && (
                            <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-emerald-700">
                              <FileText
                                size={14}
                                className="shrink-0 text-emerald-500"
                              />
                              <span>
                                <b>{user.applications_count || 0}</b> Apps
                              </span>
                            </div>
                          )}
                          {user.role === "admin" && (
                            <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-purple-700">
                              <ShieldCheck
                                size={14}
                                className="shrink-0 text-purple-500"
                              />
                              <span>Superadmin</span>
                            </div>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-3 py-3 sm:px-5 sm:py-4">
                          {user.status === "inactive" ? (
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 sm:px-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Inactive
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 sm:px-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-3 py-3 text-right sm:px-5 sm:py-4">
                          <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                            <button
                              onClick={() => handleOpenViewModal(user)}
                              title="View Details"
                              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 sm:p-2"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(user)}
                              title="Edit User"
                              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 sm:p-2"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              onClick={() => setDeleteUser(user)}
                              disabled={user.role === "admin"}
                              title={
                                user.role === "admin"
                                  ? "Admin cannot be deleted"
                                  : "Delete User"
                              }
                              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 sm:p-2"
                            >
                              <Trash2 size={15} />
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
        )}

        {/* ================= PAGINATION ================= */}
        {!loading && filteredUsers.length > itemsPerPage && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-3 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className="text-center sm:text-left">
              Page <b className="text-slate-800">{currentPage}</b> of{" "}
              <b className="text-slate-800">{totalPages}</b> &nbsp;(
              {filteredUsers.length} users)
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= VIEW USER MODAL ================= */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5 sm:py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
                <Users size={18} className="shrink-0 text-blue-600" />
                User Profile Details
              </h3>
              <button
                onClick={() => setViewUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {viewLoading ? (
                <div className="py-10 text-center">
                  <RefreshCw
                    size={28}
                    className="mx-auto animate-spin text-blue-600"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Loading complete profile...
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4 sm:gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-sm sm:h-14 sm:w-14 sm:text-xl ${getAvatarGradient(
                        viewUser.role
                      )}`}
                    >
                      {viewUser.name
                        ? viewUser.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="break-words text-base font-bold text-slate-900 sm:text-lg">
                        {viewUser.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        User ID: #{viewUser.id}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          getRoleBadge(viewUser.role).bg
                        }`}
                      >
                        {viewUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                    {viewEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className={`rounded-xl border border-slate-100 bg-slate-50 p-3 ${
                          typeof value === "object" ||
                          (typeof value === "string" && value.length > 60)
                            ? "sm:col-span-2"
                            : ""
                        }`}
                      >
                        <span className="block text-slate-400">
                          {formatLabel(key.replace(/^details_/, ""))}
                        </span>
                        <span className="mt-0.5 block whitespace-pre-wrap break-words font-semibold text-slate-800">
                          {key === "status" ? (
                            <span className="capitalize">
                              {value || "Active"}
                            </span>
                          ) : (
                            renderValue(key, value)
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex shrink-0 flex-col-reverse items-stretch justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
              <button
                onClick={() => {
                  const u = viewUser;
                  setViewUser(null);
                  handleOpenEditModal(u);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <Edit3 size={14} />
                Edit This User
              </button>
              <button
                onClick={() => setViewUser(null)}
                className="rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT USER MODAL ================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
                {editUser ? (
                  <Edit3 size={18} className="shrink-0 text-blue-600" />
                ) : (
                  <UserPlus size={18} className="shrink-0 text-blue-600" />
                )}
                {editUser ? `Edit User #${editUser.id}` : "Create New User"}
              </h3>
              <button
                onClick={closeFormModal}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={editUser ? handleUpdateUser : handleCreateUser}
              className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
            >
              {editLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                  <RefreshCw size={14} className="animate-spin" />
                  Loading complete profile...
                </div>
              )}

              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle size={15} className="shrink-0" />
                  <span className="min-w-0 break-words">{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    {editUser
                      ? "New Password (blank = keep current)"
                      : "Password *"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={editUser ? "••••••••" : "Minimum 6 characters"}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="candidate">Candidate</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {editUser &&
                  extraKeys.map((key) => {
                    const isTextarea =
                      TEXTAREA_REGEX.test(key) ||
                      (typeof formData[key] === "string" &&
                        formData[key].length > 80);
                    const isNumber = typeof editUser[key] === "number";

                    return (
                      <div
                        key={key}
                        className={isTextarea ? "sm:col-span-2" : ""}
                      >
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          {formatLabel(key)}
                        </label>
                        {isTextarea ? (
                          <textarea
                            rows={3}
                            value={formData[key] ?? ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [key]: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                          />
                        ) : (
                          <input
                            type={isNumber ? "number" : "text"}
                            value={formData[key] ?? ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [key]: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || editLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {modalLoading && (
                    <RefreshCw size={14} className="animate-spin" />
                  )}
                  {editUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-sm rounded-t-2xl border border-slate-200 bg-white p-5 text-center shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Delete User Account?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Are you sure you want to delete{" "}
              <b className="text-slate-800">{deleteUser.name}</b>? This action
              is permanent and cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse items-stretch justify-center gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={modalLoading}
                onClick={handleDeleteUser}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-50"
              >
                {modalLoading && (
                  <RefreshCw size={13} className="animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;