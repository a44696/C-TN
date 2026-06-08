import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Trash2,
  AlertCircle,
  Camera,
  Upload,
  Plus,
  ChevronLeft,
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { apiClient } from "../utils/apiClient";

const FaceIDManagementPage: React.FC = () => {
  const [view, setView] = useState<"list" | "detail">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentFaces, setStudentFaces] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({
    totalStudentsWithFaces: 0,
    totalFaceImages: 0,
    avgFacesPerStudent: 0,
  });

  // Load students on mount
  useEffect(() => {
    loadAllStudents();
    calculateStats();
  }, []);

  const loadAllStudents = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getStudents({ page: 1, limit: 1000 });
      setStudents(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      // This would require a dedicated stats endpoint from backend
      // For now, calculate from student data
      setStats({
        totalStudentsWithFaces: 0,
        totalFaceImages: 0,
        avgFacesPerStudent: 0,
      });
    } catch (err) {
      console.error("Error calculating stats:", err);
    }
  };

  const handleSearchStudent = async () => {
    if (!searchQuery.trim()) {
      setError("Vui lòng nhập mã hoặc tên sinh viên");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Filter students from the loaded list
      const filtered = students.filter(
        (s) =>
          s.student_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      if (filtered.length === 0) {
        setError("Không tìm thấy sinh viên");
        return;
      }

      if (filtered.length === 1) {
        // Auto-select single result
        await selectStudent(filtered[0]);
      } else {
        // Show multiple results - for now select first one
        await selectStudent(filtered[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectStudent = async (student: any) => {
    setSelectedStudent(student);
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const facesData = await apiClient.getStudentFaces(student.id);
      setStudentFaces(facesData.faces || []);
      setView("detail");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải ảnh khuôn mặt");
      setStudentFaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;

    if (studentFaces.length >= 5) {
      setError(
        "Sinh viên đã đăng ký đủ 5 ảnh. Vui lòng xóa ảnh cũ trước khi thêm ảnh mới.",
      );
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const result = await apiClient.registerFace(selectedStudent.id, file);
      setStudentFaces([...studentFaces, result.face]);
      setSuccess(
        `Đăng ký khuôn mặt thành công! Độ tin cậy: ${(result.confidence * 100).toFixed(1)}%`,
      );
      // Reset file input
      e.target.value = "";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi tải ảnh";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFace = async (faceId: number) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa ảnh FaceID này? Hành động này không thể hoàn tác.",
      )
    )
      return;

    try {
      await apiClient.deleteFace(faceId);
      setStudentFaces(studentFaces.filter((f) => f.id !== faceId));
      setSuccess("Đã xóa ảnh khuôn mặt thành công");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi khi xóa";
      setError(errorMessage);
    }
  };

  const goBack = () => {
    setView("list");
    setSelectedStudent(null);
    setStudentFaces([]);
    setSearchQuery("");
    setError("");
    setSuccess("");
  };

  if (view === "detail" && selectedStudent) {
    return (
      <AdminLayout topbarTitle="Quản Lý FaceID">
        <div className="space-y-6">
          {/* Back Button */}
          <div>
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition mb-4"
            >
              <ChevronLeft size={20} />
              Quay Lại
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
              Quản Lý Khuôn Mặt Sinh Viên
            </h1>
          </div>

          {/* Student Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Thông Tin Sinh Viên</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã Sinh Viên</p>
                <p className="font-semibold text-gray-900">
                  {selectedStudent.student_code}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Họ Tên</p>
                <p className="font-semibold text-gray-900">
                  {selectedStudent.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {selectedStudent.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lớp</p>
                <p className="font-semibold text-gray-900">
                  {selectedStudent.class_name || "N/A"}
                </p>
              </div>
            </div>
          </Card>

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <div className="text-green-600 flex-shrink-0 mt-0.5">✓</div>
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Faces Grid */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Camera size={20} />
                  Ảnh FaceID ({studentFaces.length}/5)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tối đa 5 ảnh cho mỗi sinh viên
                </p>
              </div>

              {studentFaces.length < 5 && (
                <div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Plus size={18} />
                    {uploading ? "Đang tải..." : "Thêm Ảnh"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {studentFaces.length === 0 ? (
              <div className="p-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-gray-600 font-medium">
                  Sinh viên chưa đăng ký ảnh FaceID
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Nhấn nút "Thêm Ảnh" để tải lên ảnh khuôn mặt sinh viên
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {studentFaces.map((face, index) => (
                  <div key={face.id} className="relative group">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={face.image_url}
                        alt={`FaceID ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDeleteFace(face.id)}
                          className="bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 transition shadow-lg"
                          title="Xóa ảnh"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Face Info */}
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Ảnh {index + 1}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(face.created_at).toLocaleDateString("vi-VN")}{" "}
                        {new Date(face.created_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Status Info */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-3">ℹ️ Thông Tin</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                • Sinh viên cần đăng ký tối thiểu 1 ảnh để sử dụng tính năng
                điểm danh bằng FaceID
              </li>
              <li>
                • Tối đa 5 ảnh/sinh viên để cân bằng độ chính xác và dung lượng
              </li>
              <li>
                • Ảnh chất lượng cao, ánh sáng tốt sẽ giúp tăng độ chính xác
              </li>
              <li>• Có thể xóa ảnh bất kỳ lúc nào bằng cách hover vào ảnh</li>
              <li>• Hình ảnh được lưu trữ an toàn trên Cloudinary CDN</li>
            </ul>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout topbarTitle="Quản Lý FaceID">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản Lý Kho FaceID
          </h1>
          <p className="text-gray-600 mt-1">
            Xem, quản lý, và tải lên ảnh nhận diện khuôn mặt của sinh viên
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Sinh Viên Có Khuôn Mặt
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.totalStudentsWithFaces}
                </p>
              </div>
              <Camera className="text-blue-400" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Tổng Ảnh Lưu Trữ
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.totalFaceImages}
                </p>
              </div>
              <Upload className="text-purple-400" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Trung Bình Ảnh/SV
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.avgFacesPerStudent.toFixed(1)}
                </p>
              </div>
              <div className="text-2xl text-green-600">📊</div>
            </div>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tìm Kiếm Sinh Viên</h2>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Nhập mã sinh viên (20210001) hoặc tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchStudent()}
              />
            </div>
            <Button
              onClick={handleSearchStudent}
              disabled={isLoading || !searchQuery.trim()}
              className="flex items-center gap-2"
            >
              <Search size={18} />
              {isLoading ? "Đang tìm..." : "Tìm Kiếm"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </Card>

        {/* Recent Students */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Danh Sách Sinh Viên</h2>

          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Chưa có sinh viên trong hệ thống</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Mã SV
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Họ Tên
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Lớp
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 10).map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {student.student_code}
                      </td>
                      <td className="py-3 px-4">{student.full_name}</td>
                      <td className="py-3 px-4">
                        {student.class_name || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => selectStudent(student)}
                          className="text-blue-600 hover:text-blue-800 transition font-medium"
                        >
                          Quản Lý
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-3">🎯 Hướng Dẫn Sử Dụng</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              • <strong>Tìm Kiếm:</strong> Nhập mã sinh viên hoặc tên để tìm
              sinh viên
            </li>
            <li>
              • <strong>Xem Chi Tiết:</strong> Nhấn "Quản Lý" để xem và quản lý
              ảnh khuôn mặt
            </li>
            <li>
              • <strong>Thêm Ảnh:</strong> Nhấn "Thêm Ảnh" để tải lên ảnh mới
              (tối đa 5 ảnh/SV)
            </li>
            <li>
              • <strong>Xóa Ảnh:</strong> Hover vào ảnh và nhấn icon thùng rác
              để xóa
            </li>
            <li>
              • <strong>Yêu Cầu:</strong> Ảnh chất lượng cao giúp tăng độ chính
              xác nhận diện (tối thiểu 0.6)
            </li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default FaceIDManagementPage;
