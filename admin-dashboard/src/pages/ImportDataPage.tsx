import React, { useState } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { apiClient } from "../utils/apiClient";

type ImportType = "students" | "lecturers" | "course-classes";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const ImportDataPage: React.FC = () => {
  const [importType, setImportType] = useState<ImportType>("students");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResult(null);
    setFileName(file.name);

    try {
      let importResult: any[] = [];

      if (importType === "students") {
        importResult = await apiClient.uploadStudentsExcel(file);
      } else if (importType === "lecturers") {
        importResult = await apiClient.uploadLecturersExcel(file);
      }

      setResult({
        success: importResult.length,
        failed: 0,
        errors: [],
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định";
      setResult({
        success: 0,
        failed: 1,
        errors: [errorMessage],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout topbarTitle="Import Dữ Liệu">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Dữ Liệu</h1>
          <p className="text-gray-600 mt-1">
            Nạp dữ liệu hàng loạt từ file Excel
          </p>
        </div>

        {/* Type Selector */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Chọn loại dữ liệu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                {
                  value: "students" as ImportType,
                  label: "Sinh Viên",
                  description: "Import danh sách sinh viên",
                },
                {
                  value: "lecturers" as ImportType,
                  label: "Giáo Viên",
                  description: "Import danh sách giáo viên",
                },
                {
                  value: "course-classes" as ImportType,
                  label: "Lớp Học Phần",
                  description: "Import danh sách lớp học phần",
                  disabled: true,
                },
              ] as const
            ).map((type) => (
              <button
                key={type.value}
                onClick={() => !type.disabled && setImportType(type.value)}
                disabled={type.disabled}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  !type.disabled
                    ? importType === type.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-400"
                    : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileSpreadsheet
                    size={24}
                    className={
                      importType === type.value
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  />
                  <h3 className="font-semibold">{type.label}</h3>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
                {type.disabled && (
                  <p className="text-xs text-gray-500 mt-2">
                    (Sắp được bổ sung)
                  </p>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Upload Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tải lên file</h2>

          <div className="space-y-4">
            {/* Upload Area */}
            <div
              onClick={() => document.getElementById("file-input")?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="hidden"
              />
              <Upload size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-lg font-medium text-gray-900">
                Kéo thả hoặc nhấp để chọn file
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Chỉ chấp nhận file Excel (.xlsx, .xls)
              </p>
              {fileName && (
                <p className="text-sm text-blue-600 mt-3 font-medium">
                  {fileName}
                </p>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="animate-spin">⏳</div>
                <p>Đang xử lý...</p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  result.failed === 0
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.failed === 0 ? (
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">
                      {result.failed === 0
                        ? "Import thành công!"
                        : "Import có lỗi"}
                    </h3>
                    <div className="text-sm space-y-1">
                      <p className="text-green-700">
                        ✓ Thành công: {result.success}
                      </p>
                      {result.failed > 0 && (
                        <p className="text-red-700">
                          ✗ Thất bại: {result.failed}
                        </p>
                      )}
                    </div>
                    {result.errors.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="font-medium">Chi tiết lỗi:</p>
                        <ul className="text-xs text-red-700 list-disc list-inside">
                          {result.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Template Section */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-4">Hướng dẫn</h2>
          <div className="space-y-4 text-sm">
            {importType === "students" && (
              <div>
                <h3 className="font-medium mb-2">Cấu trúc file sinh viên:</h3>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <code className="text-xs">
                    student_code | full_name | email | phone_number | class_name
                    | department_name
                  </code>
                </div>
                <p className="mt-2 text-gray-700">
                  Ví dụ:
                  <br />
                  <code className="text-xs bg-white p-1 rounded">
                    SV001 | Nguyễn Văn A | nguyenvana@example.com | 0123456789 |
                    21T1 | CNTT
                  </code>
                </p>
              </div>
            )}
            {importType === "lecturers" && (
              <div>
                <h3 className="font-medium mb-2">Cấu trúc file giáo viên:</h3>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <code className="text-xs">
                    lecturer_code | full_name | email | phone_number |
                    department | degree
                  </code>
                </div>
                <p className="mt-2 text-gray-700">
                  Ví dụ:
                  <br />
                  <code className="text-xs bg-white p-1 rounded">
                    GV001 | Trần Thị B | tranthib@example.com | 0987654321 |
                    CNTT | ThS.
                  </code>
                </p>
              </div>
            )}
            <p className="text-gray-700 mt-3">
              • File phải có dòng header ở hàng đầu tiên
              <br />
              • Tất cả các trường bắt buộc phải có dữ liệu
              <br />• Mã (student_code, lecturer_code) phải là duy nhất
            </p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ImportDataPage;
