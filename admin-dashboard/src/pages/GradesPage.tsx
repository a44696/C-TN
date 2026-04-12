import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import DataTable from "../components/common/DataTable";
import FormModal, { type FormField } from "../components/common/FormModal";
import { apiClient } from "../utils/apiClient";
import type { Grade } from "../types/api";

const GradesPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const limit = 10;

  const fetchGrades = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.getAllGrades({ page, limit });
      setGrades(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [page]);

  const handleCreateGrade = async (data: Record<string, unknown>) => {
    try {
      await apiClient.createGrade({
        enrollment_id: data.enrollment_id as string,
        score_attendance: parseFloat(data.score_attendance as string),
        score_process: parseFloat(data.score_process as string),
        score_final: parseFloat(data.score_final as string),
      });
      setIsModalOpen(false);
      await fetchGrades();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi tạo");
    }
  };

  const formFields: FormField[] = [
    {
      name: "enrollment_id",
      label: "Mã đăng ký học phần",
      type: "text",
      required: true,
      placeholder: "Nhập mã đăng ký",
    },
    {
      name: "score_attendance",
      label: "Điểm danh sách (0-10)",
      type: "number",
      required: true,
      placeholder: "8.5",
    },
    {
      name: "score_process",
      label: "Điểm quá trình (0-10)",
      type: "number",
      required: true,
      placeholder: "7.0",
    },
    {
      name: "score_final",
      label: "Điểm thi cuối kỳ (0-10)",
      type: "number",
      required: true,
      placeholder: "6.5",
    },
  ];

  const columns = [
    { key: "id" as const, label: "ID" },
    { key: "enrollment_id" as const, label: "Mã đăng ký" },
    {
      key: "score_attendance" as const,
      label: "Điểm danh sách",
      render: (value: unknown) =>
        value ? (value as number).toFixed(2) : "0.00",
    },
    {
      key: "score_process" as const,
      label: "Điểm quá trình",
      render: (value: unknown) =>
        value ? (value as number).toFixed(2) : "0.00",
    },
    {
      key: "score_final" as const,
      label: "Điểm thi",
      render: (value: unknown) =>
        value ? (value as number).toFixed(2) : "0.00",
    },
    {
      key: "score_total_10" as const,
      label: "Điểm tổng",
      render: (value: unknown) =>
        value ? (value as number).toFixed(2) : "0.00",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Điểm Số</h1>
          <Button onClick={() => setIsModalOpen(true)}>Nhập điểm mới</Button>
        </div>

        <Card>
          <DataTable<Grade>
            data={grades}
            columns={columns}
            isLoading={isLoading}
            error={error}
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
            }}
            emptyMessage="Chưa có dữ liệu điểm"
          />
        </Card>
      </div>

      <FormModal
        isOpen={isModalOpen}
        title="Nhập điểm mới"
        fields={formFields}
        initialData={{}}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGrade}
      />
    </AdminLayout>
  );
};

export default GradesPage;
