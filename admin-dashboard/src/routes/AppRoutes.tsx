import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import RecentActivitiesPage from "../pages/RecentActivitiesPage";
import NewsListPage from "../pages/NewsListPage";
import NewsCreatePage from "../pages/NewsCreatePage";
import MasterDataPage from "../pages/MasterDataPage";
import DocumentTypesPage from "../pages/DocumentTypesPage";
import ServiceRequestsPage from "../pages/ServiceRequestsPage";
import GradesPage from "../pages/GradesPage";
import EnhancedMasterDataPage from "../pages/EnhancedMasterDataPage";
import SettingsPage from "../pages/SettingsPage";
import ProtectedRoute from "./ProtectedRoute";

// Lazy load ChatPage to avoid blocking app load
const ChatPage = lazy(() => import("../pages/ChatPage"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={<ProtectedRoute element={<DashboardPage />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<DashboardPage />} />}
        />
        <Route
          path="/recent-activities"
          element={<ProtectedRoute element={<RecentActivitiesPage />} />}
        />
        <Route
          path="/news"
          element={<ProtectedRoute element={<NewsListPage />} />}
        />
        <Route
          path="/news/create"
          element={<ProtectedRoute element={<NewsCreatePage />} />}
        />
        <Route
          path="/master-data"
          element={<ProtectedRoute element={<MasterDataPage />} />}
        />
        <Route
          path="/master-data-enhanced"
          element={<ProtectedRoute element={<EnhancedMasterDataPage />} />}
        />
        <Route
          path="/document-types"
          element={<ProtectedRoute element={<DocumentTypesPage />} />}
        />
        <Route
          path="/service-requests"
          element={<ProtectedRoute element={<ServiceRequestsPage />} />}
        />
        <Route
          path="/grades"
          element={<ProtectedRoute element={<GradesPage />} />}
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute
              element={
                <Suspense fallback={<div>Đang tải...</div>}>
                  <ChatPage />
                </Suspense>
              }
            />
          }
        />
        <Route
          path="/settings"
          element={<ProtectedRoute element={<SettingsPage />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
