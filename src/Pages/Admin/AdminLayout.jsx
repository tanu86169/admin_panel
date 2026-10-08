import React, { useEffect, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserRound,
  BriefcaseBusiness,
  FileText,
  Building2,
  Layers3,
  BarChart3,
  Bell,
  Settings,
  BookOpen,
  Search,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Menu,
  X,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =====================================================
  // GET LOGGED-IN ADMIN
  // =====================================================

  const getAdmin = () => {
    try {
      const storedAdmin = localStorage.getItem("admin");

      if (!storedAdmin) {
        return {};
      }

      return JSON.parse(storedAdmin);
    } catch (error) {
      console.error("Admin localStorage error:", error);
      return {};
    }
  };

  const admin = getAdmin();

  // =====================================================
  // SCROLL TO TOP WHEN ROUTE CHANGES
  // =====================================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const mainContainer = document.getElementById(
      "admin-main-scroll"
    );

    if (mainContainer) {
      mainContainer.scrollTop = 0;
      mainContainer.scrollLeft = 0;
    }

    // Mobile menu automatically close
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // =====================================================
  // SIDEBAR MENU ITEMS
  // =====================================================

  const sidebarItems = [
    {
      name: "Dashboard",
      title: "Admin Dashboard",
      subtitle: "Overview of your job portal",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },

    {
      name: "Users",
      title: "User Management",
      subtitle: "Manage all registered users",
      icon: Users,
      path: "/admin/users",
    },

    {
      name: "Candidates",
      title: "Candidate Management",
      subtitle: "Manage all candidates",
      icon: UserRound,
      path: "/admin/candidates",
    },

    {
      name: "Recruiters",
      title: "Recruiter Management",
      subtitle: "Manage all recruiters",
      icon: UserCheck,
      path: "/admin/recruiters",
    },

    {
      name: "Jobs",
      title: "Job Management",
      subtitle: "Manage all job postings",
      icon: BriefcaseBusiness,
      path: "/admin/jobs",
    },

    {
      name: "Applications",
      title: "Application Management",
      subtitle: "Manage all job applications",
      icon: FileText,
      path: "/admin/applications",
    },

    {
      name: "Companies",
      title: "Company Management",
      subtitle: "Manage all companies",
      icon: Building2,
      path: "/admin/companies",
    },

    {
      name: "Categories",
      title: "Category Management",
      subtitle: "Manage job categories",
      icon: Layers3,
      path: "/admin/categories",
    },

    {
      name: "Career Advice",
      title: "Career Advice Management",
      subtitle: "Manage career advice articles",
      icon: BookOpen,
      path: "/admin/career-advice",
    },

    // ===================================================
    // FAQ
    // ===================================================

    {
      name: "FAQs",
      title: "FAQ Management",
      subtitle: "Manage questions and answers",
      icon: HelpCircle,
      path: "/admin/faqs",
    },

    {
      name: "Reports & Analytics",
      title: "Reports & Analytics",
      subtitle: "View insights and statistics",
      icon: BarChart3,
      path: "/admin/reports",
    },

    {
      name: "Notifications",
      title: "Notification Management",
      subtitle: "Manage all notifications",
      icon: Bell,
      path: "/admin/notifications",
    },

    {
      name: "Messages",
      title: "Message Management",
      subtitle: "Manage all messages",
      icon: MessageCircle,
      path: "/admin/messages",
    },

    {
      name: "Settings",
      title: "Settings",
      subtitle: "Manage your preferences",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  // =====================================================
  // CHECK ACTIVE MENU
  // =====================================================

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return (
        location.pathname === "/admin" ||
        location.pathname === "/admin/" ||
        location.pathname === "/admin/dashboard"
      );
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  // =====================================================
  // CURRENT MENU
  // =====================================================

  const currentMenu =
    sidebarItems.find((item) => isActive(item.path)) ||
    sidebarItems[0];

  const headerTitle =
    currentMenu?.title || "Admin Panel";

  const headerSubtitle =
    currentMenu?.subtitle ||
    "Manage and monitor your job portal";

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const shouldLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!shouldLogout) {
      return;
    }

    // Admin session
    localStorage.removeItem("admin");
    localStorage.removeItem("adminLoggedIn");

    // Remove user session if present
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginUpdated");

    // Close mobile menu
    setMobileMenuOpen(false);

    // Redirect
    navigate("/admin/login", {
      replace: true,
    });
  };

  // =====================================================
  // SIDEBAR CONTENT
  // =====================================================

  const SidebarContent = () => {
    return (
      <div className="flex h-full min-h-0 w-full flex-col bg-white">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-5 sm:px-6">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
              <ShieldCheck size={24} />
            </div>

            <div className="min-w-0">

              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                JobPortal
              </h1>

              <p className="truncate text-xs font-medium text-slate-400">
                Admin Workspace
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            MENU
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Management
          </p>

          <nav className="space-y-1">

            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`group flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >

                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-blue-600"
                    }`}
                  />

                  <span className="min-w-0 flex-1 truncate text-left">
                    {item.name}
                  </span>

                  {active && (
                    <ChevronRight
                      size={15}
                      className="shrink-0"
                    />
                  )}

                </button>
              );
            })}

          </nav>

        </div>

        {/* =================================================
            ADMIN PROFILE
        ================================================= */}

        <div className="shrink-0 border-t border-slate-100 p-3 sm:p-4">

          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3">

            {/* AVATAR */}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-sm font-bold text-blue-600">
              {admin?.name
                ? admin.name.charAt(0).toUpperCase()
                : "A"}
            </div>

            {/* ADMIN INFO */}

            <div className="min-w-0 flex-1">

              <p className="truncate text-xs font-bold text-slate-900">
                {admin?.name || "Admin"}
              </p>

              <p className="truncate text-[11px] text-slate-500">
                {admin?.email || "admin@jobportal.com"}
              </p>

            </div>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>

      </div>
    );
  };

  // =====================================================
  // MAIN LAYOUT
  // =====================================================

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside className="hidden h-screen w-64 min-w-[16rem] shrink-0 border-r border-slate-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {/* =================================================
          MOBILE SIDEBAR OVERLAY
      ================================================= */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >

          <div
            className="h-full w-[280px] max-w-[85vw] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <SidebarContent />
          </div>

        </div>
      )}

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div
        id="admin-main-scroll"
        className="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-slate-50"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">

          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((prev) => !prev)
              }
              aria-label={
                mobileMenuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

            {/* TITLE */}

            <div className="min-w-0">

              <h2 className="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                {headerTitle}
              </h2>

              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {headerSubtitle}
              </p>

            </div>

          </div>

          {/* =================================================
              HEADER RIGHT
          ================================================= */}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            {/* SEARCH */}

            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-blue-500 focus-within:bg-white md:flex">

              <Search
                size={16}
                className="shrink-0 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search..."
                className="w-32 bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none sm:w-48"
              />

            </div>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              onClick={() =>
                navigate("/admin/notifications")
              }
              title="Notifications"
              aria-label="Notifications"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              <Bell size={18} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* ADMIN AVATAR */}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/20">
              {admin?.name
                ? admin.name.charAt(0).toUpperCase()
                : "A"}
            </div>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">

          <Outlet />

        </main>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">

            <p className="text-center text-xs font-medium text-slate-400 sm:text-left">
              © {new Date().getFullYear()} JobPortal.
              All rights reserved.
            </p>

            <p className="text-xs font-semibold text-slate-500">
              Admin Management System
            </p>

          </div>

        </footer>

      </div>

    </div>
  );
};

export default AdminLayout;