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
import UsersManagementPage from "../pages/UsersManagementPage";
import ImportDataPage from "../pages/ImportDataPage";
import AttendanceStatisticsPage from "../pages/AttendanceStatisticsPage";
import KnowledgeBasePage from "../pages/KnowledgeBasePage";
import AttendanceWarningSettingsPage from "../pages/AttendanceWarningSettingsPage";
import FaceIDManagementPage from "../pages/FaceIDManagementPage";
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
        <Route
          path="/users"
          element={<ProtectedRoute element={<UsersManagementPage />} />}
        />
        <Route
          path="/import"
          element={<ProtectedRoute element={<ImportDataPage />} />}
        />
        <Route
          path="/attendance-statistics"
          element={<ProtectedRoute element={<AttendanceStatisticsPage />} />}
        />
        <Route
          path="/knowledge-base"
          element={<ProtectedRoute element={<KnowledgeBasePage />} />}
        />
        <Route
          path="/attendance-warnings"
          element={
            <ProtectedRoute element={<AttendanceWarningSettingsPage />} />
          }
        />
        <Route
          path="/faceid-management"
          element={<ProtectedRoute element={<FaceIDManagementPage />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
