import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
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
  const [editingLecturerCode, setEditingLecturerCode] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);

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

  const handleCreateLecturer = async (data: Record<string, unknown>) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await apiClient.createLecturer({
        lecturer_code: data.lecturer_code as string,
        full_name: data.full_name as string,
        email: data.email as string,
        department: data.department as string,
        phone_number: data.phone_number as string,
        major_name: data.major_name as string,
        degree: data.degree as string,
        user_id: user.id || 0,
      });
      await fetchLecturers();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi tạo");
    }
  };

  const handleUpdateLecturer = async (data: Record<string, unknown>) => {
    if (!editingLecturerCode) return;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await apiClient.updateLecturer(editingLecturerCode, {
        lecturer_code: data.lecturer_code as string,
        full_name: data.full_name as string,
        email: data.email as string,
        department: data.department as string,
        phone_number: data.phone_number as string,
        major_name: data.major_name as string,
        degree: data.degree as string,
        user_id: user.id || 0,
      });
      setEditingLecturerCode(null);
      await fetchLecturers();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  };

  const handleDeleteLecturer = async (lecturerCode: string) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      try {
        await apiClient.deleteLecturer(lecturerCode);
        await fetchLecturers();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi xóa");
      }
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
      name: "phone_number",
      label: "Số điện thoại",
      type: "text",
      required: true,
      placeholder: "VD: 0912345678",
    },
    {
      name: "department",
      label: "Phòng ban",
      type: "text",
      required: true,
      placeholder: "Nhập phòng ban",
    },
    {
      name: "major_name",
      label: "Chuyên ngành",
      type: "text",
      required: true,
      placeholder: "VD: Công Nghệ Thông Tin",
    },
    {
      name: "degree",
      label: "Bằng cấp",
      type: "select",
      required: true,
      options: [
        { value: "BACHELOR", label: "Cử Nhân (Bachelor)" },
        { value: "MASTER", label: "Thạc Sĩ (Master)" },
        { value: "PHD", label: "Tiến Sĩ (PhD)" },
      ],
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
      name: "semester_id",
      label: "Học kỳ",
      type: "select",
      required: true,
      options: (semesters || []).map((s) => ({
        value: s.id,
        label: `${s.semester_name} - ${s.academic_year}`,
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
    {
      name: "day_of_week",
      label: "Thứ trong tuần",
      type: "select",
      required: true,
      options: [
        { value: 2, label: "Thứ Hai" },
        { value: 3, label: "Thứ Ba" },
        { value: 4, label: "Thứ Tư" },
        { value: 5, label: "Thứ Năm" },
        { value: 6, label: "Thứ Sáu" },
        { value: 7, label: "Thứ Bảy" },
        { value: 1, label: "Chủ Nhật" },
      ],
    },
    {
      name: "lesson_slot",
      label: "Thời gian học",
      type: "text",
      required: true,
      placeholder: "VD: 7:00-9:00",
    },
    {
      name: "start_date",
      label: "Ngày bắt đầu",
      type: "text",
      required: true,
      placeholder: "YYYY-MM-DD",
    },
    {
      name: "end_date",
      label: "Ngày kết thúc",
      type: "text",
      required: true,
      placeholder: "YYYY-MM-DD",
    },
  ];

  // ==================== COURSE CLASSES ====================

  const fetchCourseClasses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.getCourseClasses();
      setCourseClasses(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateToISODate = (dateStr: string): string => {
    // Handle various date formats and convert to YYYY-MM-DD
    if (!dateStr) return "";

    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Parse date from input (could be D/M/YYYY or M/D/YYYY)
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if parsing fails
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleCreateCourseClass = async (data: Record<string, unknown>) => {
    try {
      // Normalize lesson_slot by removing spaces around dash
      const normalizedLessonSlot = (data.lesson_slot as string)
        .replace(/\s*-\s*/g, "-")
        .trim();

      await apiClient.createCourseClass({
        subject_id: parseInt(data.subject_id as string),
        lecturer_id: parseInt(data.lecturer_id as string),
        semester_id: parseInt(data.semester_id as string),
        room: data.room as string,
        max_students: parseInt(data.max_students as string),
        day_of_week: parseInt(data.day_of_week as string),
        lesson_slot: normalizedLessonSlot,
        start_date: formatDateToISODate(data.start_date as string),
        end_date: formatDateToISODate(data.end_date as string),
      });
      await fetchCourseClasses();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi tạo");
    }
  };

  const handleUpdateCourseClass = async (data: Record<string, unknown>) => {
    if (!editingId) return;
    try {
      const normalizedLessonSlot = (data.lesson_slot as string)
        .replace(/\s*-\s*/g, "-")
        .trim();

      await apiClient.updateCourseClass(editingId, {
        subject_id: parseInt(data.subject_id as string),
        lecturer_id: parseInt(data.lecturer_id as string),
        semester_id: parseInt(data.semester_id as string),
        room: data.room as string,
        max_students: parseInt(data.max_students as string),
        day_of_week: parseInt(data.day_of_week as string),
        lesson_slot: normalizedLessonSlot,
        start_date: formatDateToISODate(data.start_date as string),
        end_date: formatDateToISODate(data.end_date as string),
      });
      setEditingId(null);
      await fetchCourseClasses();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  };

  const handleDeleteCourseClass = async (id: number) => {
    if (
      !window.confirm(
        "Bạn chắc chắn muốn xóa lớp học phần này?\nTất cả buổi điểm danh và dữ liệu liên quan sẽ bị xóa vĩnh viễn.",
      )
    )
      return;
    setIsLoading(true);
    setError("");
    try {
      await apiClient.deleteCourseClass(id);
      await fetchCourseClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi xóa");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchSemesters();
    fetchLecturers();
    fetchCourseClasses();
  }, []);

  const getDayName = (dayOfWeek: number | undefined) => {
    if (dayOfWeek === undefined) return "N/A";
    const dayMap: Record<number, string> = {
      1: "CN",
      2: "T2",
      3: "T3",
      4: "T4",
      5: "T5",
      6: "T6",
      7: "T7",
    };
    return dayMap[dayOfWeek] || dayOfWeek.toString();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const transformedCourseClasses = courseClasses.map((cc) => ({
    ...cc,
    subject_name: cc.subject?.subject_name || "N/A",
    lecturer_name: cc.lecturer?.full_name || "N/A",
    semester_name: cc.semester?.semester_name || "N/A",
    day_of_week_name: getDayName(cc.day_of_week),
    start_date_formatted: formatDate(cc.start_date),
    end_date_formatted: formatDate(cc.end_date),
  }));

  const tabs: Array<{ value: TabType; label: string }> = [
    { value: "subjects", label: "Môn Học" },
    { value: "semesters", label: "Học Kỳ" },
    { value: "lecturers", label: "Giảng Viên" },
    { value: "courseClasses", label: "Lớp Học Phần" },
  ];

  return (
    <AdminLayout topbarTitle="Quản Lý Dữ Liệu Chính" showSearch={false}>
      <div className="space-y-6">
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
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
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
                  { key: "phone_number" as const, label: "Điện thoại" },
                  { key: "department" as const, label: "Phòng ban" },
                  { key: "major_name" as const, label: "Chuyên ngành" },
                  { key: "degree" as const, label: "Bằng cấp" },
                ]}
                isLoading={isLoading}
                actions={(row) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingLecturerCode(row.lecturer_code);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteLecturer(row.lecturer_code)}
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
              <DataTable<any>
                data={transformedCourseClasses}
                columns={[
                  { key: "subject_name" as const, label: "Môn học" },
                  { key: "lecturer_name" as const, label: "Giảng viên" },
                  { key: "room" as const, label: "Phòng" },
                  { key: "max_students" as const, label: "Tối đa SV" },
                  { key: "day_of_week_name" as const, label: "Thứ" },
                  { key: "lesson_slot" as const, label: "Tiết học" },
                  { key: "start_date_formatted" as const, label: "Bắt đầu" },
                  { key: "end_date_formatted" as const, label: "Kết thúc" },
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
                      onClick={() => handleDeleteCourseClass(row.id)}
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
      </div>

      <FormModal
        isOpen={isModalOpen}
        title={`${
          activeTab === "lecturers"
            ? editingLecturerCode
              ? "Cập nhật"
              : "Thêm"
            : editingId
              ? "Cập nhật"
              : "Thêm"
        } ${
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
        initialData={
          activeTab === "lecturers" && editingLecturerCode
            ? ((lecturers.find(
                (l) => l.lecturer_code === editingLecturerCode,
              ) || {}) as Record<string, unknown>)
            : activeTab === "subjects" && editingId
              ? ((subjects.find((s) => s.id === editingId) || {}) as Record<
                  string,
                  unknown
                >)
              : activeTab === "semesters" && editingId
                ? ((semesters.find((s) => s.id === editingId) || {}) as Record<
                    string,
                    unknown
                  >)
                : activeTab === "courseClasses" && editingId
                  ? (() => {
                      const cc = courseClasses.find((c) => c.id === editingId);
                      if (!cc) return {} as Record<string, unknown>;
                      return {
                        subject_id: cc.subject_id,
                        lecturer_id: cc.lecturer_id,
                        semester_id: cc.semester_id,
                        room: cc.room,
                        max_students: cc.max_students,
                        day_of_week: cc.day_of_week,
                        lesson_slot: cc.lesson_slot,
                        start_date: formatDateToISODate(cc.start_date),
                        end_date: formatDateToISODate(cc.end_date),
                      } as Record<string, unknown>;
                    })()
                  : {}
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setEditingLecturerCode(null);
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
              : activeTab === "lecturers"
                ? editingLecturerCode
                  ? handleUpdateLecturer
                  : handleCreateLecturer
                : editingId
                  ? handleUpdateCourseClass
                  : handleCreateCourseClass
        }
      />
    </AdminLayout>
  );
};

export default MasterDataPage;
