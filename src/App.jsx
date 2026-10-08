import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// ADMIN LOGIN
// =====================================================
import AdminLogin from "./Pages/Admin/AdminLogin";

// =====================================================
// ADMIN LAYOUT
// =====================================================
import AdminLayout from "./Pages/Admin/AdminLayout";

// =====================================================
// ADMIN PROTECTED ROUTE
// =====================================================
import AdminProtectedRoute from "./Pages/Admin/AdminProtectedRoute";

// =====================================================
// ADMIN PAGES
// =====================================================
import AdminDashboard from "./Pages/AdminDashboard";
import AdminUsers from "./Pages/Admin/AdminUsers";
import AdminCandidates from "./Pages/Admin/AdminCandidates";
import AdminCategories from "./Pages/Admin/AdminCategories";
import AdminRecruiters from "./Pages/Admin/AdminRecruiters";
import AdminJobs from "./Pages/Admin/AdminJobs";
import AdminApplications from "./Pages/Admin/AdminApplications";
import AdminCompanies from "./Pages/Admin/AdminCompanies";
import AdminReports from "./Pages/Admin/AdminReports";
import AdminNotifications from "./Pages/Admin/AdminNotifications";
import AdminSettings from "./Pages/Admin/AdminSettings";
import AdminArticles from "./Pages/Admin/AdminArticles";
import AdminMessages from "./Pages/Admin/AdminMessages";
import AdminFAQs from "./Pages/Admin/AdminFAQs";

const App = () => {
  return (
    <Router>
      <Routes>

        {/* =====================================================
            ADMIN LOGIN
        ===================================================== */}

        <Route
          path="/admin"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* =====================================================
            PROTECTED ADMIN ROUTES
        ===================================================== */}

        <Route element={<AdminProtectedRoute />}>

          {/* =================================================
              ADMIN LAYOUT
          ================================================= */}

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* =================================================
                DASHBOARD
            ================================================= */}

            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />


            {/* =================================================
                USERS
            ================================================= */}

            <Route
              path="users"
              element={<AdminUsers />}
            />


            {/* =================================================
                CANDIDATES
            ================================================= */}

            <Route
              path="candidates"
              element={<AdminCandidates />}
            />


            {/* =================================================
                RECRUITERS
            ================================================= */}

            <Route
              path="recruiters"
              element={<AdminRecruiters />}
            />


            {/* =================================================
                JOBS
            ================================================= */}

            <Route
              path="jobs"
              element={<AdminJobs />}
            />


            {/* =================================================
                APPLICATIONS
            ================================================= */}

            <Route
              path="applications"
              element={<AdminApplications />}
            />


            {/* =================================================
                COMPANIES
            ================================================= */}

            <Route
              path="companies"
              element={<AdminCompanies />}
            />


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <Route
              path="categories"
              element={<AdminCategories />}
            />


            {/* =================================================
                CAREER ADVICE / ARTICLES
            ================================================= */}

            <Route
              path="career-advice"
              element={<AdminArticles />}
            />


            {/* =================================================
                FAQ MANAGEMENT
            ================================================= */}

            <Route
              path="faqs"
              element={<AdminFAQs />}
            />


            {/* =================================================
                MESSAGES
            ================================================= */}

            <Route
              path="messages"
              element={<AdminMessages />}
            />


            {/* =================================================
                REPORTS
            ================================================= */}

            <Route
              path="reports"
              element={<AdminReports />}
            />


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <Route
              path="notifications"
              element={<AdminNotifications />}
            />


            {/* =================================================
                SETTINGS
            ================================================= */}

            <Route
              path="settings"
              element={<AdminSettings />}
            />


            {/* =================================================
                DEFAULT ADMIN PAGE
                /admin -> /admin/dashboard
            ================================================= */}

            <Route
              index
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

          </Route>

        </Route>


        {/* =====================================================
            UNKNOWN ROUTE
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/admin"
              replace
            />
          }
        />

      </Routes>
    </Router>
  );
};

export default App;