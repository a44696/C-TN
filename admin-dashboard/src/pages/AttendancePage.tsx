import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import DataTable from "../components/common/DataTable";
import FormModal, { type FormField } from "../components/common/FormModal";
import { apiClient } from "../utils/apiClient";
import type { AttendanceSession } from "../types/api";

const AttendancePage: React.FC = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const limit = 10;

  const fetchSessions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.getAttendanceSessions({ page, limit });
      setSessions(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page]);

  const handleCreateSession = async (data: Record<string, unknown>) => {
    try {
      await apiClient.createAttendanceSession({
        course_class_id: parseInt(data.course_class_id as string),
        check_in_time: data.check_in_time as string,
        date: data.date as string,
      });
      setIsModalOpen(false);
      await fetchSessions();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi tạo");
    }
  };

  const handleDeleteSession = async (id: string | number) => {
    if (window.confirm("Bạn chắc chắn muốn xóa buổi điểm danh này?")) {
      try {
        await apiClient.deleteAttendanceRecord(id as number);
        await fetchSessions();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi xóa");
      }
    }
  };

  const formFields: FormField[] = [
    {
      name: "course_class_id",
      label: "Mã lớp học phần",
      type: "number",
      required: true,
      placeholder: "Nhập ID lớp học phần",
    },
    {
      name: "date",
      label: "Ngày",
      type: "text",
      required: true,
      placeholder: "2026-04-12",
    },
    {
      name: "check_in_time",
      label: "Thời gian kiểm điểm",
      type: "text",
      required: true,
      placeholder: "08:00",
    },
  ];

  const columns = [
    { key: "id" as const, label: "ID" },
    {
      key: "course_class" as const,
      label: "Môn học",
      render: (value: unknown) => {
        const courseClass = value as AttendanceSession["course_class"];
        return courseClass ? courseClass.subject?.subject_name : "-";
      },
    },
    {
      key: "course_class" as const,
      label: "Giảng viên",
      render: (value: unknown) => {
        const courseClass = value as AttendanceSession["course_class"];
        return courseClass ? courseClass.lecturer?.full_name : "-";
      },
    },
    {
      key: "course_class" as const,
      label: "Phòng học",
      render: (value: unknown) => {
        const courseClass = value as AttendanceSession["course_class"];
        return courseClass ? courseClass.room : "-";
      },
    },
    {
      key: "course_class" as const,
      label: "Thời gian học",
      render: (value: unknown) => {
        const courseClass = value as AttendanceSession["course_class"];
        return courseClass ? courseClass.lesson_slot : "-";
      },
    },
    {
      key: "date" as const,
      label: "Ngày kiểm điểm",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString("vi-VN"),
    },
    {
      key: "check_in_time" as const,
      label: "Thời gian kiểm điểm",
      render: (value: unknown) => {
        const time = value as string;
        if (!time) return "-";
        try {
          return new Date(time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return time;
        }
      },
    },
    {
      key: "_count" as const,
      label: "Đã điểm danh",
      render: (value: unknown) => {
        const count = value as AttendanceSession["_count"];
        return count?.records ?? 0;
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản Lý Điểm Danh
          </h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Tạo buổi điểm danh
          </Button>
        </div>

        <Card>
          <DataTable<AttendanceSession>
            data={sessions}
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
              <button
                onClick={() => handleDeleteSession(row.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            )}
            emptyMessage="Chưa có buổi điểm danh"
          />
        </Card>
      </div>

      <FormModal
        isOpen={isModalOpen}
        title="Tạo buổi điểm danh mới"
        fields={formFields}
        initialData={{}}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSession}
      />
    </AdminLayout>
  );
};

export default AttendancePage;
