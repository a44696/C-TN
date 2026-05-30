import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import NewsList from "../components/news/NewsList";
import Button from "../components/common/Button";

export default function NewsListPage() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isAdmin =
    JSON.parse(localStorage.getItem("currentUser") || "{}")?.role === "ADMIN";
  const isLecturer =
    JSON.parse(localStorage.getItem("currentUser") || "{}")?.role ===
    "LECTURER";

  const handleCreateNews = () => {
    navigate("/news/create");
  };

  const handleNewsSuccess = () => {
    // Trigger news list refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AdminLayout topbarTitle="Tin Tức">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản Lý Tin Tức
            </h1>
          </div>
          {(isAdmin || isLecturer) && (
            <Button
              variant="primary"
              onClick={handleCreateNews}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              Tạo Tin Tức
            </Button>
          )}
        </div>

        {/* Posts List */}
        <NewsList refreshTrigger={refreshTrigger} />
      </div>
    </AdminLayout>
  );
}
