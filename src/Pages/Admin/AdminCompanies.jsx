import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Building2,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Users,
  Globe,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  AlertCircle,
  UserRound,
  Mail,
  Plus,
} from "lucide-react";

const API_URL =
  "http://localhost/job_portal/job-portal-api/api/admin/companies.php";

const STATUS_OPTIONS = [
  "pending",
  "approved",
  "rejected",
  "blocked",
  "suspended",
];

const getInitialForm = () => ({
  id: "",
  recruiter_id: "",
  company_name: "",
  location: "",
  website: "",
  status: "pending",
});

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [recruiters, setRecruiters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(getInitialForm());

  /* FETCH COMPANIES */
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      if (response.data?.success) {
        setCompanies(
          Array.isArray(response.data.companies)
            ? response.data.companies
            : []
        );
      } else {
        setError(response.data?.message || "Unable to fetch companies.");
      }
    } catch (err) {
      console.error("Companies API Error:", err);
      setError(
        err.response?.data?.message ||
          "Companies API se response nahi aa raha."
      );
    } finally {
      setLoading(false);
    }
  };

  /* FETCH RECRUITERS */
  const fetchRecruiters = async () => {
    try {
      const response = await axios.get(`${API_URL}?action=recruiters`);

      if (response.data?.success) {
        setRecruiters(
          Array.isArray(response.data.recruiters)
            ? response.data.recruiters
            : []
        );
      }
    } catch (err) {
      console.error("Recruiters API Error:", err);
      setError(err.response?.data?.message || "Unable to load recruiters.");
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchRecruiters();
  }, []);

  const handleRecruiterChange = (recruiterId) => {
    setForm((prev) => ({ ...prev, recruiter_id: recruiterId }));
  };

  /* FILTER */
  const filteredCompanies = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return companies.filter((company) => {
      const companyName = String(company.company_name || "").toLowerCase();
      const recruiterName = String(company.recruiter_name || "").toLowerCase();
      const recruiterEmail = String(
        company.recruiter_email || ""
      ).toLowerCase();
      const location = String(company.location || "").toLowerCase();
      const website = String(company.website || "").toLowerCase();
      const status = String(company.status || "pending").toLowerCase();

      const matchesSearch =
        !searchText ||
        companyName.includes(searchText) ||
        recruiterName.includes(searchText) ||
        recruiterEmail.includes(searchText) ||
        location.includes(searchText) ||
        website.includes(searchText);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  /* STATS */
  const totalCompanies = companies.length;
  const pendingCompanies = companies.filter(
    (item) => item.status === "pending"
  ).length;
  const approvedCompanies = companies.filter(
    (item) => item.status === "approved"
  ).length;
  const blockedCompanies = companies.filter((item) =>
    ["blocked", "suspended"].includes(item.status)
  ).length;

  /* STATUS STYLE */
  const getStatusStyle = (status) => {
    switch (String(status || "pending").toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-600 border-rose-200";
      case "blocked":
      case "suspended":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-amber-50 text-amber-600 border-amber-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (String(status || "pending").toLowerCase()) {
      case "approved":
        return <CheckCircle size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      case "blocked":
      case "suspended":
        return <Ban size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Pending";
    return String(status).charAt(0).toUpperCase() + String(status).slice(1);
  };

  /* OPEN ADD */
  const openAdd = () => {
    setForm(getInitialForm());
    setEditingCompany(null);
    setShowAddModal(true);
  };

  /* OPEN EDIT */
  const openEdit = (company) => {
    setEditingCompany(company);
    setForm({
      id: company.id,
      recruiter_id: company.recruiter_id || "",
      company_name: company.company_name || "",
      location: company.location || "",
      website: company.website || "",
      status: company.status || "pending",
    });
  };

  /* CLOSE MODAL */
  const closeModal = () => {
    if (saving) return;
    setShowAddModal(false);
    setEditingCompany(null);
    setForm(getInitialForm());
  };

  /* SAVE */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_name.trim()) {
      alert("Company name is required.");
      return;
    }
    if (!form.recruiter_id) {
      alert("Please select recruiter.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        recruiter_id: Number(form.recruiter_id),
        company_name: form.company_name.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
        status: form.status,
      };

      let response;

      if (!editingCompany) {
        response = await axios.post(API_URL, payload, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
      } else {
        response = await axios.put(
          API_URL,
          { ...payload, id: Number(editingCompany.id) },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
      }

      if (response.data?.success) {
        alert(
          response.data.message ||
            (editingCompany
              ? "Company updated successfully."
              : "Company added successfully.")
        );
        closeModal();
        await fetchCompanies();
      } else {
        alert(response.data?.message || "Operation failed.");
      }
    } catch (err) {
      console.error("Save company error:", err);
      alert(err.response?.data?.message || "Unable to save company.");
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */
  const handleDelete = async (company) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${company.company_name}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(company.id);

      const response = await axios.delete(`${API_URL}?id=${company.id}`);

      if (response.data?.success) {
        setCompanies((prev) =>
          prev.filter((item) => Number(item.id) !== Number(company.id))
        );

        if (
          selectedCompany &&
          Number(selectedCompany.id) === Number(company.id)
        ) {
          setSelectedCompany(null);
        }

        alert(response.data.message || "Company deleted successfully.");
      } else {
        alert(response.data?.message || "Delete failed.");
      }
    } catch (err) {
      console.error("Delete company error:", err);
      alert(err.response?.data?.message || "Unable to delete company.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* TOP ACTION BAR */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg md:text-xl">
              Companies Directory
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
              {filteredCompanies.length} compan
              {filteredCompanies.length !== 1 ? "ies" : "y"} found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={fetchCompanies}
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
              onClick={openAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 sm:flex-none sm:px-4 sm:text-sm"
            >
              <Plus size={17} />
              <span>Add Company</span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Companies"
            value={totalCompanies}
            icon={<Building2 size={22} />}
          />
          <StatCard title="Pending" value={pendingCompanies} icon={<Clock size={22} />} />
          <StatCard
            title="Approved"
            value={approvedCompanies}
            icon={<CheckCircle size={22} />}
          />
          <StatCard
            title="Blocked / Suspended"
            value={blockedCompanies}
            icon={<Ban size={22} />}
          />
        </div>

        {/* SEARCH */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company, recruiter, email, location..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="All">All Status</option>
              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status}
                  value={status.charAt(0).toUpperCase() + status.slice(1)}
                >
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            <AlertCircle size={20} />
            <div>
              <p className="font-semibold">Companies API Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw
                className="mx-auto mb-3 animate-spin text-blue-600"
                size={32}
              />
              <p className="text-sm text-slate-500">Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-20 text-center">
              <Building2 size={45} className="mx-auto mb-3 text-slate-300" />
              <h3 className="font-semibold text-slate-700">
                No companies found
              </h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Recruiter</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Website</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50">
                      {/* COMPANY */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                            {company.company_name?.charAt(0)?.toUpperCase() ||
                              "C"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {company.company_name}
                            </p>
                            <p className="text-xs text-slate-400">
                              ID #{company.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* RECRUITER */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserRound size={15} className="text-slate-400" />
                          <span className="font-medium">
                            {company.recruiter_name || "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail size={15} className="text-slate-400" />
                          <span className="text-slate-600">
                            {company.recruiter_email || "—"}
                          </span>
                        </div>
                      </td>

                      {/* LOCATION */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={15} className="text-slate-400" />
                          {company.location || "—"}
                        </div>
                      </td>

                      {/* WEBSITE */}
                      <td className="px-6 py-4">
                        {company.website ? (
                          <a
                            href={
                              company.website.startsWith("http")
                                ? company.website
                                : `https://${company.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <Globe size={14} />
                            Visit
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            company.status
                          )}`}
                        >
                          {getStatusIcon(company.status)}
                          {getStatusLabel(company.status)}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            title="View"
                            onClick={() => setSelectedCompany(company)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            title="Edit"
                            onClick={() => openEdit(company)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            title="Delete"
                            disabled={deletingId === company.id}
                            onClick={() => handleDelete(company)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white disabled:opacity-50"
                          >
                            {deletingId === company.id ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
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

      {/* ADD / EDIT MODAL */}
      {(showAddModal || editingCompany) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCompany ? "Edit Company" : "Add Company"}
                </h2>
                <p className="text-sm text-slate-500">
                  {editingCompany
                    ? "Update company details"
                    : "Create a new company"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <FormField
                label="Company Name"
                value={form.company_name}
                required
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, company_name: value }))
                }
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Recruiter
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <select
                  value={form.recruiter_id}
                  required
                  onChange={(e) => handleRecruiterChange(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select Recruiter</option>
                  {recruiters.map((recruiter) => (
                    <option key={recruiter.id} value={recruiter.id}>
                      {recruiter.name} - {recruiter.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Recruiter Email
                </label>
                <input
                  value={
                    recruiters.find(
                      (item) =>
                        Number(item.id) === Number(form.recruiter_id)
                    )?.email || ""
                  }
                  readOnly
                  placeholder="Recruiter email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
                />
              </div>

              <FormField
                label="Location"
                value={form.location}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, location: value }))
                }
              />

              <FormField
                label="Website"
                value={form.website}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, website: value }))
                }
                placeholder="https://example.com"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && <RefreshCw size={15} className="animate-spin" />}
                {saving
                  ? "Saving..."
                  : editingCompany
                  ? "Update Company"
                  : "Add Company"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedCompany && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Company Details
                </h2>
                <p className="text-sm text-slate-500">
                  Company ID #{selectedCompany.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <InfoBox
                icon={<Building2 size={15} />}
                label="Company Name"
                value={selectedCompany.company_name}
              />
              <InfoBox
                icon={<UserRound size={15} />}
                label="Recruiter"
                value={selectedCompany.recruiter_name}
              />
              <InfoBox
                icon={<Mail size={15} />}
                label="Email"
                value={selectedCompany.recruiter_email}
              />
              <InfoBox
                icon={<MapPin size={15} />}
                label="Location"
                value={selectedCompany.location}
              />
              <InfoBox
                icon={<Globe size={15} />}
                label="Website"
                value={selectedCompany.website}
                isLink
              />
              <InfoBox
                icon={<CheckCircle size={15} />}
                label="Status"
                value={getStatusLabel(selectedCompany.status)}
              />
            </div>

            <div className="flex justify-end border-t bg-slate-50 px-6 py-4">
              <button
                onClick={() => setSelectedCompany(null)}
                className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-medium hover:bg-slate-300"
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

const StatCard = ({ title, value, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
          {value}
        </h2>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>
    </div>
  </div>
);

const FormField = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    <input
      type="text"
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

const InfoBox = ({ icon, label, value, isLink = false }) => {
  const displayValue =
    value !== null && value !== undefined && String(value).trim() !== ""
      ? String(value)
      : "Not provided";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase text-slate-400">
        {icon}
        {label}
      </div>

      {isLink && displayValue !== "Not provided" ? (
        <a
          href={
            displayValue.startsWith("http")
              ? displayValue
              : `https://${displayValue}`
          }
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm font-semibold text-blue-600 hover:underline"
        >
          {displayValue}
        </a>
      ) : (
        <p className="break-words text-sm font-semibold text-slate-800">
          {displayValue}
        </p>
      )}
    </div>
  );
};

export default AdminCompanies;