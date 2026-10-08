import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
} from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // ==========================================
  // ADMIN LOGIN
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Validation
    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // ==========================================
      // LOGIN API
      // ==========================================
      const response = await axios.post(
        "http://localhost/job_portal/job-portal-api/api/auth/login.php",
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login Response:", response.data);

      // ==========================================
      // LOGIN FAILED
      // ==========================================
      if (!response.data.success) {
        setError(
          response.data.message || "Invalid email or password."
        );
        return;
      }

      // ==========================================
      // GET USER
      // ==========================================
      const user = response.data.user;

      console.log("Logged in User:", user);

      // ==========================================
      // ADMIN ROLE CHECK
      // ==========================================
      const role = String(user?.role || "").toLowerCase().trim();

      if (!user || role !== "admin") {
        setError("Access denied. Admin account required.");
        return;
      }

      // ==========================================
      // SAVE ADMIN LOGIN
      // ==========================================
      localStorage.setItem("admin", JSON.stringify(user));
      localStorage.setItem("adminLoggedIn", "true");

      // Common user data
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");

      // ==========================================
      // SUCCESS
      // ==========================================
      navigate("/admin/dashboard");

    } catch (error) {
      console.error("Admin Login Error:", error);

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Server error. Please try again."
        );
      } else if (error.request) {
        setError(
          "Backend server se response nahi aa raha. Please check XAMPP Apache."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg mb-4">
            <ShieldCheck size={34} />
          </div>

          <h1 className="text-3xl font-bold text-blue-600">
            Admin Panel
          </h1>

          <p className="text-slate-500 mt-2">
            Sign in to manage Job Portal
          </p>

        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-7">

          <form onSubmit={handleSubmit}>

            {/* ERROR */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">

                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-sm">
                  {error}
                </p>

              </div>
            )}

            {/* EMAIL */}
            <div className="mb-5">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter admin email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="mb-6">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition"
            >

              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={19} />
                  Admin Login
                </>
              )}

            </button>

          </form>

        </div>

        {/* FOOTER */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Job Portal Admin Panel
        </p>

      </div>

    </div>
  );
};

export default AdminLogin;