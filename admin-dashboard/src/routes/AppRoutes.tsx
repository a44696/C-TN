import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import NewsEditorPage from "../pages/NewsEditorPage";
import MasterDataPage from "../pages/MasterDataPage";
import DocumentTypesPage from "../pages/DocumentTypesPage";
import ServiceRequestsPage from "../pages/ServiceRequestsPage";
import GradesPage from "../pages/GradesPage";
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
          path="/grades"
          element={<ProtectedRoute element={<GradesPage />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
