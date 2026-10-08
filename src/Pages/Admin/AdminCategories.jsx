import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  FolderOpen,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Filter,
} from "lucide-react";

const API_URL =
  "http://localhost/job_portal/job-portal-api/api/admin/categories.php";

const EMPTY_FORM = {
  name: "",
  description: "",
  status: "active",
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  /* FETCH */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      if (response.data?.success) {
        setCategories(response.data.data || []);
      } else {
        setError(
          response.data?.message || "Failed to fetch categories."
        );
      }
    } catch (err) {
      console.error("Fetch Categories Error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to connect with categories API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedCategory(null);
    setForm(EMPTY_FORM);
    setActionError("");
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setForm({
      name: category.name || "",
      description: category.description || "",
      status: category.status || "active",
    });
    setSelectedCategory(category);
    setActionError("");
    setShowModal(true);
  };

  const openViewModal = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setSelectedCategory(null);
    setForm(EMPTY_FORM);
    setActionError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setActionError("");

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setActionError("Category name is required.");
      return;
    }
    if (name.length < 2) {
      setActionError(
        "Category name must contain at least 2 characters."
      );
      return;
    }

    try {
      setSaving(true);

      let response;

      if (modalMode === "add") {
        response = await axios.post(
          API_URL,
          { name, description, status: form.status },
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        if (!selectedCategory?.id) {
          setActionError("Category ID is missing.");
          return;
        }
        response = await axios.put(
          API_URL,
          {
            id: selectedCategory.id,
            name,
            description,
            status: form.status,
          },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      if (!response.data?.success) {
        setActionError(response.data?.message || "Operation failed.");
        return;
      }

      setShowModal(false);
      setSelectedCategory(null);
      setForm(EMPTY_FORM);

      await fetchCategories();
    } catch (err) {
      console.error("Save Category Error:", err);
      setActionError(
        err.response?.data?.message ||
          "Something went wrong while saving category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(category.id);
      setActionError("");

      const response = await axios.delete(API_URL, {
        data: { id: category.id },
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data?.success) {
        setActionError(
          response.data?.message || "Failed to delete category."
        );
        return;
      }

      await fetchCategories();
    } catch (err) {
      console.error("Delete Category Error:", err);
      setActionError(
        err.response?.data?.message ||
          "Something went wrong while deleting category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !searchValue ||
        String(category.name || "").toLowerCase().includes(searchValue) ||
        String(category.description || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        String(category.status || "active").toLowerCase() ===
          statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (item) => item.status === "active"
  ).length;
  const inactiveCategories = categories.filter(
    (item) => item.status === "inactive"
  ).length;

  const formatDate = (date) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* TOP ACTION BAR */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg md:text-xl">
              Categories Directory
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
              {filteredCategories.length} categor
              {filteredCategories.length !== 1 ? "ies" : "y"} found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="relative min-w-[160px] flex-1 sm:flex-none sm:min-w-[240px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white sm:text-sm"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-xs outline-none focus:border-blue-500 focus:bg-white sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              onClick={fetchCategories}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 sm:px-3.5 sm:text-sm"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin text-blue-600" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={openAddModal}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 sm:flex-none sm:px-4 sm:text-sm"
            >
              <Plus size={17} />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {actionError && !showModal && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {actionError}
          </div>
        )}

        {/* STATS */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:mb-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Categories</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {totalCategories}
                </h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FolderOpen size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active</p>
                <h2 className="mt-2 text-3xl font-bold text-green-600">
                  {activeCategories}
                </h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Inactive</p>
                <h2 className="mt-2 text-3xl font-bold text-red-600">
                  {inactiveCategories}
                </h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <Loader2 size={28} className="mr-3 animate-spin text-blue-600" />
              Loading categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-20 text-center">
              <FolderOpen
                size={42}
                className="mx-auto mb-3 text-slate-300"
              />
              <p className="text-slate-500">No categories found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                      ID
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                      Category
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                      Description
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-500">
                      Created At
                    </th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category) => {
                    const isActive = category.status === "active";
                    return (
                      <tr
                        key={category.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-slate-600">
                          #{category.id}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {category.name}
                          </div>
                        </td>

                        <td className="max-w-[350px] px-5 py-4 text-slate-500">
                          <div className="truncate">
                            {category.description || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              isActive
                                ? "border border-green-200 bg-green-50 text-green-600"
                                : "border border-red-200 bg-red-50 text-red-600"
                            }`}
                          >
                            {isActive ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {formatDate(category.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openViewModal(category)}
                              title="View Category"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(category)}
                              title="Edit Category"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 transition hover:bg-yellow-500 hover:text-white"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === category.id}
                              onClick={() => handleDeleteCategory(category)}
                              title="Delete Category"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                            >
                              {deletingId === category.id ? (
                                <Loader2 size={17} className="animate-spin" />
                              ) : (
                                <Trash2 size={17} />
                              )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {modalMode === "add" ? "Add Category" : "Edit Category"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modalMode === "add"
                    ? "Create a new job category."
                    : "Update category information."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-5 p-6">
              {actionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {actionError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Development"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter category description..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving && <Loader2 size={17} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : modalMode === "add"
                    ? "Add Category"
                    : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Category Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View category information.
                </p>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-sm text-slate-400">Category ID</p>
                <p className="mt-1 font-semibold text-slate-900">
                  #{selectedCategory.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Category Name</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedCategory.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Description</p>
                <p className="mt-1 text-slate-600">
                  {selectedCategory.description || "No description available."}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Status</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedCategory.status === "active"
                      ? "border border-green-200 bg-green-50 text-green-600"
                      : "border border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {selectedCategory.status === "active"
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-400">Created At</p>
                <p className="mt-1 text-slate-600">
                  {formatDate(selectedCategory.created_at)}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedCategory);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <Pencil size={17} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;