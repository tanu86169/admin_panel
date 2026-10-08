import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BookOpen,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Loader2,
  ChevronDown,
  Filter,
} from "lucide-react";

const API_URL =
  "http://localhost/job_portal/job-portal-api/api/admin/articles.php";

const API_ORIGIN = "http://localhost/job_portal/job-portal-api";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "Career Growth",
  image: "",
  status: "published",
};

const CATEGORY_OPTIONS = [
  "Resume & CV",
  "Interview",
  "Career Growth",
  "Job Search",
  "Skills",
  "Career Tips",
];

const getImageUrl = (image) => {
  if (!image) return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }
  return `${API_ORIGIN}/${image.replace(/^\/+/, "")}`;
};

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  /* FETCH */
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      if (response.data?.success) {
        const articleList =
          response.data.articles || response.data.data || [];
        setArticles(Array.isArray(articleList) ? articleList : []);
      } else {
        setArticles([]);
        setError(response.data?.message || "Unable to load articles.");
      }
    } catch (requestError) {
      console.error("FETCH ARTICLES ERROR:", requestError);
      setArticles([]);
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Unable to connect with articles API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openCreate = () => {
    setEditingArticle(null);
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (article) => {
    setEditingArticle(article);
    setForm({
      title: article.title || "",
      description: article.description || "",
      category: article.category || "Career Growth",
      image: article.image || "",
      status: article.status || "published",
    });
    setImageFile(null);
    setImagePreview(article.image_url || getImageUrl(article.image));
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingArticle(null);
    setFormError("");
    setImageFile(null);
    setImagePreview("");
    setForm({ ...EMPTY_FORM });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) return setFormError("Article title is required.");
    if (title.length < 3)
      return setFormError("Title must contain at least 3 characters.");
    if (!description)
      return setFormError("Article description is required.");
    if (!form.category)
      return setFormError("Please select article category.");
    if (!form.status)
      return setFormError("Please select article status.");

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("title", title);
      payload.append("description", description);
      payload.append("category", form.category);
      payload.append("status", form.status);

      if (editingArticle?.id) {
        payload.append("id", String(editingArticle.id));
        payload.append("_method", "PUT");
      }

      if (imageFile) payload.append("image", imageFile);

      const response = await axios.post(API_URL, payload);

      if (!response.data?.success) {
        setFormError(
          response.data?.message ||
            response.data?.error ||
            "Unable to save article."
        );
        return;
      }

      alert(
        editingArticle
          ? "Article updated successfully."
          : "Article added successfully."
      );

      closeModal();
      await fetchArticles();
    } catch (requestError) {
      console.error("SAVE ARTICLE ERROR:", requestError);
      setFormError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Unable to save article."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${article.title}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(article.id);
      setError("");

      const response = await axios.delete(API_URL, {
        data: { id: article.id },
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data?.success) {
        setError(
          response.data?.message || "Unable to delete article."
        );
        return;
      }

      if (selectedArticle?.id === article.id) {
        setSelectedArticle(null);
      }

      alert("Article deleted successfully.");
      await fetchArticles();
    } catch (requestError) {
      console.error("DELETE ARTICLE ERROR:", requestError);
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Unable to delete article."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredArticles = useMemo(() => {
    const value = search.toLowerCase().trim();

    return articles.filter((article) => {
      const matchesSearch =
        !value ||
        article.title?.toLowerCase().includes(value) ||
        article.category?.toLowerCase().includes(value) ||
        article.description?.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const publishedCount = articles.filter(
    (article) => article.status === "published"
  ).length;
  const draftCount = articles.filter(
    (article) => article.status === "draft"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* TOP ACTION BAR */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg md:text-xl">
              Career Advice & Tips
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
              {filteredArticles.length} article
              {filteredArticles.length !== 1 ? "s" : ""} found
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
                placeholder="Search articles..."
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={fetchArticles}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-60 sm:px-3.5 sm:text-sm"
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
              type="button"
              onClick={openCreate}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 sm:flex-none sm:px-4 sm:text-sm"
            >
              <Plus size={17} />
              <span>Add Article</span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:mb-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Articles</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {articles.length}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Published</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {publishedCount}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Eye size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Drafts</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {draftCount}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Pencil size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <RefreshCw
                size={28}
                className="mx-auto mb-3 animate-spin text-blue-600"
              />
              Loading articles...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <BookOpen
                size={42}
                className="mx-auto mb-3 text-slate-300"
              />
              No articles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Article
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Category
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Created
                    </th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-slate-50">
                      {/* ARTICLE */}
                      <td className="max-w-md px-5 py-4">
                        <div className="flex items-center gap-3">
                          {article.image_url ? (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="h-12 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                              <BookOpen size={20} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {article.title}
                            </p>
                            <p className="mt-1 truncate text-sm text-slate-500">
                              {article.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {article.category || "Career Tips"}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                            article.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {article.status || "published"}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(article.created_at)}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedArticle(article)}
                            className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                            title="View article"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(article)}
                            className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100"
                            title="Edit article"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(article)}
                            disabled={deletingId === article.id}
                            className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
                            title="Delete article"
                          >
                            {deletingId === article.id ? (
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  {selectedArticle.category || "Career Tips"}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {(selectedArticle.image_url || selectedArticle.image) && (
                <img
                  src={
                    selectedArticle.image_url ||
                    getImageUrl(selectedArticle.image)
                  }
                  alt={selectedArticle.title}
                  className="h-56 w-full rounded-xl object-cover"
                />
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Category
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedArticle.category || "Career Tips"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  <p className="mt-1 font-semibold capitalize text-slate-800">
                    {selectedArticle.status || "published"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Created
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(selectedArticle.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Full Description
                </h3>
                <p className="whitespace-pre-wrap leading-8 text-slate-700">
                  {selectedArticle.description ||
                    "No description available."}
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const article = selectedArticle;
                    setSelectedArticle(null);
                    openEdit(article);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Pencil size={17} />
                  Edit Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[95vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingArticle ? "Edit Article" : "Add Article"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingArticle
                    ? "Update article information."
                    : "Create a new career advice article."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div>
              <label
                htmlFor="article-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Title *
              </label>
              <input
                id="article-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter article title"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="article-category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Category
                </label>
                <select
                  id="article-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="article-status"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Status
                </label>
                <select
                  id="article-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="article-image-file"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Article Image{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="article-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
              />
              <p className="mt-1 text-xs text-slate-500">
                JPG, PNG, WEBP or GIF, maximum 5MB.
              </p>

              {imagePreview && (
                <div className="relative mt-3">
                  <img
                    src={imagePreview}
                    alt="Article preview"
                    className="h-40 w-full rounded-xl object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="article-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description *
              </label>
              <textarea
                id="article-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={7}
                placeholder="Write article content..."
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && (
                  <Loader2 size={17} className="animate-spin" />
                )}
                {saving
                  ? "Saving..."
                  : editingArticle
                  ? "Save Changes"
                  : "Add Article"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminArticles;