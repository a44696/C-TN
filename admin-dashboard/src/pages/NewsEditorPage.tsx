import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import NewsForm from "../components/news/NewsForm";
import NewsList from "../components/news/NewsList";

export default function NewsEditorPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isAdmin =
    JSON.parse(localStorage.getItem("user") || "{}")?.role === "ADMIN";
  const isLecturer =
    JSON.parse(localStorage.getItem("user") || "{}")?.role === "LECTURER";

  const handleNewsSuccess = () => {
    // Trigger news list refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AdminLayout topbarTitle="Quản Lý Bài Viết" showSearch={false}>
      <div className="space-y-6">
        {/* Posts Form - For ADMIN and LECTURER */}
        {(isAdmin || isLecturer) && (
          <NewsForm
            onSuccess={handleNewsSuccess}
            onPostsUpdated={() => {
              // Refetch posts after files are uploaded
              handleNewsSuccess();
              return Promise.resolve();
            }}
          />
        )}

        {/* Posts List - For all users */}
        <NewsList refreshTrigger={refreshTrigger} />
      </div>
    </AdminLayout>
  );
}
