import React, { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import DataTable from "../components/common/DataTable";
import FormModal, { type FormField } from "../components/common/FormModal";
import { apiClient } from "../utils/apiClient";
import type { AttendanceWarning } from "../types/api";

const AttendanceWarningsPage: React.FC = () => {
  const [warnings, setWarnings] = useState<AttendanceWarning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarning, setSelectedWarning] =
    useState<AttendanceWarning | null>(null);
  const [severityFilter, setSeverityFilter] = useState<
    "Low" | "Medium" | "High" | undefined
  >();
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>();

  const limit = 10;

  const fetchWarnings = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.getAttendanceWarnings({
        page,
        limit,
        severity: severityFilter,
        is_resolved: resolvedFilter,
      });
      setWarnings(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, [page, severityFilter, resolvedFilter]);

  const handleResolve = async (data: Record<string, unknown>) => {
    if (!selectedWarning) return;
    try {
      await apiClient.resolveAttendanceWarning(selectedWarning.id, {
        resolution_note: data.resolution_note as string,
        resolved_by: 1, // Assuming current user ID is 1
      });
      setIsModalOpen(false);
      setSelectedWarning(null);
      await fetchWarnings();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi xử lý");
    }
  };

  const severityIcons = {
    Low: <AlertCircle size={16} className="text-yellow-600" />,
    Medium: <AlertTriangle size={16} className="text-orange-600" />,
    High: <AlertOctagon size={16} className="text-red-600" />,
  };

  const formFields: FormField[] = [
    {
      name: "resolution_note",
      label: "Ghi chú giải quyết",
      type: "textarea",
      required: true,
      placeholder: "Nhập ghi chú về cách giải quyết...",
    },
  ];

  const columns = [
    { key: "student_code" as const, label: "Mã sinh viên" },
    { key: "student_name" as const, label: "Tên sinh viên" },
    { key: "category" as const, label: "Loại" },
    {
      key: "severity" as const,
      label: "Mức độ",
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          {severityIcons[value as keyof typeof severityIcons]}
          {value}
        </div>
      ),
    },
    {
      key: "content" as const,
      label: "Nội dung",
      className: "max-w-xs truncate",
    },
    {
      key: "is_resolved" as const,
      label: "Trạng thái",
      render: (value: unknown) =>
        value ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
            Đã giải quyết
          </span>
        ) : (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
            Chưa giải quyết
          </span>
        ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Cảnh Báo Vắng Học</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {warnings.filter((w) => w.severity === "High").length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Cảnh báo cao</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {warnings.filter((w) => w.severity === "Medium").length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Cảnh báo vừa</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {warnings.filter((w) => w.is_resolved).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Đã giải quyết</p>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Mức độ</p>
              <div className="flex gap-2">
                <Button
                  variant={
                    severityFilter === undefined ? "primary" : "secondary"
                  }
                  onClick={() => setSeverityFilter(undefined)}
                  size="sm"
                >
                  Tất cả
                </Button>
                <Button
                  variant={severityFilter === "Low" ? "primary" : "secondary"}
                  onClick={() => setSeverityFilter("Low")}
                  size="sm"
                >
                  Thấp
                </Button>
                <Button
                  variant={
                    severityFilter === "Medium" ? "primary" : "secondary"
                  }
                  onClick={() => setSeverityFilter("Medium")}
                  size="sm"
                >
                  Vừa
                </Button>
                <Button
                  variant={severityFilter === "High" ? "primary" : "secondary"}
                  onClick={() => setSeverityFilter("High")}
                  size="sm"
                >
                  Cao
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Trạng thái
              </p>
              <div className="flex gap-2">
                <Button
                  variant={
                    resolvedFilter === undefined ? "primary" : "secondary"
                  }
                  onClick={() => setResolvedFilter(undefined)}
                  size="sm"
                >
                  Tất cả
                </Button>
                <Button
                  variant={resolvedFilter === false ? "primary" : "secondary"}
                  onClick={() => setResolvedFilter(false)}
                  size="sm"
                >
                  Chưa giải quyết
                </Button>
                <Button
                  variant={resolvedFilter === true ? "primary" : "secondary"}
                  onClick={() => setResolvedFilter(true)}
                  size="sm"
                >
                  Đã giải quyết
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <DataTable<AttendanceWarning>
            data={warnings}
            columns={columns}
            isLoading={isLoading}
            error={error}
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
            }}
            actions={(row) =>
              !row.is_resolved ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedWarning(row);
                    setIsModalOpen(true);
                  }}
                >
                  Xử lý
                </Button>
              ) : (
                <span className="text-xs text-gray-500">Đã xử lý</span>
              )
            }
          />
        </Card>
      </div>

      <FormModal
        isOpen={isModalOpen}
        title="Giải quyết cảnh báo vắng"
        fields={formFields}
        initialData={{}}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWarning(null);
        }}
        onSubmit={handleResolve}
      />
    </AdminLayout>
  );
};

export default AttendanceWarningsPage;
