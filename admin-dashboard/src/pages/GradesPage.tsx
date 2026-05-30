import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import DataTable from "../components/common/DataTable";
import FormModal, { type FormField } from "../components/common/FormModal";
import { apiClient } from "../utils/apiClient";
import type { Grade, ClassEnrollment } from "../types/api";

const GradesPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchEnrollments = async () => {
    try {
      const response = await apiClient.getClassEnrollments({
        page: 1,
        limit: 1000,
      });
      setEnrollments(response.data);
    } catch (err) {
      console.error("Lỗi khi tải đăng ký học phần:", err);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchEnrollments();
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
      label: "Chọn sinh viên và lớp học",
      type: "select",
      required: true,
      options: enrollments.map((enrollment) => ({
        value: enrollment.id,
        label: `${enrollment.student?.student_code} - ${enrollment.student?.full_name} (${enrollment.course_class?.subject?.subject_name})`,
      })),
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

  const filteredGrades = grades.filter((grade) => {
    const student = grade.student;
    if (!student) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.student_code.toLowerCase().includes(searchLower) ||
      student.full_name.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    { key: "id" as const, label: "ID" },
    {
      key: "student" as const,
      label: "Mã sinh viên",
      render: (value: unknown) => {
        const student = value as Grade["student"];
        return student ? student.student_code : "-";
      },
    },
    {
      key: "student" as const,
      label: "Tên sinh viên",
      render: (value: unknown) => {
        const student = value as Grade["student"];
        return student ? student.full_name : "-";
      },
    },
    {
      key: "course_class" as const,
      label: "Môn học",
      render: (value: unknown) => {
        const courseClass = value as Grade["course_class"];
        return courseClass ? courseClass.subject?.subject_name : "-";
      },
    },
    {
      key: "course_class" as const,
      label: "Phòng học",
      render: (value: unknown) => {
        const courseClass = value as Grade["course_class"];
        return courseClass ? courseClass.room : "-";
      },
    },
    {
      key: "course_class" as const,
      label: "Thời gian",
      render: (value: unknown) => {
        const courseClass = value as Grade["course_class"];
        return courseClass ? courseClass.lesson_slot : "-";
      },
    },
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
    <AdminLayout topbarTitle="Điểm Số" showSearch={false}>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="w-80 flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Nhập điểm mới</Button>
        </div>

        <Card>
          <DataTable<Grade>
            data={filteredGrades}
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
