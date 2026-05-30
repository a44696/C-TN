import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import NewsForm from "../components/news/NewsForm";

export default function NewsCreatePage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to news list after successful creation
    navigate("/news");
  };

  const handleCancel = () => {
    navigate("/news");
  };

  return (
    <AdminLayout topbarTitle="Tạo Tin Tức">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Quay Lại
        </button>

        {/* News Form */}
        <NewsForm
          onSuccess={handleSuccess}
          onPostsUpdated={() => {
            handleSuccess();
            return Promise.resolve();
          }}
        />
      </div>
    </AdminLayout>
  );
}
