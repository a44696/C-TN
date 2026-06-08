import React, { useState } from "react";
import { Search, Trash2, AlertCircle, Camera } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { StatusBadge } from "../components/common/Badge";

const FaceIDManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentFaces, setStudentFaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearchStudent = async () => {
    if (!searchQuery.trim()) {
      setError("Vui lòng nhập mã hoặc tên sinh viên");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO: Integrate with actual API endpoint
      // For now, show placeholder message
      setError("Chức năng này sẽ được kích hoạt sau khi backend API sẵn sàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFace = async (faceId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh FaceID này?")) return;

    try {
      // TODO: Call API to delete face
      alert("Đã xóa ảnh FaceID");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa");
    }
  };

  return (
    <AdminLayout topbarTitle="Quản Lý FaceID">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản Lý Kho FaceID
          </h1>
          <p className="text-gray-600 mt-1">
            Xem và quản lý ảnh nhận diện khuôn mặt của sinh viên
          </p>
        </div>

        {/* Search Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tìm Kiếm Sinh Viên</h2>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Nhập mã sinh viên (SV001) hoặc tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchStudent()}
              />
            </div>
            <Button
              onClick={handleSearchStudent}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Search size={18} />
              Tìm Kiếm
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" />
              <p className="text-yellow-700">{error}</p>
            </div>
          )}
        </Card>

        {/* Result Section */}
        {selectedStudent && (
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Thông Tin Sinh Viên
              </h2>
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
                  <p className="font-semibold text-gray-900">
                    {selectedStudent.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lớp</p>
                  <p className="font-semibold text-gray-900">
                    {selectedStudent.class_name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Faces Grid */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Camera size={20} />
                Ảnh FaceID ({studentFaces.length})
              </h3>

              {studentFaces.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <Camera size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-gray-600">
                    Sinh viên chưa đăng ký ảnh FaceID
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Sinh viên có thể đăng ký ảnh trong ứng dụng di động
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {studentFaces.map((face) => (
                    <div key={face.id} className="relative group">
                      <img
                        src={face.image_url}
                        alt="FaceID"
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDeleteFace(face.id)}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      {face.created_at && (
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(face.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Placeholder Info */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-3">ℹ️ Thông Tin</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Tìm kiếm sinh viên bằng mã (SV001) hoặc tên</li>
            <li>• Xem tất cả ảnh FaceID đã đăng ký của sinh viên</li>
            <li>• Có thể xóa ảnh bất kỳ lúc nào</li>
            <li>
              • Các ảnh được sử dụng cho hệ thống điểm danh bằng nhận diện khuôn
              mặt
            </li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default FaceIDManagementPage;
