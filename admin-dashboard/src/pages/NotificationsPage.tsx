import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import DataTable from "../components/common/DataTable";
import FormModal, { type FormField } from "../components/common/FormModal";
import { apiClient } from "../utils/apiClient";
import type { Notification } from "../types/api";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Notification | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiClient.getNotifications();
      // Filter out posts (notification_type = "POST") - only show actual notifications
      const actualNotifications = data.filter(
        (n) => n.notification_type !== "POST",
      );
      setNotifications(actualNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await apiClient.createNotification({
        title: data.title as string,
        message: data.message as string,
        notification_type: data.notification_type as any,
        course_class_id: data.course_class_id
          ? parseInt(data.course_class_id as string)
          : undefined,
      });
      await fetchNotifications();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi tạo");
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingId) return;
    try {
      await apiClient.updateNotification(editingId, {
        title: data.title as string,
        message: data.message as string,
      });
      setEditingId(null);
      setEditingData(null);
      await fetchNotifications();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      try {
        await apiClient.deleteNotification(id);
        await fetchNotifications();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi xóa");
      }
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingData(notification);
    setEditingId(notification.id);
    setIsModalOpen(true);
  };

  const formFields: FormField[] = [
    {
      name: "title",
      label: "Tiêu đề",
      type: "text",
      required: true,
      placeholder: "Nhập tiêu đề thông báo",
    },
    {
      name: "message",
      label: "Nội dung",
      type: "textarea",
      required: true,
      placeholder: "Nhập nội dung thông báo",
    },
    {
      name: "notification_type",
      label: "Loại thông báo",
      type: "select",
      required: true,
      options: [
        { value: "broadcast", label: "Gửi tất cả" },
        { value: "class", label: "Gửi theo lớp" },
        { value: "student_only", label: "Gửi riêng sinh viên" },
        { value: "system", label: "Thông báo hệ thống" },
      ],
    },
  ];

  const columns = [
    { key: "id" as const, label: "ID" },
    { key: "title" as const, label: "Tiêu đề" },
    {
      key: "notification_type" as const,
      label: "Loại",
      render: (value: unknown) => {
        const types: Record<string, string> = {
          broadcast: "Gửi tất cả",
          class: "Gửi theo lớp",
          student_only: "Gửi riêng",
          system: "Hệ thống",
        };
        return types[value as string] || value;
      },
    },
    {
      key: "created_at" as const,
      label: "Ngày tạo",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Thông Báo</h1>
          <Button
            onClick={() => {
              setEditingId(null);
              setEditingData(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={20} />
            Tạo thông báo
          </Button>
        </div>

        <Card>
          <DataTable<Notification>
            data={notifications}
            columns={columns}
            isLoading={isLoading}
            error={error}
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
        title={editingId ? "Cập nhật thông báo" : "Tạo thông báo mới"}
        fields={formFields}
        initialData={
          editingData
            ? {
                title: editingData.title,
                message: editingData.message || "",
                notification_type: editingData.notification_type,
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

export default NotificationsPage;
