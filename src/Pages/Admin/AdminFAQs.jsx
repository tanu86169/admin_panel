import React, { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Star,
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  GripVertical,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// =====================================================
// ADMIN FAQ CRUD API
// =====================================================

const FAQ_API =
  "http://localhost/job_portal/job-portal-api/api/admin/faqs.php";

const FAQ_CATEGORY_API =
  "http://localhost/job_portal/job-portal-api/api/admin/faq-categories.php";

// =====================================================
// EMPTY FORM
// =====================================================

const EMPTY_FORM = {
  category: "",
  question: "",
  answer: "",
  is_featured: false,
  status: "active",
  sort_order: 0,
};

// =====================================================
// COMPONENT
// =====================================================

const AdminFAQs = () => {
  // ===================================================
  // STATE
  // ===================================================

  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [viewFaq, setViewFaq] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // NORMALIZE FAQ
  // ===================================================

  const normalizeFaq = (faq) => ({
    id: Number(faq?.id || 0),

    category: String(faq?.category || ""),

    question: String(faq?.question || ""),

    answer: String(faq?.answer || ""),

    is_featured:
      Number(faq?.is_featured) === 1 ||
      faq?.is_featured === true ||
      faq?.is_featured === "1",

    status: faq?.status || "active",

    sort_order: Number(faq?.display_order ?? faq?.sort_order ?? 0),

    created_at: faq?.created_at || null,

    updated_at: faq?.updated_at || null,
  });

  // ===================================================
  // SUCCESS MESSAGE
  // ===================================================

  const showSuccessMessage = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // ===================================================
  // FETCH CATEGORIES
  // ===================================================

  const fetchCategories = async () => {
    try {
      const response = await fetch(FAQ_CATEGORY_API, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("FAQ Category API non-JSON response:", text);
        throw new Error(`Server returned ${response.status}. Check FAQ category API.`);
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load FAQ categories.");
      }

      const list = Array.isArray(data?.data?.categories)
        ? data.data.categories
        : Array.isArray(data?.categories)
        ? data.categories
        : [];

      const names = list
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : String(item?.name || item?.category || "").trim()
        )
        .filter(Boolean);

      setCategories([...new Set(names)].sort((a, b) => a.localeCompare(b)));

      return names;
    } catch (err) {
      console.error("FAQ Category Fetch Error:", err);
      return [];
    }
  };

  // ===================================================
  // FETCH FAQS
  // ===================================================

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(FAQ_API, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error("FAQ API non-JSON response:", text);

        throw new Error(
          `Server returned ${response.status}. Check FAQ API.`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load FAQs."
        );
      }

      let faqList = [];

      // -----------------------------------------------
      // API RESPONSE STRUCTURE
      // -----------------------------------------------

      if (Array.isArray(data?.data?.faqs)) {
        faqList = data.data.faqs;
      } else if (Array.isArray(data?.faqs)) {
        faqList = data.faqs;
      } else if (Array.isArray(data?.data)) {
        faqList = data.data;
      }

      const normalizedFaqs = faqList.map(normalizeFaq);

      setFaqs(normalizedFaqs);
      await fetchCategories();
    } catch (err) {
      console.error("FAQ Fetch Error:", err);

      setFaqs([]);
      setCategories([]);

      setError(
        err?.message || "Unable to load FAQs."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchFaqs();
  }, []);

  // ===================================================
  // SORT ALL FAQS
  // ===================================================

  const sortedFaqs = useMemo(() => {
    return [...faqs].sort(
      (a, b) =>
        Number(a.sort_order) - Number(b.sort_order) ||
        Number(a.id) - Number(b.id)
    );
  }, [faqs]);

  // ===================================================
  // FILTER FAQS
  // ===================================================

  const filteredFaqs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return sortedFaqs.filter((faq) => {
      const searchText = [
        faq.question,
        faq.answer,
        faq.category,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchText.includes(searchValue);

      const matchesCategory =
        categoryFilter === "All" ||
        faq.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        faq.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    sortedFaqs,
    search,
    categoryFilter,
    statusFilter,
  ]);

  // ===================================================
  // STATS
  // ===================================================

  const stats = useMemo(() => {
    return {
      total: faqs.length,

      active: faqs.filter(
        (faq) => faq.status === "active"
      ).length,

      inactive: faqs.filter(
        (faq) => faq.status === "inactive"
      ).length,

      featured: faqs.filter(
        (faq) => faq.is_featured
      ).length,
    };
  }, [faqs]);

  // ===================================================
  // OPEN ADD MODAL
  // ===================================================

  const openAddModal = () => {
    setError("");
    setSuccess("");

    setEditingId(null);

    const maxOrder = faqs.length
      ? Math.max(
          ...faqs.map((faq) =>
            Number(faq.sort_order || 0)
          )
        )
      : 0;

    setForm({
      ...EMPTY_FORM,
      sort_order: maxOrder + 1,
    });

    setShowModal(true);
  };

  // ===================================================
  // OPEN EDIT MODAL
  // ===================================================

  const openEditModal = (faq) => {
    setError("");
    setSuccess("");

    setEditingId(Number(faq.id));

    setForm({
      category: faq.category || "",
      question: faq.question || "",
      answer: faq.answer || "",
      is_featured: Boolean(faq.is_featured),
      status: faq.status || "active",
      sort_order: Number(faq.sort_order || 0),
    });

    setShowModal(true);
  };

  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ===================================================
  // CLOSE FORM MODAL
  // ===================================================

  const closeFormModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  // ===================================================
  // SAVE FAQ
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const category = form.category.trim();
    const question = form.question.trim();
    const answer = form.answer.trim();

    if (!category) {
      setError("Category is required.");
      return;
    }

    if (!question) {
      setError("Question is required.");
      return;
    }

    if (!answer) {
      setError("Answer is required.");
      return;
    }

    try {
      setSaving(true);

      const method = editingId ? "PUT" : "POST";

      const payload = {
        ...(editingId
          ? {
              id: Number(editingId),
            }
          : {}),

        category,

        question,

        answer,

        is_featured: form.is_featured
          ? 1
          : 0,

        status: form.status,

        sort_order: Math.max(
          0,
          Number(form.sort_order || 0)
        ),

        display_order: Math.max(
          0,
          Number(form.sort_order || 0)
        ),
      };

      const response = await fetch(
        FAQ_API,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            Accept: "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "Save FAQ non-JSON:",
          text
        );

        throw new Error(
          `Server returned ${response.status}. Check FAQ PHP API.`
        );
      }

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save FAQ."
        );
      }

      const wasEditing =
        Boolean(editingId);

      setShowModal(false);

      setEditingId(null);

      setForm(EMPTY_FORM);

      await fetchFaqs();

      showSuccessMessage(
        wasEditing
          ? "FAQ updated successfully."
          : "FAQ added successfully."
      );
    } catch (err) {
      console.error(
        "FAQ Save Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to save FAQ."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // OPEN ADD CATEGORY MODAL
  // ===================================================

  const openAddCategoryModal = () => {
    setCategoryError("");
    setNewCategoryName("");
    setShowCategoryModal(true);
  };

  // ===================================================
  // CLOSE ADD CATEGORY MODAL
  // ===================================================

  const closeCategoryModal = () => {
    if (categorySaving) return;

    setShowCategoryModal(false);
    setNewCategoryName("");
    setCategoryError("");
  };

  // ===================================================
  // ADD CATEGORY
  // ===================================================

  const handleAddCategory = async (event) => {
    event.preventDefault();

    const categoryName = newCategoryName.trim();

    if (!categoryName) {
      setCategoryError("Category name is required.");
      return;
    }

    if (categoryName.length > 100) {
      setCategoryError("Category name cannot exceed 100 characters.");
      return;
    }

    const existingCategory = categories.some(
      (category) => category.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      setCategoryError("This category already exists.");
      return;
    }

    try {
      setCategorySaving(true);
      setCategoryError("");

      const response = await fetch(FAQ_CATEGORY_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: categoryName,
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Add Category non-JSON:", text);
        throw new Error(`Server returned ${response.status}. Check FAQ category PHP API.`);
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to add category.");
      }

      const updatedCategories = await fetchCategories();

      const createdCategory =
        data?.data?.category?.name ||
        data?.data?.name ||
        categoryName;

      setForm((previous) => ({
        ...previous,
        category: createdCategory,
      }));

      // Make sure the newly created category is available immediately even
      // if the API returns a slightly different response shape.
      if (!updatedCategories.some((item) => item === createdCategory)) {
        setCategories((previous) =>
          [...new Set([...previous, createdCategory])].sort((a, b) =>
            a.localeCompare(b)
          )
        );
      }

      setShowCategoryModal(false);
      setNewCategoryName("");
      setCategoryError("");
      showSuccessMessage(`Category "${createdCategory}" added successfully.`);
    } catch (err) {
      console.error("Add Category Error:", err);
      setCategoryError(err?.message || "Unable to add category.");
    } finally {
      setCategorySaving(false);
    }
  };

  // ===================================================
  // DELETE FAQ
  // ===================================================

  const handleDelete = async (faq) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${faq.question}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${FAQ_API}?id=${encodeURIComponent(
            faq.id
          )}`,
          {
            method: "DELETE",

            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "Delete FAQ non-JSON:",
          text
        );

        throw new Error(
          `Server returned ${response.status}.`
        );
      }

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete FAQ."
        );
      }

      if (
        viewFaq &&
        Number(viewFaq.id) ===
          Number(faq.id)
      ) {
        setViewFaq(null);
        setViewModal(false);
      }

      await fetchFaqs();

      showSuccessMessage(
        "FAQ deleted successfully."
      );
    } catch (err) {
      console.error(
        "FAQ Delete Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete FAQ."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // VIEW FAQ
  // ===================================================

  const handleView = (faq) => {
    setViewFaq(faq);
    setViewModal(true);
  };

  // ===================================================
  // RESET FILTERS
  // ===================================================

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
  };

  // ===================================================
  // UPDATE SORT ORDER
  // ===================================================

  const updateSortOrder = async (
    faq,
    newOrder
  ) => {
    const response =
      await fetch(FAQ_API, {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Accept: "application/json",
        },

        body: JSON.stringify({
          id: Number(faq.id),

          category: faq.category,

          question: faq.question,

          answer: faq.answer,

          is_featured:
            faq.is_featured
              ? 1
              : 0,

          status: faq.status,

          sort_order:
            Number(newOrder),

          display_order:
            Number(newOrder),
        }),
      });

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType.includes(
        "application/json"
      )
    ) {
      const text =
        await response.text();

      console.error(
        "Sort FAQ non-JSON:",
        text
      );

      throw new Error(
        `Server returned ${response.status}.`
      );
    }

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          "Unable to update FAQ order."
      );
    }
  };

  // ===================================================
  // MOVE FAQ
  // ===================================================

  const moveFaq = async (
    faq,
    direction
  ) => {
    const currentIndex =
      sortedFaqs.findIndex(
        (item) =>
          Number(item.id) ===
          Number(faq.id)
      );

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >=
        sortedFaqs.length
    ) {
      return;
    }

    const currentFaq =
      sortedFaqs[currentIndex];

    const targetFaq =
      sortedFaqs[targetIndex];

    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const currentOrder =
        Number(
          currentFaq.sort_order
        );

      const targetOrder =
        Number(
          targetFaq.sort_order
        );

      await updateSortOrder(
        currentFaq,
        targetOrder
      );

      await updateSortOrder(
        targetFaq,
        currentOrder
      );

      await fetchFaqs();

      showSuccessMessage(
        "FAQ order updated successfully."
      );
    } catch (err) {
      console.error(
        "FAQ Order Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to change FAQ order."
      );

      await fetchFaqs();
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-w-0 space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

        <div>
          <div className="flex items-center gap-2 text-blue-600">
            <HelpCircle size={20} />

            <span className="text-sm font-semibold">
              Help Center
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-black text-gray-900 sm:text-3xl">
            FAQ Management
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage questions and answers displayed
            on the public Help & Support page.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={fetchFaqs}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />

            Add FAQ
          </button>

        </div>
      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} />

            {success}
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !showModal && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

          <div className="flex items-center gap-3">
            <XCircle size={18} />

            {error}
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {[
          [
            "Total FAQs",
            stats.total,
            "bg-blue-50 text-blue-600",
          ],
          [
            "Active",
            stats.active,
            "bg-green-50 text-green-600",
          ],
          [
            "Inactive",
            stats.inactive,
            "bg-gray-100 text-gray-600",
          ],
          [
            "Featured",
            stats.featured,
            "bg-amber-50 text-amber-600",
          ],
        ].map(
          ([
            label,
            value,
            color,
          ]) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">
                {label}
              </p>

              <div className="mt-2 flex items-center justify-between">

                <h2 className="text-2xl font-black text-gray-900">
                  {value}
                </h2>

                <div
                  className={`rounded-xl p-2.5 ${color}`}
                >
                  <HelpCircle size={19} />
                </div>

              </div>
            </div>
          )
        )}

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_170px_auto]">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search question, answer or category..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          >
            <option value="All">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          >
            <option value="All">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={16} />

            Reset
          </button>

        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">

          <Filter size={14} />

          Showing{" "}

          <strong className="text-gray-600">
            {filteredFaqs.length}
          </strong>

          {" "}of{" "}

          <strong className="text-gray-600">
            {faqs.length}
          </strong>

          {" "}FAQs

        </div>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-3 text-sm text-gray-500">

              <RefreshCw
                size={18}
                className="animate-spin text-blue-600"
              />

              Loading FAQs...

            </div>

          </div>

        ) : filteredFaqs.length === 0 ? (

          <div className="p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">

              <HelpCircle size={26} />

            </div>

            <h3 className="mt-4 font-bold text-gray-900">
              No FAQs found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>

          </div>

        ) : (

          <div className="w-full overflow-x-auto">

            <table className="min-w-[1100px] w-full">

              <thead>

                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-500">

                  <th className="w-[55px] px-3 py-4">
                    #
                  </th>

                  <th className="w-[150px] px-3 py-4">
                    Category
                  </th>

                  <th className="w-[250px] px-3 py-4">
                    Question
                  </th>

                  <th className="w-[280px] px-3 py-4">
                    Answer
                  </th>

                  <th className="w-[120px] px-3 py-4">
                    Status
                  </th>

                  <th className="w-[100px] px-3 py-4">
                    Featured
                  </th>

                  <th className="w-[180px] px-3 py-4">
                    Order
                  </th>

                  {/* STICKY ACTIONS */}
                  <th className="sticky right-0 z-20 w-[150px] border-l border-gray-200 bg-gray-50 px-3 py-4 text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredFaqs.map(
                  (faq, index) => {

                    const globalIndex =
                      sortedFaqs.findIndex(
                        (item) =>
                          Number(
                            item.id
                          ) ===
                          Number(faq.id)
                      );

                    const isFirst =
                      globalIndex ===
                      0;

                    const isLast =
                      globalIndex ===
                      sortedFaqs.length -
                        1;

                    return (
                      <tr
                        key={faq.id}
                        className="group transition hover:bg-gray-50"
                      >

                        {/* NUMBER */}

                        <td className="px-3 py-4 align-top text-sm font-semibold text-gray-400">
                          {index + 1}
                        </td>

                        {/* CATEGORY */}

                        <td className="px-3 py-4 align-top">

                          <span
                            title={
                              faq.category
                            }
                            className="inline-flex max-w-[130px] truncate rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"
                          >
                            {faq.category}
                          </span>

                        </td>

                        {/* QUESTION */}

                        <td className="px-3 py-4 align-top">

                          <p
                            title={
                              faq.question
                            }
                            className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900"
                          >
                            {faq.question}
                          </p>

                        </td>

                        {/* ANSWER */}

                        <td className="px-3 py-4 align-top">

                          <p
                            title={
                              faq.answer
                            }
                            className="line-clamp-2 text-sm leading-5 text-gray-500"
                          >
                            {faq.answer}
                          </p>

                        </td>

                        {/* STATUS */}

                        <td className="px-3 py-4 align-top">

                          {faq.status ===
                          "active" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">

                              <CheckCircle2
                                size={12}
                              />

                              Active

                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">

                              <XCircle
                                size={12}
                              />

                              Inactive

                            </span>
                          )}

                        </td>

                        {/* FEATURED */}

                        <td className="px-3 py-4 align-top">

                          {faq.is_featured ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">

                              <Star
                                size={14}
                                fill="currentColor"
                              />

                              Yes

                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No
                            </span>
                          )}

                        </td>

                        {/* ORDER */}

                        <td className="px-3 py-4 align-top">

                          <div className="flex items-center gap-1">

                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600">

                              <GripVertical
                                size={14}
                              />

                              {faq.sort_order}

                            </span>

                            <button
                              type="button"
                              disabled={
                                saving ||
                                isFirst
                              }
                              onClick={() =>
                                moveFaq(
                                  faq,
                                  "up"
                                )
                              }
                              title="Move Up"
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ArrowUp
                                size={12}
                              />
                            </button>

                            <button
                              type="button"
                              disabled={
                                saving ||
                                isLast
                              }
                              onClick={() =>
                                moveFaq(
                                  faq,
                                  "down"
                                )
                              }
                              title="Move Down"
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ArrowDown
                                size={12}
                              />
                            </button>

                          </div>

                        </td>

                        {/* =================================================
                            ACTIONS
                            STICKY - ALWAYS VISIBLE
                        ================================================= */}

                        <td className="sticky right-0 z-10 border-l border-gray-100 bg-white px-2 py-4 align-top group-hover:bg-gray-50">

                          <div className="flex items-center justify-center gap-1">

                            {/* VIEW */}

                            <button
                              type="button"
                              title="View FAQ"
                              onClick={() =>
                                handleView(
                                  faq
                                )
                              }
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye
                                size={16}
                              />
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              title="Edit FAQ"
                              onClick={() =>
                                openEditModal(
                                  faq
                                )
                              }
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-amber-50 hover:text-amber-600"
                            >
                              <Edit3
                                size={16}
                              />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              title="Delete FAQ"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                handleDelete(
                                  faq
                                )
                              }
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">

              <div>

                <h2 className="text-xl font-black text-gray-900">
                  {editingId
                    ? "Edit FAQ"
                    : "Add New FAQ"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  This FAQ will be displayed on
                  the public Help Center.
                </p>

              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* FORM ERROR */}

              {error && (
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">

                  <span>
                    {error}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                  >
                    <X size={16} />
                  </button>

                </div>
              )}

              {/* CATEGORY */}

              <div>

                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <button
                    type="button"
                    onClick={openAddCategoryModal}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
                  >
                    <Plus size={14} />
                    Add Category
                  </button>
                </div>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-gray-400">
                  Need a new category? Click <strong className="text-gray-600">Add Category</strong>.
                </p>

              </div>

              {/* QUESTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Question
                </label>

                <input
                  type="text"
                  name="question"
                  value={form.question}
                  onChange={handleChange}
                  maxLength={500}
                  placeholder="Enter FAQ question"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.question.length}/500
                </p>

              </div>

              {/* ANSWER */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Answer
                </label>

                <textarea
                  name="answer"
                  value={form.answer}
                  onChange={handleChange}
                  rows={7}
                  placeholder="Write a helpful answer..."
                  className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

              {/* STATUS / ORDER */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Sort Order
                  </label>

                  <input
                    type="number"
                    name="sort_order"
                    min="0"
                    value={
                      form.sort_order
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>

              {/* FEATURED */}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">

                <input
                  type="checkbox"
                  name="is_featured"
                  checked={
                    form.is_featured
                  }
                  onChange={
                    handleChange
                  }
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                />

                <div>

                  <p className="text-sm font-bold text-gray-800">
                    Mark as Featured
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Featured FAQs can appear in
                    Popular Questions.
                  </p>

                </div>

              </label>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closeFormModal
                  }
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update FAQ"
                    : "Add FAQ"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          ADD CATEGORY MODAL
      ================================================= */}

      {showCategoryModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Add New Category
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Create a category and use it immediately in this FAQ.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCategoryModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-5 p-6">
              {categoryError && (
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <span>{categoryError}</span>
                  <button
                    type="button"
                    onClick={() => setCategoryError("")}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  maxLength={100}
                  placeholder="e.g. Job Applications"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {newCategoryName.length}/100
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  disabled={categorySaving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={categorySaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {categorySaving && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}
                  {categorySaving ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          VIEW MODAL
      ================================================= */}

      {viewModal && viewFaq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {viewFaq.category}
                </span>

                <h2 className="mt-3 text-xl font-black text-gray-900">
                  FAQ Details
                </h2>

              </div>

              <button
                type="button"
                onClick={() => {
                  setViewModal(false);
                  setViewFaq(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* QUESTION */}

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Question
                </p>

                <h3 className="mt-2 text-lg font-bold leading-7 text-gray-900">
                  {viewFaq.question}
                </h3>

              </div>

              {/* ANSWER */}

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Answer
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">
                  {viewFaq.answer}
                </p>

              </div>

              {/* META */}

              <div className="grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl bg-gray-50 p-4">

                  <p className="text-xs text-gray-400">
                    Status
                  </p>

                  <p className="mt-1 font-bold capitalize text-gray-800">
                    {viewFaq.status}
                  </p>

                </div>

                <div className="rounded-xl bg-gray-50 p-4">

                  <p className="text-xs text-gray-400">
                    Featured
                  </p>

                  <p className="mt-1 font-bold text-gray-800">
                    {viewFaq.is_featured
                      ? "Yes"
                      : "No"}
                  </p>

                </div>

                <div className="rounded-xl bg-gray-50 p-4">

                  <p className="text-xs text-gray-400">
                    Sort Order
                  </p>

                  <p className="mt-1 font-bold text-gray-800">
                    {viewFaq.sort_order}
                  </p>

                </div>

              </div>

              {/* VIEW ACTIONS */}

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setViewModal(false);
                    setViewFaq(null);
                  }}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewModal(false);
                    openEditModal(
                      viewFaq
                    );
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Edit3 size={16} />

                  Edit FAQ
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setViewModal(false);
                    handleDelete(
                      viewFaq
                    );
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={16} />

                  Delete FAQ
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminFAQs;