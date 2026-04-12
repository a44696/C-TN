import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi xóa");
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
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Loại Tài Liệu</h1>
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
            data={documentTypes}
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
