import React, { useState } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import { apiClient } from "../utils/apiClient";

type ImportType = "students" | "lecturers" | "course-classes";

interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors: string[];
  importedRecords: any[];
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
      let importResult: any = null;

      if (importType === "students") {
        importResult = await apiClient.uploadStudentsExcel(file);
      } else if (importType === "lecturers") {
        importResult = await apiClient.uploadLecturersExcel(file);
      }

      // API trả về { total_rows, success_count, error_count, success[], errors[] }
      const successCount =
        importResult?.success_count ?? importResult?.success?.length ?? 0;
      const errorCount =
        importResult?.error_count ?? importResult?.errors?.length ?? 0;
      const totalRows = importResult?.total_rows ?? successCount + errorCount;
      const importedRecords: any[] = Array.isArray(importResult?.success)
        ? importResult.success
        : [];
      const errorMessages: string[] = (importResult?.errors ?? []).map(
        (e: any) =>
          typeof e === "string" ? e : (e?.message ?? JSON.stringify(e)),
      );

      setResult({
        success: successCount,
        failed: errorCount,
        total: totalRows,
        errors: errorMessages,
        importedRecords,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định";
      setResult({
        success: 0,
        failed: 1,
        total: 0,
        errors: [errorMessage],
        importedRecords: [],
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
            {[
              {
                value: "students" as ImportType,
                label: "Sinh Viên",
                description: "Import danh sách sinh viên",
                disabled: false,
              },
              {
                value: "lecturers" as ImportType,
                label: "Giáo Viên",
                description: "Import danh sách giáo viên",
                disabled: false,
              },
              {
                value: "course-classes" as ImportType,
                label: "Lớp Học Phần",
                description: "Import danh sách lớp học phần",
                disabled: true,
              },
            ].map((type) => (
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
                className={`rounded-lg border-2 overflow-hidden ${
                  result.success > 0 && result.failed === 0
                    ? "border-green-200"
                    : result.success > 0
                      ? "border-yellow-200"
                      : "border-red-200"
                }`}
              >
                {/* Header */}
                <div
                  className={`p-4 ${
                    result.success > 0 && result.failed === 0
                      ? "bg-green-50"
                      : result.success > 0
                        ? "bg-yellow-50"
                        : "bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success > 0 ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">
                        {result.total === 0
                          ? "File không có dữ liệu (0 dòng)"
                          : result.failed === 0
                            ? `Import thành công ${result.success}/${result.total} bản ghi`
                            : `Import hoàn tất: ${result.success} thành công, ${result.failed} thất bại`}
                      </h3>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-600">
                          Tổng dòng: <strong>{result.total}</strong>
                        </p>
                        <p className="text-green-700">
                          ✓ Thêm thành công: <strong>{result.success}</strong>
                        </p>
                        {result.failed > 0 && (
                          <p className="text-red-700">
                            ✗ Thất bại: <strong>{result.failed}</strong>
                          </p>
                        )}
                        {result.total === 0 && (
                          <p className="text-orange-600 mt-1">
                            ⚠ File Excel không có dữ liệu. Hãy kiểm tra lại cấu
                            trúc file theo hướng dẫn bên dưới.
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

                {/* Imported Records Table */}
                {result.importedRecords.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Danh sách bản ghi đã import (
                      {result.importedRecords.length}):
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            {importType === "students" ? (
                              <>
                                <th className="border border-gray-200 px-2 py-1 text-left">
                                  Mã SV
                                </th>
                                <th className="border border-gray-200 px-2 py-1 text-left">
                                  Họ tên
                                </th>
                                <th className="border border-gray-200 px-2 py-1 text-left">
                                  Email
                                </th>
                                <th className="border border-gray-200 px-2 py-1 text-left">
                                  Lớp
                                </th>
                                <th className="border border-gray-200 px-2 py-1 text-left">
                                  Khoa
                                </th>
                              </>
                            ) : (
                              <>
                                <th className="border border-gray-200 px-2 py-1 text-left">
                                  Mã GV
                                </th>
                                <th className="border border-gray-200 px-2 py-1 text-left">
                                  Họ tên
                                </th>
                                <th className="border border-gray-200 px-2 py-1 text-left">
                                  Email
                                </th>
                                <th className="border border-gray-200 px-2 py-1 text-left">
                                  Phòng ban
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {result.importedRecords.map((rec, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              {importType === "students" ? (
                                <>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {rec.student_code}
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {rec.full_name}
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {rec.email}
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {rec.class_name}
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {rec.department_name}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {rec.lecturer_code}
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {rec.full_name}
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {rec.email}
                                  </td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    {rec.department}
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Dữ liệu đã được lưu vào hệ thống. Xem danh sách đầy đủ tại
                      trang Quản Lý Người Dùng.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Template Section */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-4">
            Hướng dẫn & Tải template
          </h2>
          <div className="space-y-4 text-sm">
            {importType === "students" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">
                    Cấu trúc file sinh viên (10 cột):
                  </h3>
                  <a
                    href="/template_students.xlsx"
                    download="template_students.xlsx"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ⬇ Tải template sinh viên
                  </a>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200 overflow-x-auto">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-2 py-1">
                          Cột
                        </th>
                        <th className="border border-blue-200 px-2 py-1">
                          Tên field
                        </th>
                        <th className="border border-blue-200 px-2 py-1">
                          Bắt buộc
                        </th>
                        <th className="border border-blue-200 px-2 py-1">
                          Ví dụ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["A", "student_code", "✓", "SV100"],
                        ["B", "full_name", "✓", "Nguyễn Văn A"],
                        ["C", "dob", "✓", "2004-01-15"],
                        ["D", "gender", "✓", "MALE / FEMALE / OTHER"],
                        ["E", "phone_number", "✓", "0912345678"],
                        ["F", "class_name", "✓", "CL01"],
                        ["G", "email", "✓", "sv@tlu.edu.vn"],
                        ["H", "address", "", "Hà Nội"],
                        ["I", "major_name", "", "Công nghệ thông tin"],
                        ["J", "department_name", "", "Khoa CNTT"],
                      ].map(([col, field, req, ex]) => (
                        <tr key={col}>
                          <td className="border border-blue-200 px-2 py-1 text-center font-mono font-bold">
                            {col}
                          </td>
                          <td className="border border-blue-200 px-2 py-1 font-mono">
                            {field}
                          </td>
                          <td className="border border-blue-200 px-2 py-1 text-center text-green-600">
                            {req}
                          </td>
                          <td className="border border-blue-200 px-2 py-1 text-gray-500">
                            {ex}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-orange-600 text-xs">
                  ⚠ Không có cột STT. Dòng 1 là header, dữ liệu bắt đầu từ dòng
                  2.
                </p>
              </div>
            )}
            {importType === "lecturers" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">
                    Cấu trúc file giảng viên (7 cột):
                  </h3>
                  <a
                    href="/template_lecturers.xlsx"
                    download="template_lecturers.xlsx"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ⬇ Tải template giảng viên
                  </a>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200 overflow-x-auto">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-2 py-1">
                          Cột
                        </th>
                        <th className="border border-blue-200 px-2 py-1">
                          Tên field
                        </th>
                        <th className="border border-blue-200 px-2 py-1">
                          Bắt buộc
                        </th>
                        <th className="border border-blue-200 px-2 py-1">
                          Ví dụ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["A", "lecturer_code", "✓", "GV100"],
                        ["B", "full_name", "✓", "Nguyễn Văn Bình"],
                        ["C", "department", "✓", "Khoa CNTT"],
                        ["D", "phone_number", "✓", "0981000001"],
                        ["E", "email", "✓", "gv@tlu.edu.vn"],
                        ["F", "major_name", "", "Công nghệ thông tin"],
                        ["G", "degree", "✓", "BACHELOR / MASTER / PHD"],
                      ].map(([col, field, req, ex]) => (
                        <tr key={col}>
                          <td className="border border-blue-200 px-2 py-1 text-center font-mono font-bold">
                            {col}
                          </td>
                          <td className="border border-blue-200 px-2 py-1 font-mono">
                            {field}
                          </td>
                          <td className="border border-blue-200 px-2 py-1 text-center text-green-600">
                            {req}
                          </td>
                          <td className="border border-blue-200 px-2 py-1 text-gray-500">
                            {ex}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-orange-600 text-xs">
                  ⚠ Không có cột STT. Dòng 1 là header, dữ liệu bắt đầu từ dòng
                  2.
                </p>
              </div>
            )}
            <div className="bg-white p-3 rounded border border-blue-200 text-xs text-gray-700 space-y-1 mt-2">
              <p>
                • Mật khẩu mặc định sau import: <strong>123456</strong>
              </p>
              <p>
                • Mã (student_code / lecturer_code) phải là duy nhất trong hệ
                thống
              </p>
              <p>
                • Ngày sinh: định dạng <strong>YYYY-MM-DD</strong> (VD:
                2004-01-15)
              </p>
              <p>
                • Giới tính chỉ nhận: <strong>MALE</strong>,{" "}
                <strong>FEMALE</strong>, <strong>OTHER</strong>
              </p>
              <p>
                • Trình độ giảng viên chỉ nhận: <strong>BACHELOR</strong>,{" "}
                <strong>MASTER</strong>, <strong>PHD</strong>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ImportDataPage;
