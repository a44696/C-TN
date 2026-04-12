import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Upload } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import DataTable from "../components/common/DataTable";
import FormModal, { type FormField } from "../components/common/FormModal";
import { apiClient } from "../utils/apiClient";
import type { Subject, Semester, Lecturer, CourseClass } from "../types/api";

type TabType = "subjects" | "semesters" | "lecturers" | "courseClasses";

const MasterDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("subjects");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;

  // ==================== SUBJECTS ====================

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiClient.getSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = async (data: Record<string, unknown>) => {
    try {
      await apiClient.createSubject({
        subject_code: data.subject_code as string,
        subject_name: data.subject_name as string,
        credits: parseInt(data.credits as string),
        description: data.description as string,
      });
      await fetchSubjects();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi tạo");
    }
  };

  const handleUpdateSubject = async (data: Record<string, unknown>) => {
    if (!editingId) return;
    try {
      await apiClient.updateSubject(editingId, {
        subject_code: data.subject_code as string,
        subject_name: data.subject_name as string,
        credits: parseInt(data.credits as string),
        description: data.description as string,
      });
      setEditingId(null);
      await fetchSubjects();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      try {
        await apiClient.deleteSubject(id);
        await fetchSubjects();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi xóa");
      }
    }
  };

  const subjectFields: FormField[] = [
    {
      name: "subject_code",
      label: "Mã môn học",
      type: "text",
      required: true,
      placeholder: "VD: CS101",
    },
    {
      name: "subject_name",
      label: "Tên môn học",
      type: "text",
      required: true,
      placeholder: "Nhập tên môn học",
    },
    {
      name: "credits",
      label: "Số tín chỉ",
      type: "number",
      required: true,
      placeholder: "3",
    },
    {
      name: "description",
      label: "Mô tả",
      type: "textarea",
      placeholder: "Nhập mô tả môn học",
    },
  ];

  // ==================== SEMESTERS ====================

  const fetchSemesters = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiClient.getSemesters();
      setSemesters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSemester = async (data: Record<string, unknown>) => {
    try {
      await apiClient.createSemester({
        semester_name: data.semester_name as string,
        academic_year: data.academic_year as string,
      });
      await fetchSemesters();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi tạo");
    }
  };

  const handleUpdateSemester = async (data: Record<string, unknown>) => {
    if (!editingId) return;
    try {
      await apiClient.updateSemester(editingId, {
        semester_name: data.semester_name as string,
        academic_year: data.academic_year as string,
      });
      setEditingId(null);
      await fetchSemesters();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  };

  const semesterFields: FormField[] = [
    {
      name: "semester_name",
      label: "Tên học kỳ",
      type: "text",
      required: true,
      placeholder: "VD: HK1, HK2",
    },
    {
      name: "academic_year",
      label: "Năm học",
      type: "text",
      required: true,
      placeholder: "2025-2026",
    },
  ];

  // ==================== LECTURERS ====================

  const fetchLecturers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiClient.getLecturers();
      setLecturers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError("");
    try {
      await apiClient.uploadLecturersExcel(file);
      await fetchLecturers();
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi upload file");
    } finally {
      setIsLoading(false);
    }
  };

  const lecturerFields: FormField[] = [
    {
      name: "lecturer_code",
      label: "Mã giảng viên",
      type: "text",
      required: true,
      placeholder: "VD: GV001",
    },
    {
      name: "full_name",
      label: "Họ tên",
      type: "text",
      required: true,
      placeholder: "Nhập họ tên",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "example@tlu.edu.vn",
    },
    {
      name: "department",
      label: "Phòng ban",
      type: "text",
      required: true,
      placeholder: "Nhập phòng ban",
    },
  ];

  // ==================== COURSE CLASSES ====================

  const courseClassFields: FormField[] = [
    {
      name: "subject_id",
      label: "Môn học",
      type: "select",
      required: true,
      options: (subjects || []).map((s) => ({
        value: s.id,
        label: `${s.subject_code} - ${s.subject_name}`,
      })),
    },
    {
      name: "lecturer_id",
      label: "Giảng viên",
      type: "select",
      required: true,
      options: (lecturers || []).map((l) => ({
        value: l.id,
        label: l.full_name,
      })),
    },
    {
      name: "room",
      label: "Phòng học",
      type: "text",
      required: true,
      placeholder: "VD: A101",
    },
    {
      name: "max_students",
      label: "Tối đa sinh viên",
      type: "number",
      required: true,
    },
  ];

  useEffect(() => {
    fetchSubjects();
    fetchSemesters();
    fetchLecturers();
  }, []);

  const tabs: Array<{ value: TabType; label: string }> = [
    { value: "subjects", label: "Môn Học" },
    { value: "semesters", label: "Học Kỳ" },
    { value: "lecturers", label: "Giảng Viên" },
    { value: "courseClasses", label: "Lớp Học Phần" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Quản Lý Dữ Liệu Chính
        </h1>

        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.value
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "subjects" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={20} />
                Thêm môn học
              </Button>
            </div>

            <Card>
              <DataTable<Subject>
                data={subjects}
                columns={[
                  { key: "subject_code" as const, label: "Mã môn" },
                  { key: "subject_name" as const, label: "Tên môn" },
                  { key: "credits" as const, label: "Tín chỉ" },
                ]}
                isLoading={isLoading}
                error={error}
                actions={(row) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(row.id);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(row.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              />
            </Card>
          </div>
        )}

        {activeTab === "semesters" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={20} />
                Thêm học kỳ
              </Button>
            </div>

            <Card>
              <DataTable<Semester>
                data={semesters}
                columns={[
                  { key: "semester_name" as const, label: "Tên học kỳ" },
                  { key: "academic_year" as const, label: "Năm học" },
                ]}
                isLoading={isLoading}
                error={error}
                actions={(row) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(row.id);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              />
            </Card>
          </div>
        )}

        {activeTab === "lecturers" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2">
                <Button disabled={isLoading}>
                  <Upload size={20} />
                  Import Excel
                </Button>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={20} />
                Thêm giảng viên
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600">
                {error}
              </div>
            )}

            <Card>
              <DataTable<Lecturer>
                data={lecturers}
                columns={[
                  { key: "lecturer_code" as const, label: "Mã GV" },
                  { key: "full_name" as const, label: "Họ tên" },
                  { key: "email" as const, label: "Email" },
                  { key: "department" as const, label: "Phòng ban" },
                ]}
                isLoading={isLoading}
              />
            </Card>
          </div>
        )}

        {activeTab === "courseClasses" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={20} />
                Thêm lớp học phần
              </Button>
            </div>

            <Card>
              <DataTable<CourseClass>
                data={courseClasses}
                columns={[
                  { key: "academic_year" as const, label: "Năm học" },
                  { key: "room" as const, label: "Phòng" },
                  { key: "max_students" as const, label: "Tối đa SV" },
                ]}
                isLoading={isLoading}
                error={error}
              />
            </Card>
          </div>
        )}
      </div>

      <FormModal
        isOpen={isModalOpen}
        title={`${editingId ? "Cập nhật" : "Thêm"} ${
          activeTab === "subjects"
            ? "môn học"
            : activeTab === "semesters"
              ? "học kỳ"
              : activeTab === "lecturers"
                ? "giảng viên"
                : "lớp học phần"
        }`}
        fields={
          activeTab === "subjects"
            ? subjectFields
            : activeTab === "semesters"
              ? semesterFields
              : activeTab === "lecturers"
                ? lecturerFields
                : courseClassFields
        }
        initialData={{}}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={
          activeTab === "subjects"
            ? editingId
              ? handleUpdateSubject
              : handleCreateSubject
            : activeTab === "semesters"
              ? editingId
                ? handleUpdateSemester
                : handleCreateSemester
              : async () => {}
        }
      />
    </AdminLayout>
  );
};

export default MasterDataPage;
