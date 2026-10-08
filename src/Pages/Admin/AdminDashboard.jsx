import React from "react";
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
  Search,
  MoreVertical,
  ArrowUpRight,
  CheckCircle,
  Clock,
  TrendingUp,
  UserPlus,
  Briefcase,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================
  // ADMIN DATA FROM LOCAL STORAGE
  // =========================================

  const admin = JSON.parse(
    localStorage.getItem("admin") || "{}"
  );

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    navigate("/admin/login");
  };

  // =========================================
  // SIDEBAR ITEMS
  // =========================================

  const sidebarItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      name: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      name: "Candidates",
      icon: UserRound,
      path: "/admin/candidates",
    },
    {
      name: "Recruiters",
      icon: UserCheck,
      path: "/admin/recruiters",
    },
    {
      name: "Jobs",
      icon: BriefcaseBusiness,
      path: "/admin/jobs",
    },
    {
      name: "Applications",
      icon: FileText,
      path: "/admin/applications",
    },
    {
      name: "Companies",
      icon: Building2,
      path: "/admin/companies",
    },
    {
      name: "Categories",
      icon: Layers3,
      path: "/admin/categories",
    },
    {
      name: "Reports & Analytics",
      icon: BarChart3,
      path: "/admin/reports",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  // =========================================
  // DASHBOARD STATS
  // =========================================

  const stats = [
    {
      title: "Total Users",
      value: "1,248",
      change: "+12.5%",
      icon: Users,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Candidates",
      value: "936",
      change: "+8.2%",
      icon: UserRound,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      title: "Recruiters",
      value: "312",
      change: "+5.4%",
      icon: UserCheck,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      title: "Total Jobs",
      value: "684",
      change: "+14.8%",
      icon: BriefcaseBusiness,
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      title: "Applications",
      value: "3,842",
      change: "+18.6%",
      icon: FileText,
      bg: "bg-pink-50",
      text: "text-pink-600",
    },
    {
      title: "Hired",
      value: "286",
      change: "+11.3%",
      icon: CheckCircle,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
  ];

  // =========================================
  // RECENT USERS
  // =========================================

  const recentUsers = [
    {
      name: "Teena",
      email: "teena@gmail.com",
      role: "Candidate",
      date: "15 Sep 2026",
      status: "Active",
    },
    {
      name: "Recruiter1",
      email: "recruiter1@gmail.com",
      role: "Recruiter",
      date: "15 Sep 2026",
      status: "Active",
    },
    {
      name: "Khushi",
      email: "khushi@gmail.com",
      role: "Candidate",
      date: "14 Sep 2026",
      status: "Active",
    },
    {
      name: "Manu",
      email: "manu@gmail.com",
      role: "Candidate",
      date: "13 Sep 2026",
      status: "Active",
    },
  ];

  // =========================================
  // RECENT JOBS
  // =========================================

  const recentJobs = [
    {
      title: "Data Science",
      company: "SSd Informatics",
      location: "Lucknow, Noida",
      applicants: 24,
      status: "Active",
    },
    {
      title: "MERN Stack Developer",
      company: "ABC Technologies",
      location: "Noida",
      applicants: 38,
      status: "Active",
    },
    {
      title: "Frontend Developer",
      company: "Tech Solutions",
      location: "Lucknow",
      applicants: 19,
      status: "Active",
    },
    {
      title: "React Developer",
      company: "Digital Works",
      location: "Remote",
      applicants: 31,
      status: "Closed",
    },
  ];

  // =========================================
  // RECENT ACTIVITIES
  // =========================================

  const activities = [
    {
      icon: UserPlus,
      title: "New candidate registered",
      text: "Teena created a candidate account",
      time: "10 min ago",
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      icon: Briefcase,
      title: "New job posted",
      text: "MERN Stack Developer at ABC Technologies",
      time: "32 min ago",
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
    {
      icon: FileText,
      title: "New application",
      text: "Teena applied for Data Science",
      time: "1 hour ago",
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      icon: CheckCircle,
      title: "Candidate shortlisted",
      text: "Teena was shortlisted for Data Science",
      time: "2 hours ago",
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
  ];

  // =========================================
  // ACTIVE SIDEBAR ITEM
  // =========================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col fixed left-0 top-0 bottom-0 z-40">

        {/* =====================================
            LOGO
        ====================================== */}

        <div className="h-20 px-6 flex items-center border-b border-gray-100">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h1 className="font-bold text-gray-900 text-lg">
                JobPortal
              </h1>

              <p className="text-xs text-gray-500">
                Admin Panel
              </p>
            </div>

          </div>

        </div>

        {/* =====================================
            MENU
        ====================================== */}

        <div className="flex-1 p-4 overflow-y-auto">

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Management
          </p>

          <nav className="space-y-1">

            {sidebarItems.map((item) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >

                  <Icon size={19} />

                  <span>
                    {item.name}
                  </span>

                </button>
              );

            })}

          </nav>

        </div>

        {/* =====================================
            ADMIN PROFILE
        ====================================== */}

        <div className="p-4 border-t border-gray-100">

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">

            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {admin.name
                ? admin.name.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div className="flex-1 min-w-0">

              <p className="font-semibold text-gray-800 text-sm">
                {admin.name || "Admin"}
              </p>

              <p className="text-xs text-gray-500 truncate">
                {admin.email || "admin@jobportal.com"}
              </p>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="text-gray-400 hover:text-red-500 transition"
            >
              <LogOut size={18} />
            </button>

          </div>

        </div>

      </aside>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="flex-1 lg:ml-64">

        {/* =====================================
            TOP HEADER
        ====================================== */}

        <header className="h-20 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">

          {/* TITLE */}

          <div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h2>

            <p className="text-sm text-gray-500 hidden sm:block">
              Manage and monitor your job portal
            </p>

          </div>

          {/* HEADER RIGHT */}

          <div className="flex items-center gap-3">

            {/* SEARCH */}

            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">

              <Search
                size={18}
                className="text-gray-400"
              />

              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-40"
              />

            </div>

            {/* NOTIFICATION */}

            <button
              type="button"
              onClick={() =>
                navigate("/admin/notifications")
              }
              className="relative w-11 h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
            >

              <Bell size={20} />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>

            </button>

            {/* ADMIN AVATAR */}

            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

              {admin.name
                ? admin.name.charAt(0).toUpperCase()
                : "A"}

            </div>

          </div>

        </header>

        {/* =====================================
            PAGE CONTENT
        ====================================== */}

        <div className="p-4 sm:p-6 lg:p-8">

          {/* ===================================
              WELCOME
          ==================================== */}

          <div className="mb-7">

            <h3 className="text-2xl font-bold text-gray-900">
              Welcome back, {admin.name || "Admin"} 👋
            </h3>

            <p className="text-gray-500 mt-1">
              Here's what's happening on your job portal today.
            </p>

          </div>

          {/* ===================================
              STATS
          ==================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">

            {stats.map((stat) => {

              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition"
                >

                  <div className="flex items-start justify-between">

                    <div
                      className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center`}
                    >
                      <Icon size={23} />
                    </div>

                    <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <TrendingUp size={15} />
                      {stat.change}
                    </div>

                  </div>

                  <p className="text-gray-500 text-sm mt-5">
                    {stat.title}
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </h3>

                </div>
              );

            })}

          </div>

          {/* ===================================
              PORTAL OVERVIEW
          ==================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

            {/* CHART */}

            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="font-bold text-gray-900 text-lg">
                    Portal Overview
                  </h3>

                  <p className="text-sm text-gray-500">
                    Applications and job activity
                  </p>

                </div>

                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">

                  <option>
                    Last 7 days
                  </option>

                  <option>
                    Last 30 days
                  </option>

                  <option>
                    Last 6 months
                  </option>

                </select>

              </div>

              {/* BAR CHART */}

              <div className="h-64 flex items-end gap-4 sm:gap-8 border-b border-gray-100 px-2">

                {[45, 65, 52, 78, 60, 88, 72].map(
                  (height, index) => (

                    <div
                      key={index}
                      className="flex-1 h-full flex items-end justify-center"
                    >

                      <div
                        className="w-full max-w-10 bg-blue-500 rounded-t-lg hover:bg-blue-600 transition"
                        style={{
                          height: `${height}%`,
                        }}
                      ></div>

                    </div>

                  )
                )}

              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-3 px-1">

                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>

              </div>

            </div>

            {/* USER DISTRIBUTION */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">

              <h3 className="font-bold text-gray-900 text-lg">
                User Distribution
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Current platform users
              </p>

              <div className="flex justify-center py-8">

                <div className="w-40 h-40 rounded-full border-[18px] border-blue-500 flex items-center justify-center">

                  <div className="text-center">

                    <p className="text-2xl font-bold text-gray-900">
                      1,248
                    </p>

                    <p className="text-xs text-gray-500">
                      Users
                    </p>

                  </div>

                </div>

              </div>

              <div className="space-y-3">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>

                    <span className="text-sm text-gray-600">
                      Candidates
                    </span>

                  </div>

                  <span className="font-semibold text-gray-800">
                    936
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>

                    <span className="text-sm text-gray-600">
                      Recruiters
                    </span>

                  </div>

                  <span className="font-semibold text-gray-800">
                    312
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* ===================================
              RECENT USERS + JOBS
          ==================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

            {/* RECENT USERS */}

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

              <div className="p-5 border-b border-gray-100 flex items-center justify-between">

                <div>

                  <h3 className="font-bold text-gray-900">
                    Recent Users
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Latest registered users
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/users")}
                  className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline"
                >
                  View All
                  <ArrowUpRight size={15} />
                </button>

              </div>

              <div className="divide-y divide-gray-100">

                {recentUsers.map((user) => (

                  <div
                    key={user.email}
                    className="p-4 flex items-center gap-3 hover:bg-gray-50 transition"
                  >

                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
                      {user.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="font-semibold text-gray-800">
                        {user.name}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>

                    </div>

                    <div className="text-right">

                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.role === "Recruiter"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>

                      <p className="text-xs text-gray-400 mt-1">
                        {user.date}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* RECENT JOBS */}

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

              <div className="p-5 border-b border-gray-100 flex items-center justify-between">

                <div>

                  <h3 className="font-bold text-gray-900">
                    Recent Jobs
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Latest jobs posted
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/jobs")}
                  className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline"
                >
                  View All
                  <ArrowUpRight size={15} />
                </button>

              </div>

              <div className="divide-y divide-gray-100">

                {recentJobs.map((job) => (

                  <div
                    key={`${job.title}-${job.company}`}
                    className="p-4 hover:bg-gray-50 transition"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex gap-3">

                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <BriefcaseBusiness size={19} />
                        </div>

                        <div>

                          <p className="font-semibold text-gray-800">
                            {job.title}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {job.company}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {job.location}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          job.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {job.status}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-3 ml-13">

                      <Users size={14} />

                      {job.applicants} applicants

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* ===================================
              RECENT ACTIVITY
          ==================================== */}

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

            <div className="p-5 border-b border-gray-100">

              <h3 className="font-bold text-gray-900">
                Recent Activity
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Latest activity across the platform
              </p>

            </div>

            <div className="divide-y divide-gray-100">

              {activities.map((activity, index) => {

                const Icon = activity.icon;

                return (
                  <div
                    key={index}
                    className="p-5 flex items-center gap-4 hover:bg-gray-50 transition"
                  >

                    <div
                      className={`w-11 h-11 rounded-xl ${activity.bg} ${activity.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="flex-1">

                      <p className="font-semibold text-gray-800">
                        {activity.title}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {activity.text}
                      </p>

                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400">

                      <Clock size={14} />

                      {activity.time}

                    </div>

                  </div>
                );

              })}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;