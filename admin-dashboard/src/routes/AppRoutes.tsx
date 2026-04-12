import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import AttendanceConfigPage from "../pages/AttendanceConfigPage";
import NewsEditorPage from "../pages/NewsEditorPage";
import MasterDataPage from "../pages/MasterDataPage";
import DocumentTypesPage from "../pages/DocumentTypesPage";
import ServiceRequestsPage from "../pages/ServiceRequestsPage";
import NotificationsPage from "../pages/NotificationsPage";
import AttendanceWarningsPage from "../pages/AttendanceWarningsPage";
import GradesPage from "../pages/GradesPage";
import AttendancePage from "../pages/AttendancePage";
import EnhancedMasterDataPage from "../pages/EnhancedMasterDataPage";
import ProtectedRoute from "./ProtectedRoute";

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
          path="/attendance"
          element={<ProtectedRoute element={<AttendanceConfigPage />} />}
        />
        <Route
          path="/attendance-sessions"
          element={<ProtectedRoute element={<AttendancePage />} />}
        />
        <Route
          path="/news"
          element={<ProtectedRoute element={<NewsEditorPage />} />}
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
          path="/notifications"
          element={<ProtectedRoute element={<NotificationsPage />} />}
        />
        <Route
          path="/attendance-warnings"
          element={<ProtectedRoute element={<AttendanceWarningsPage />} />}
        />
        <Route
          path="/grades"
          element={<ProtectedRoute element={<GradesPage />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
