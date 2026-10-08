import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

import {
  Save,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  Wrench,
  UserPlus,
  BriefcaseBusiness,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Info,
  Server,
  Lock,
} from "lucide-react";

import { API_BASE } from "../../Config/api";
// =========================================================
// API
// =========================================================

const API_URL = `${API_BASE}/admin/settings.php`;

// =========================================================
// DEFAULT SETTINGS
// =========================================================

const DEFAULT_SETTINGS = {
  site_name: "",
  site_email: "",
  site_phone: "",
  maintenance_mode: "0",
  allow_registration: "1",
  allow_job_posting: "1",
};

// =========================================================
// HELPERS
// =========================================================

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const normalizeSettings = (data = []) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => ({
      ...item,
      setting_key: String(item?.setting_key || "").trim(),
      setting_value: normalizeValue(item?.setting_value),
    }))
    .filter((item) => item.setting_key);
};

const cloneSettings = (data) => {
  return JSON.parse(JSON.stringify(data));
};

// =========================================================
// COMPONENT
// =========================================================

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [originalSettings, setOriginalSettings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [lastSaved, setLastSaved] = useState(null);

  // =======================================================
  // FETCH SETTINGS
  // =======================================================

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.get(API_URL, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load settings."
        );
      }

      const fetchedSettings = normalizeSettings(
        response.data?.settings || []
      );

      /*
       * Backend se agar kuch default settings missing hain,
       * frontend unhe automatically add karega.
       */

      const settingMap = {};

      fetchedSettings.forEach((item) => {
        settingMap[item.setting_key] = item;
      });

      const completeSettings = Object.keys(
        DEFAULT_SETTINGS
      ).map((key) => {
        if (settingMap[key]) {
          return settingMap[key];
        }

        return {
          setting_key: key,
          setting_value: DEFAULT_SETTINGS[key],
        };
      });

      /*
       * Backend ke extra settings bhi preserve honge.
       */

      const defaultKeys = new Set(
        Object.keys(DEFAULT_SETTINGS)
      );

      fetchedSettings.forEach((item) => {
        if (!defaultKeys.has(item.setting_key)) {
          completeSettings.push(item);
        }
      });

      setSettings(completeSettings);
      setOriginalSettings(cloneSettings(completeSettings));
    } catch (err) {
      console.error("Fetch settings error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to fetch settings. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // =======================================================
  // GET SETTING
  // =======================================================

  const getSetting = useCallback(
    (key) => {
      return settings.find(
        (item) => item.setting_key === key
      );
    },
    [settings]
  );

  // =======================================================
  // GET VALUE
  // =======================================================

  const getValue = useCallback(
    (key) => {
      const setting = getSetting(key);

      if (setting) {
        return normalizeValue(
          setting.setting_value
        );
      }

      return normalizeValue(
        DEFAULT_SETTINGS[key]
      );
    },
    [getSetting]
  );

  // =======================================================
  // UPDATE VALUE
  // =======================================================

  const updateValue = useCallback(
    (key, value) => {
      const cleanValue = normalizeValue(value);

      setSettings((prev) => {
        const exists = prev.some(
          (item) => item.setting_key === key
        );

        if (exists) {
          return prev.map((item) =>
            item.setting_key === key
              ? {
                  ...item,
                  setting_value: cleanValue,
                }
              : item
          );
        }

        return [
          ...prev,
          {
            setting_key: key,
            setting_value: cleanValue,
          },
        ];
      });

      setSuccess("");
      setError("");
    },
    []
  );

  // =======================================================
  // TOGGLE SETTING
  // =======================================================

  const toggleSetting = useCallback(
    (key) => {
      const currentValue = getValue(key);

      const nextValue =
        currentValue === "1" ? "0" : "1";

      updateValue(key, nextValue);
    },
    [getValue, updateValue]
  );

  // =======================================================
  // CHECK CHANGES
  // =======================================================

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(settings) !==
      JSON.stringify(originalSettings)
    );
  }, [settings, originalSettings]);

  // =======================================================
  // RESET CHANGES
  // =======================================================

  const resetChanges = useCallback(() => {
    setSettings(cloneSettings(originalSettings));
    setError("");
    setSuccess("");
  }, [originalSettings]);

  // =======================================================
  // SAVE SETTINGS
  // =======================================================

  const saveSettings = useCallback(async () => {
    if (!settings.length) {
      setError("No settings available to save.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = settings
        .filter(
          (item) =>
            item.setting_key &&
            String(item.setting_key).trim() !== ""
        )
        .map((item) => ({
          setting_key: String(
            item.setting_key
          ).trim(),

          setting_value: normalizeValue(
            item.setting_value
          ),
        }));

      const response = await axios.put(
        API_URL,
        {
          settings: payload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to save settings."
        );
      }

      const savedSettings = normalizeSettings(
        response.data?.settings || payload
      );

      /*
       * Backend response agar settings return nahi karta
       * to payload use hoga.
       */

      const settingMap = {};

      savedSettings.forEach((item) => {
        settingMap[item.setting_key] = item;
      });

      const completeSavedSettings = Object.keys(
        DEFAULT_SETTINGS
      ).map((key) => {
        if (settingMap[key]) {
          return settingMap[key];
        }

        return {
          setting_key: key,
          setting_value: DEFAULT_SETTINGS[key],
        };
      });

      const defaultKeys = new Set(
        Object.keys(DEFAULT_SETTINGS)
      );

      savedSettings.forEach((item) => {
        if (!defaultKeys.has(item.setting_key)) {
          completeSavedSettings.push(item);
        }
      });

      setSettings(completeSavedSettings);
      setOriginalSettings(
        cloneSettings(completeSavedSettings)
      );

      setLastSaved(new Date());

      setSuccess(
        response.data?.message ||
          "Settings saved successfully."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Save settings error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // =======================================================
  // CURRENT STATUS
  // =======================================================

  const maintenanceEnabled =
    getValue("maintenance_mode") === "1";

  const registrationEnabled =
    getValue("allow_registration") === "1";

  const jobPostingEnabled =
    getValue("allow_job_posting") === "1";

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-[1600px]">

          <div className="mb-6">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />

                <div className="mt-4 h-5 w-28 animate-pulse rounded bg-slate-200" />

                <div className="mt-2 h-4 w-36 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-slate-500">
              Loading settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">

        {/* TOP ACTION BAR */}

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">

              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg md:text-xl">
                Admin Settings
              </h1>

              {hasChanges && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Unsaved changes
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
              {lastSaved
                ? `Last saved at ${lastSaved.toLocaleTimeString()}`
                : "Manage website, registration and system configuration."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">

            {hasChanges && (
              <button
                type="button"
                onClick={resetChanges}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 sm:px-3.5 sm:text-sm"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchSettings}
              disabled={saving || loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 sm:px-3.5 sm:text-sm"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin text-blue-600"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving || !hasChanges}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-4 sm:text-sm"
            >
              {saving ? (
                <>
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Success
              </p>

              <p className="mt-0.5 text-sm">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-0.5 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* WEBSITE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Globe
                  size={21}
                  className="text-blue-600"
                />
              </div>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                Website
              </span>
            </div>

            <h3 className="mt-4 truncate font-semibold text-slate-800">
              {getValue("site_name") ||
                "Not configured"}
            </h3>

            <p className="mt-1 truncate text-sm text-slate-500">
              {getValue("site_email") ||
                "No email configured"}
            </p>
          </div>

          {/* REGISTRATION */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between">

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  registrationEnabled
                    ? "bg-emerald-50"
                    : "bg-red-50"
                }`}
              >
                <UserPlus
                  size={21}
                  className={
                    registrationEnabled
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                />
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  registrationEnabled
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {registrationEnabled
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              User Registration
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Candidate & recruiter signup
            </p>
          </div>

          {/* JOB POSTING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between">

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  jobPostingEnabled
                    ? "bg-violet-50"
                    : "bg-red-50"
                }`}
              >
                <BriefcaseBusiness
                  size={21}
                  className={
                    jobPostingEnabled
                      ? "text-violet-600"
                      : "text-red-600"
                  }
                />
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  jobPostingEnabled
                    ? "bg-violet-50 text-violet-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {jobPostingEnabled
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              Job Posting
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Recruiter job publishing
            </p>
          </div>

          {/* SYSTEM STATUS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between">

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  maintenanceEnabled
                    ? "bg-orange-50"
                    : "bg-emerald-50"
                }`}
              >
                <Wrench
                  size={21}
                  className={
                    maintenanceEnabled
                      ? "text-orange-600"
                      : "text-emerald-600"
                  }
                />
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  maintenanceEnabled
                    ? "bg-orange-50 text-orange-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {maintenanceEnabled
                  ? "Maintenance"
                  : "Online"}
              </span>
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              System Status
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {maintenanceEnabled
                ? "Website maintenance enabled"
                : "Website is operating normally"}
            </p>
          </div>
        </div>

        {/* GENERAL SETTINGS */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 bg-slate-50/60 px-5 py-5 md:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Globe
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  General Settings
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Configure your website information.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6">

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* SITE NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Site Name
                </label>

                <div className="relative">
                  <Globe
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={getValue("site_name")}
                    onChange={(e) =>
                      updateValue(
                        "site_name",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    placeholder="Enter website name"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  This name can be displayed across the website.
                </p>
              </div>

              {/* SITE EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Site Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={getValue("site_email")}
                    onChange={(e) =>
                      updateValue(
                        "site_email",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    placeholder="admin@example.com"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Primary email used for website communication.
                </p>
              </div>

              {/* SITE PHONE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Site Phone
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={getValue("site_phone")}
                    onChange={(e) =>
                      updateValue(
                        "site_phone",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Contact number shown to users.
                </p>
              </div>

              {/* INFO */}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    <Info
                      size={17}
                      className="text-blue-500"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">
                      Contact Information
                    </h4>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Keep your website contact information updated so
                      candidates and recruiters can reach your support team.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SYSTEM SETTINGS */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 bg-slate-50/60 px-5 py-5 md:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <Server
                  size={20}
                  className="text-violet-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  System Settings
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Control important website features.
                </p>
              </div>

            </div>
          </div>

          <div className="divide-y divide-slate-200">

            {/* MAINTENANCE */}

            <div className="p-5 md:p-6">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <Wrench
                      size={21}
                      className="text-orange-600"
                    />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-semibold text-slate-800">
                        Maintenance Mode
                      </h3>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          maintenanceEnabled
                            ? "bg-orange-100 text-orange-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {maintenanceEnabled
                          ? "ON"
                          : "OFF"}
                      </span>

                    </div>

                    <p className="mt-1 max-w-xl text-sm text-slate-500">
                      Temporarily disable normal website access while
                      maintenance or system updates are being performed.
                    </p>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleSetting("maintenance_mode")
                  }
                  aria-label="Toggle maintenance mode"
                  className={`relative h-7 w-14 shrink-0 rounded-full transition-all duration-200 ${
                    maintenanceEnabled
                      ? "bg-orange-500"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                      maintenanceEnabled
                        ? "left-8"
                        : "left-1"
                    }`}
                  />
                </button>

              </div>
            </div>

            {/* REGISTRATION */}

            <div className="p-5 md:p-6">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <UserPlus
                      size={21}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-semibold text-slate-800">
                        Allow Registration
                      </h3>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          registrationEnabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {registrationEnabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>

                    </div>

                    <p className="mt-1 max-w-xl text-sm text-slate-500">
                      Allow new candidates and recruiters to create
                      accounts on the platform.
                    </p>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleSetting("allow_registration")
                  }
                  aria-label="Toggle registration"
                  className={`relative h-7 w-14 shrink-0 rounded-full transition-all duration-200 ${
                    registrationEnabled
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                      registrationEnabled
                        ? "left-8"
                        : "left-1"
                    }`}
                  />
                </button>

              </div>
            </div>

            {/* JOB POSTING */}

            <div className="p-5 md:p-6">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                    <BriefcaseBusiness
                      size={21}
                      className="text-violet-600"
                    />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-semibold text-slate-800">
                        Allow Job Posting
                      </h3>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          jobPostingEnabled
                            ? "bg-violet-100 text-violet-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {jobPostingEnabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>

                    </div>

                    <p className="mt-1 max-w-xl text-sm text-slate-500">
                      Allow recruiters to create and publish job openings
                      on the platform.
                    </p>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleSetting("allow_job_posting")
                  }
                  aria-label="Toggle job posting"
                  className={`relative h-7 w-14 shrink-0 rounded-full transition-all duration-200 ${
                    jobPostingEnabled
                      ? "bg-violet-500"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                      jobPostingEnabled
                        ? "left-8"
                        : "left-1"
                    }`}
                  />
                </button>

              </div>
            </div>

          </div>

          {/* BOTTOM SAVE BAR */}

          <div className="flex flex-col justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center md:px-6">

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <ShieldCheck
                size={17}
                className="text-emerald-600"
              />

              <span>
                Settings are securely stored in the database.
              </span>

            </div>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving || !hasChanges}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>

          </div>
        </div>

        {/* SECURITY FOOTER */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <Lock
                size={18}
                className="text-slate-600"
              />
            </div>

            <div>

              <h3 className="font-semibold text-slate-800">
                Configuration Security
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Only authorized administrators should modify system
                settings. Changes can affect registration, job posting and
                website availability.
              </p>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;