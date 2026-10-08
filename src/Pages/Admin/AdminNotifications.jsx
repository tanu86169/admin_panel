import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Bell,
  CheckCircle2,
  Circle,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X,
  UserRound,
  Send,
  Loader2,
  Mail,
} from "lucide-react";

import Swal from "sweetalert2";

// =========================================================
// API
// =========================================================

const API_URL =
  "http://localhost/job_portal/job-portal-api/api/admin/notifications.php";

const USERS_API =
  "http://localhost/job_portal/job-portal-api/api/admin/users.php";

// =========================================================
// DEFAULT FORM
// =========================================================

const EMPTY_FORM = {
  target: "ALL_CANDIDATES",
  user_id: "",
  title: "",
  message: "",
};

// =========================================================
// TARGET OPTIONS
// =========================================================

const TARGET_OPTIONS = [
  { value: "ALL_USERS", label: "All Users" },
  { value: "ALL_CANDIDATES", label: "All Candidates" },
  { value: "ALL_RECRUITERS", label: "All Recruiters" },
  { value: "SPECIFIC", label: "Specific User" },
];

// =========================================================
// HELPERS
// =========================================================

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
};

const isCandidate = (user) => {
  const role = normalizeRole(user?.role);
  return (
    role === "candidate" ||
    role === "job-seeker" ||
    role === "job_seeker" ||
    role === "jobseeker"
  );
};

const isRecruiter = (user) => {
  const role = normalizeRole(user?.role);
  return role === "recruiter" || role === "employer";
};

const getUserName = (user) => {
  if (!user) return "";
  return (
    user.name ||
    user.full_name ||
    user.username ||
    `User #${user.id}`
  );
};

const getUserEmail = (user) => {
  if (!user) return "";
  return user.email || "";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getNotificationTime = (notification) => {
  const value =
    notification?.created_at ||
    notification?.sent_at ||
    notification?.updated_at ||
    "";
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

// =========================================================
// COMPONENT
// =========================================================

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [recruiterFilter, setRecruiterFilter] = useState("ALL_RECRUITERS");
  const [candidateFilter, setCandidateFilter] = useState("ALL_CANDIDATES");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  /* FETCH NOTIFICATIONS */
  const fetchNotifications = useCallback(
    async ({ showLoader = false } = {}) => {
      try {
        if (showLoader) setLoading(true);

        const response = await axios.get(API_URL, {
          params: { _t: Date.now() },
        });

        const responseData = response?.data;

        let list = [];
        if (Array.isArray(responseData)) list = responseData;
        else if (Array.isArray(responseData?.data)) list = responseData.data;
        else if (Array.isArray(responseData?.notifications))
          list = responseData.notifications;

        const normalized = list
          .map((item) => ({
            ...item,
            id: Number(item.id),
            user_id:
              item.user_id !== null &&
              item.user_id !== undefined &&
              item.user_id !== ""
                ? Number(item.user_id)
                : null,
            is_read: Number(item.is_read) === 1 ? 1 : 0,
          }))
          .filter((item) => Number.isFinite(item.id));

        setNotifications(normalized);

        setSelectedNotification((previous) => {
          if (!previous) return null;
          const updated = normalized.find(
            (item) => Number(item.id) === Number(previous.id)
          );
          return updated || previous;
        });
      } catch (err) {
        console.error("Notification fetch error:", err);
        setError(
          err?.response?.data?.message || "Unable to load notifications."
        );
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    []
  );

  /* FETCH USERS */
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);

      const response = await axios.get(USERS_API, {
        params: { _t: Date.now() },
      });

      const responseData = response?.data;

      let list = [];
      if (Array.isArray(responseData)) list = responseData;
      else if (Array.isArray(responseData?.data)) list = responseData.data;
      else if (Array.isArray(responseData?.users)) list = responseData.users;

      const normalizedUsers = list
        .map((user) => ({
          ...user,
          id: Number(user.id),
          role: normalizeRole(user.role),
        }))
        .filter((user) => Number.isFinite(user.id));

      const uniqueUsersMap = new Map();
      normalizedUsers.forEach((user) => {
        uniqueUsersMap.set(String(user.id), user);
      });

      setUsers(Array.from(uniqueUsersMap.values()));
    } catch (err) {
      console.error("Users fetch error:", err);
      setError(err?.response?.data?.message || "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  /* INITIAL LOAD */
  useEffect(() => {
    fetchNotifications({ showLoader: true });
    fetchUsers();
  }, [fetchNotifications, fetchUsers]);

  /* AUTO REFRESH */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications({ showLoader: false });
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  /* USERS MAP */
  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((user) => map.set(String(user.id), user));
    return map;
  }, [users]);

  /* CANDIDATES */
  const candidateUsers = useMemo(() => {
    return users
      .filter(isCandidate)
      .sort((a, b) => getUserName(a).localeCompare(getUserName(b)));
  }, [users]);

  /* RECRUITERS */
  const recruiterUsers = useMemo(() => {
    return users
      .filter(isRecruiter)
      .sort((a, b) => getUserName(a).localeCompare(getUserName(b)));
  }, [users]);

  /* SELECTABLE USERS */
  const selectableUsers = useMemo(() => {
    const map = new Map();
    [...candidateUsers, ...recruiterUsers].forEach((user) =>
      map.set(String(user.id), user)
    );
    return Array.from(map.values()).sort((a, b) =>
      getUserName(a).localeCompare(getUserName(b))
    );
  }, [candidateUsers, recruiterUsers]);

  /* ENRICH NOTIFICATIONS */
  const enrichedNotifications = useMemo(() => {
    return notifications.map((notification) => {
      const user = usersById.get(String(notification.user_id));
      return {
        ...notification,
        user_name:
          notification.user_name ||
          getUserName(user) ||
          `User #${notification.user_id}`,
        user_email: notification.user_email || getUserEmail(user),
        user_role: notification.user_role || user?.role || "",
      };
    });
  }, [notifications, usersById]);

  /* MATCHING NOTIFICATIONS */
  const matchingNotifications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return enrichedNotifications.filter((notification) => {
      const matchesSearch =
        !searchText ||
        String(notification.title || "").toLowerCase().includes(searchText) ||
        String(notification.message || "")
          .toLowerCase()
          .includes(searchText) ||
        String(notification.user_name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(notification.user_email || "")
          .toLowerCase()
          .includes(searchText);

      if (!matchesSearch) return false;

      if (recruiterFilter !== "ALL_RECRUITERS") {
        if (Number(notification.user_id) !== Number(recruiterFilter))
          return false;
      }

      if (candidateFilter !== "ALL_CANDIDATES") {
        if (Number(notification.user_id) !== Number(candidateFilter))
          return false;
      }

      return true;
    });
  }, [enrichedNotifications, search, recruiterFilter, candidateFilter]);

  /* GROUP BY USER */
  const groupedNotifications = useMemo(() => {
    const userMap = new Map();

    matchingNotifications.forEach((notification) => {
      const userId = Number(notification.user_id);
      if (!Number.isFinite(userId)) return;

      const existing = userMap.get(userId);

      if (!existing) {
        userMap.set(userId, {
          user_id: userId,
          user_name: notification.user_name || `User #${userId}`,
          user_email: notification.user_email || "",
          user_role: notification.user_role || "",
          latestNotification: notification,
          notificationCount: 1,
          unreadCount: Number(notification.is_read) === 1 ? 0 : 1,
          readCount: Number(notification.is_read) === 1 ? 1 : 0,
        });
        return;
      }

      existing.notificationCount += 1;

      if (Number(notification.is_read) === 1) existing.readCount += 1;
      else existing.unreadCount += 1;

      const existingTime = getNotificationTime(existing.latestNotification);
      const newTime = getNotificationTime(notification);

      if (newTime >= existingTime) {
        existing.latestNotification = notification;
        existing.user_name = notification.user_name || existing.user_name;
        existing.user_email = notification.user_email || existing.user_email;
        existing.user_role = notification.user_role || existing.user_role;
      }
    });

    return Array.from(userMap.values()).sort((a, b) => {
      return (
        getNotificationTime(b.latestNotification) -
        getNotificationTime(a.latestNotification)
      );
    });
  }, [matchingNotifications]);

  /* STATS */
  const totalUserCount = groupedNotifications.length;
  const unreadUserCount = groupedNotifications.filter(
    (item) => item.unreadCount > 0
  ).length;
  const readUserCount = groupedNotifications.filter(
    (item) => item.unreadCount === 0
  ).length;
  const totalNotificationCount = groupedNotifications.reduce(
    (total, item) => total + item.notificationCount,
    0
  );

  /* CURRENT FILTER LABEL */
  const currentFilterLabel = useMemo(() => {
    if (recruiterFilter !== "ALL_RECRUITERS") {
      const recruiter = recruiterUsers.find(
        (user) => Number(user.id) === Number(recruiterFilter)
      );
      return recruiter
        ? `Recruiter: ${getUserName(recruiter)}`
        : "Selected Recruiter";
    }

    if (candidateFilter !== "ALL_CANDIDATES") {
      const candidate = candidateUsers.find(
        (user) => Number(user.id) === Number(candidateFilter)
      );
      return candidate
        ? `Candidate: ${getUserName(candidate)}`
        : "Selected Candidate";
    }

    return "All Users";
  }, [recruiterFilter, candidateFilter, recruiterUsers, candidateUsers]);

  const resetFilters = () => {
    setSearch("");
    setRecruiterFilter("ALL_RECRUITERS");
    setCandidateFilter("ALL_CANDIDATES");
  };

  const handleRecruiterFilterChange = (value) => {
    setRecruiterFilter(value);
    if (value !== "ALL_RECRUITERS") setCandidateFilter("ALL_CANDIDATES");
  };

  const handleCandidateFilterChange = (value) => {
    setCandidateFilter(value);
    if (value !== "ALL_CANDIDATES") setRecruiterFilter("ALL_RECRUITERS");
  };

  /* OPEN ADD */
  const openAddModal = () => {
    setEditingNotification(null);
    setForm({ ...EMPTY_FORM, target: "ALL_CANDIDATES" });
    setError("");
    setShowModal(true);
  };

  /* OPEN EDIT */
  const openEditModal = (notification) => {
    setEditingNotification(notification);
    setForm({
      target: "SPECIFIC",
      user_id: notification.user_id ? String(notification.user_id) : "",
      title: notification.title || "",
      message: notification.message || "",
    });
    setError("");
    setShowModal(true);
  };

  const resetAndCloseModal = () => {
    setShowModal(false);
    setEditingNotification(null);
    setForm({ ...EMPTY_FORM });
    setError("");
  };

  const closeModal = () => {
    if (saving) return;
    resetAndCloseModal();
  };

  const openViewModal = (notification) => {
    setSelectedNotification(notification);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedNotification(null);
  };

  const handleFormChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
  };

  /* RECIPIENT USERS */
  const recipientUsers = useMemo(() => {
    if (editingNotification) {
      const user = selectableUsers.find(
        (item) =>
          Number(item.id) === Number(editingNotification.user_id)
      );
      return user ? [user] : [];
    }

    if (form.target === "ALL_USERS") return selectableUsers;
    if (form.target === "ALL_CANDIDATES") return candidateUsers;
    if (form.target === "ALL_RECRUITERS") return recruiterUsers;
    if (form.target === "SPECIFIC") {
      const user = selectableUsers.find(
        (item) => Number(item.id) === Number(form.user_id)
      );
      return user ? [user] : [];
    }

    return [];
  }, [
    editingNotification,
    form.target,
    form.user_id,
    selectableUsers,
    candidateUsers,
    recruiterUsers,
  ]);

  /* SUBMIT */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const title = form.title.trim();
    const message = form.message.trim();

    if (!title) return setError("Please enter notification title.");
    if (!message) return setError("Please enter notification message.");

    /* EDIT */
    if (editingNotification) {
      if (!editingNotification.user_id)
        return setError("Notification recipient is missing.");

      try {
        setSaving(true);

        const payload = {
          id: Number(editingNotification.id),
          user_id: Number(editingNotification.user_id),
          title,
          message,
          type: "General",
          is_read: Number(editingNotification.is_read) === 1 ? 1 : 0,
          related_id:
            editingNotification.related_id !== null &&
            editingNotification.related_id !== undefined &&
            editingNotification.related_id !== ""
              ? Number(editingNotification.related_id)
              : null,
        };

        const response = await axios.put(API_URL, payload);

        if (response?.data?.success === false) {
          throw new Error(
            response?.data?.message || "Unable to update notification."
          );
        }

        await fetchNotifications({ showLoader: false });
        resetAndCloseModal();

        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Notification updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Update notification error:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to update notification."
        );
      } finally {
        setSaving(false);
      }

      return;
    }

    /* CREATE */
    if (recipientUsers.length === 0)
      return setError("No recipient found for this selection.");

    try {
      setSaving(true);

      const requests = recipientUsers.map((recipient) =>
        axios.post(API_URL, {
          user_id: Number(recipient.id),
          title,
          message,
          type: "General",
          is_read: 0,
          related_id: null,
        })
      );

      const results = await Promise.allSettled(requests);

      let successCount = 0;
      let failedCount = 0;

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value?.data?.success === false) failedCount++;
          else successCount++;
        } else {
          failedCount++;
        }
      });

      if (successCount === 0) {
        throw new Error(
          "Notification could not be sent to any recipient."
        );
      }

      await fetchNotifications({ showLoader: false });
      resetAndCloseModal();

      if (failedCount > 0) {
        await Swal.fire({
          icon: "warning",
          title: "Partially Sent",
          html: `
            <div style="line-height:1.8">
              <b>${successCount}</b> notification(s) sent successfully.<br/>
              <b>${failedCount}</b> notification(s) failed.
            </div>
          `,
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "Notification Sent",
          text: `${successCount} notification(s) sent successfully.`,
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Create notification error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send notification."
      );
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */
  const handleDelete = async (notification) => {
    if (!notification?.id) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Notification?",
      html: `
        <div style="line-height:1.6">
          This notification will be permanently deleted.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      setDeleting(true);

      const response = await axios.delete(API_URL, {
        data: { id: Number(notification.id) },
      });

      if (response?.data?.success === false) {
        throw new Error(
          response?.data?.message || "Unable to delete notification."
        );
      }

      setNotifications((previous) =>
        previous.filter(
          (item) => Number(item.id) !== Number(notification.id)
        )
      );

      if (
        Number(selectedNotification?.id) === Number(notification.id)
      ) {
        closeViewModal();
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Notification deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Delete notification error:", err);
      await Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to delete notification.",
      });
    } finally {
      setDeleting(false);
    }
  };

  /* REFRESH */
  const handleRefresh = async () => {
    await Promise.all([
      fetchNotifications({ showLoader: false }),
      fetchUsers(),
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* TOP ACTION BAR */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg md:text-xl">
              Notifications
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
              {totalUserCount} user{totalUserCount !== 1 ? "s" : ""} ·{" "}
              {totalNotificationCount} total notification
              {totalNotificationCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 sm:px-3.5 sm:text-sm"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 sm:flex-none sm:px-4 sm:text-sm"
            >
              <Plus size={17} />
              <span>Send Notification</span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Users</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalUserCount}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {totalNotificationCount} total notifications
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Unread Users</p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {unreadUserCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Circle size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Read Users</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {readUserCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative w-full xl:flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, message, user, email..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="w-full xl:w-64">
              <select
                value={recruiterFilter}
                onChange={(event) =>
                  handleRecruiterFilterChange(event.target.value)
                }
                className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="ALL_RECRUITERS">All Recruiters</option>
                {recruiterUsers.map((recruiter) => (
                  <option key={recruiter.id} value={recruiter.id}>
                    {getUserName(recruiter)}
                    {recruiter.email ? ` — ${recruiter.email}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full xl:w-64">
              <select
                value={candidateFilter}
                onChange={(event) =>
                  handleCandidateFilterChange(event.target.value)
                }
                className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="ALL_CANDIDATES">All Candidates</option>
                {candidateUsers.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {getUserName(candidate)}
                    {candidate.email ? ` — ${candidate.email}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {(search ||
              recruiterFilter !== "ALL_RECRUITERS" ||
              candidateFilter !== "ALL_CANDIDATES") && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <X size={16} />
                Reset
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Showing:
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {currentFilterLabel}
            </span>
            {search && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                Search: "{search}"
              </span>
            )}
          </div>
        </div>

        {/* TABLE INFO */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {currentFilterLabel}
            </span>
          </p>
          <p className="text-sm text-slate-500">
            {groupedNotifications.length} user
            {groupedNotifications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 size={22} className="animate-spin" />
                Loading notifications...
              </div>
            </div>
          ) : groupedNotifications.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Bell size={26} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                No notifications found
              </h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                No notification matches the selected recruiter, candidate or
                search filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Notification
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      User
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Notifications
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Latest Date
                    </th>
                    <th className="px-5 py-4 text-right text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {groupedNotifications.map((group) => {
                    const notification = group.latestNotification;
                    const hasUnread = group.unreadCount > 0;

                    return (
                      <tr
                        key={group.user_id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                              <Bell size={17} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {notification.title || "Untitled Notification"}
                              </p>
                              <p className="mt-1 max-w-[350px] truncate text-sm text-slate-500">
                                {notification.message || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                              <User size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">
                                {group.user_name || `User #${group.user_id}`}
                              </p>
                              {group.user_email && (
                                <p className="text-xs text-slate-500">
                                  {group.user_email}
                                </p>
                              )}
                              {group.user_role && (
                                <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600">
                                  {group.user_role}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              <Bell size={13} />
                              {group.notificationCount}{" "}
                              {group.notificationCount === 1
                                ? "Notification"
                                : "Notifications"}
                            </span>
                            {group.unreadCount > 0 && (
                              <span className="text-xs text-orange-600">
                                {group.unreadCount} unread
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {hasUnread ? (
                            <div className="flex flex-col items-start gap-1">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                <Circle size={14} />
                                Unread
                              </span>
                              {group.readCount > 0 && (
                                <span className="text-xs text-slate-400">
                                  {group.readCount} read
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle2 size={14} />
                              Read
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            notification.created_at || notification.sent_at
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openViewModal(notification)}
                              title="View Latest Notification"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(notification)}
                              title="Edit Latest Notification"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              disabled={deleting}
                              onClick={() => handleDelete(notification)}
                              title="Delete Latest Notification"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingNotification ? "Edit Notification" : "Send Notification"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingNotification
                    ? "Update notification content."
                    : "Send notification to candidates or recruiters."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!editingNotification ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Send To
                  </label>
                  <select
                    value={form.target}
                    onChange={(event) =>
                      handleFormChange("target", event.target.value)
                    }
                    className="h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {TARGET_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Recipient
                  </label>
                  <div className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3">
                    <UserRound size={17} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {editingNotification.user_name ||
                          `User #${editingNotification.user_id}`}
                      </p>
                      {editingNotification.user_email && (
                        <p className="text-xs text-slate-500">
                          {editingNotification.user_email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!editingNotification && form.target === "SPECIFIC" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select User
                  </label>
                  <select
                    value={form.user_id}
                    onChange={(event) =>
                      handleFormChange("user_id", event.target.value)
                    }
                    className="h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select candidate or recruiter</option>
                    {selectableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {getUserName(user)}
                        {user.email ? ` — ${user.email}` : ""}
                        {user.role ? ` (${user.role})` : ""}
                      </option>
                    ))}
                  </select>
                  {usersLoading && (
                    <p className="mt-2 text-xs text-slate-500">
                      Loading users...
                    </p>
                  )}
                </div>
              )}

              {!editingNotification && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Recipients
                      </p>
                      <p className="mt-1 text-sm text-blue-700">
                        {recipientUsers.length === 0
                          ? "No recipient selected"
                          : `${recipientUsers.length} user${
                              recipientUsers.length !== 1 ? "s" : ""
                            } will receive this notification.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleFormChange("title", event.target.value)
                  }
                  placeholder="Enter notification title"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(event) =>
                    handleFormChange("message", event.target.value)
                  }
                  placeholder="Enter notification message"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs leading-5 text-slate-600">
                  <span className="font-semibold text-slate-800">
                    Read/Unread:
                  </span>{" "}
                  New notifications are automatically{" "}
                  <span className="font-semibold">Unread</span>. The status
                  changes to <span className="font-semibold">Read</span> when
                  the recipient reads the notification. Admin cannot manually
                  change this status.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    (!editingNotification && recipientUsers.length === 0)
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : editingNotification ? (
                    <>
                      <Pencil size={17} />
                      Update Notification
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Notification Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest notification information
                </p>
              </div>

              <button
                type="button"
                onClick={closeViewModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Title
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {selectedNotification.title}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Message
                </p>
                <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {selectedNotification.message}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {selectedNotification.user_name ||
                        `User #${selectedNotification.user_id}`}
                    </p>
                    {selectedNotification.user_email && (
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Mail size={14} />
                        {selectedNotification.user_email}
                      </div>
                    )}
                    {selectedNotification.user_role && (
                      <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                        {selectedNotification.user_role}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  {Number(selectedNotification.is_read) === 1 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={14} />
                      Read
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                      <Circle size={14} />
                      Unread
                    </span>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Date
                  </p>
                  <p className="text-sm text-slate-700">
                    {formatDate(
                      selectedNotification.created_at ||
                        selectedNotification.sent_at
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;