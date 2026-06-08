import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, AlertCircle, X } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import DataTable from "../components/common/DataTable";
import FormModal, { type FormField } from "../components/common/FormModal";
import { apiClient } from "../utils/apiClient";
import type { DocumentType } from "../types/api";

const DocumentTypesPage: React.FC = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<DocumentType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteErrorDetails, setDeleteErrorDetails] = useState("");
  const [incompleteRequests, setIncompleteRequests] = useState(0);
  const [showDeleteError, setShowDeleteError] = useState(false);

  const limit = 10;

  const fetchDocumentTypes = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.getDocumentTypes({ page, limit });
      setDocumentTypes(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, [page]);

  // Auto-hide delete error after 5 seconds
  useEffect(() => {
    if (showDeleteError) {
      const timer = setTimeout(() => {
        setShowDeleteError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteError]);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await apiClient.createDocumentType({
        document_name: data.document_name as string,
        processing_days: parseInt(data.processing_days as string),
      });
      setPage(1);
      await fetchDocumentTypes();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi tạo");
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingId) return;
    try {
      await apiClient.updateDocumentType(editingId, {
        document_name: data.document_name as string,
        processing_days: parseInt(data.processing_days as string),
      });
      setEditingId(null);
      setEditingData(null);
      await fetchDocumentTypes();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      try {
        await apiClient.deleteDocumentType(id);
        await fetchDocumentTypes();
      } catch (err: any) {
        // Extract error details from backend response
        const errorData = err.response?.data;

        if (errorData?.incompleteRequests !== undefined) {
          // This is a special error about incomplete service requests
          setDeleteError(errorData.message || "Lỗi khi xóa");
          setDeleteErrorDetails(errorData.details || "");
          setIncompleteRequests(errorData.incompleteRequests || 0);
        } else {
          // Generic error
          setDeleteError(err instanceof Error ? err.message : "Lỗi khi xóa");
          setDeleteErrorDetails("");
          setIncompleteRequests(0);
        }
        setShowDeleteError(true);
      }
    }
  };

  const handleEdit = (docType: DocumentType) => {
    setEditingData(docType);
    setEditingId(docType.id);
    setIsModalOpen(true);
  };

  const formFields: FormField[] = [
    {
      name: "document_name",
      label: "Tên loại tài liệu",
      type: "text",
      required: true,
      placeholder: "Nhập tên loại tài liệu",
    },
    {
      name: "processing_days",
      label: "Số ngày xử lý",
      type: "number",
      required: true,
      placeholder: "Nhập số ngày",
    },
  ];

  const filteredDocumentTypes = documentTypes.filter((doc) =>
    doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns = [
    { key: "id" as const, label: "ID" },
    { key: "document_name" as const, label: "Tên loại tài liệu" },
    {
      key: "processing_days" as const,
      label: "Số ngày xử lý",
      render: (value: unknown) => `${value} ngày`,
    },
  ];

  return (
    <AdminLayout topbarTitle="Tài Liệu Thủ Tục" showSearch={false}>
      <div className="space-y-6">
        {/* Delete Error Toast */}
        {showDeleteError && (
          <div className="fixed top-24 right-8 w-full max-w-md p-4 rounded-lg border-l-4 border-red-500 bg-red-50 shadow-lg animate-slideIn z-50">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-red-900 text-sm">
                  {deleteError}
                </p>
                {deleteErrorDetails && (
                  <>
                    <p className="text-xs text-red-700 mt-2 font-semibold">
                      Yêu cầu dịch vụ chưa hoàn thành ({incompleteRequests}):
                    </p>
                    <p className="text-xs text-red-700 mt-1 whitespace-pre-wrap font-mono bg-red-100 p-2 rounded">
                      {deleteErrorDetails}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowDeleteError(false)}
                className="text-red-400 hover:text-red-600 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center gap-4">
          <div className="w-80 flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setEditingData(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={20} />
            Thêm mới
          </Button>
        </div>

        <Card>
          <DataTable<DocumentType>
            data={filteredDocumentTypes}
            columns={columns}
            isLoading={isLoading}
            error={error}
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
            }}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </Card>
      </div>

      <FormModal
        isOpen={isModalOpen}
        title={editingId ? "Cập nhật loại tài liệu" : "Thêm loại tài liệu mới"}
        fields={formFields}
        initialData={
          editingData
            ? {
                document_name: editingData.document_name,
                processing_days: editingData.processing_days,
              }
            : {}
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setEditingData(null);
        }}
        onSubmit={editingId ? handleUpdate : handleCreate}
      />
    </AdminLayout>
  );
};

export default DocumentTypesPage;
