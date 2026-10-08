import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const adminLoggedIn =
    localStorage.getItem("adminLoggedIn") === "true";

  let admin = {};

  try {
    admin = JSON.parse(localStorage.getItem("admin") || "{}");
  } catch {
    localStorage.removeItem("admin");
  }

  // Admin login nahi hai
  if (!adminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin role check
  if (String(admin.role || "").toLowerCase().trim() !== "admin") {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminLoggedIn");

    return <Navigate to="/admin/login" replace />;
  }

  // Login hai → Admin pages allow
  return <Outlet />;
};

export default AdminProtectedRoute;