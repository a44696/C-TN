import React, { useState, useEffect } from "react";
import { Download, Filter, TrendingUp, AlertTriangle } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import DataTable from "../components/common/DataTable";
import { apiClient } from "../utils/apiClient";
import { StatusBadge } from "../components/common/Badge";

const AttendanceStatisticsPage: React.FC = () => {
  const [attendanceOverview, setAttendanceOverview] = useState<any>(null);
  const [studentsAtRisk, setStudentsAtRisk] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    semesterId: "",
    facultyId: "",
    classId: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const limit = 10;

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Convert dates to ISO 8601 format if provided
      const startDateISO = filters.startDate
        ? new Date(filters.startDate).toISOString()
        : "";
      const endDateISO = filters.endDate
        ? new Date(filters.endDate).toISOString()
        : "";

      // Build params - only include non-empty values
      const params: any = {
        page,
        limit,
      };

      if (filters.semesterId) params.semesterId = filters.semesterId;
      if (filters.facultyId) params.facultyId = filters.facultyId;
      if (filters.classId) params.classId = filters.classId;
      if (startDateISO) params.startDate = startDateISO;
      if (endDateISO) params.endDate = endDateISO;

      // Fetch both datasets in parallel
      const [overviewRes, riskRes] = await Promise.all([
        apiClient.getAttendanceOverview(params),
        apiClient.getStudentsAtRisk(params),
      ]);

      setAttendanceOverview(overviewRes);

      if (riskRes) {
        setStudentsAtRisk(
          Array.isArray(riskRes.studentsAtRisk) ? riskRes.studentsAtRisk : [],
        );
        setTotal(riskRes.totalAtRisk || 0);
      } else {
        setStudentsAtRisk([]);
        setTotal(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch when user clicks search button or page changes after search
  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [page, hasSearched]);

  const handleExportReport = async () => {
    try {
      setIsLoading(true);

      // Convert dates to ISO 8601 format if provided
      const startDateISO = filters.startDate
        ? new Date(filters.startDate).toISOString()
        : "";
      const endDateISO = filters.endDate
        ? new Date(filters.endDate).toISOString()
        : "";

      const reportData = await apiClient.generateAttendanceReport({
        semesterId: filters.semesterId,
        facultyId: filters.facultyId,
        classId: filters.classId,
        startDate: startDateISO,
        endDate: endDateISO,
      });

      // Create blob and download
      const blob = new Blob([reportData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xuất báo cáo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout topbarTitle="Thống Kê Chuyên Cần">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Thống Kê Chuyên Cần
          </h1>
          <p className="text-gray-600 mt-1">
            Xem chi tiết tỉ lệ đi học và danh sách sinh viên có nguy cơ cấm thi
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Bộ Lọc</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kỳ Học
              </label>
              <input
                type="text"
                placeholder="Semester ID"
                value={filters.semesterId}
                onChange={(e) =>
                  setFilters({ ...filters, semesterId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bộ Phận
              </label>
              <input
                type="text"
                placeholder="Faculty ID"
                value={filters.facultyId}
                onChange={(e) =>
                  setFilters({ ...filters, facultyId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lớp Học Phần
              </label>
              <input
                type="text"
                placeholder="Class ID"
                value={filters.classId}
                onChange={(e) =>
                  setFilters({ ...filters, classId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ Ngày
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến Ngày
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => {
                setPage(1);
                setHasSearched(true);
              }}
              className="flex items-center gap-2"
            >
              <Filter size={18} />
              Lọc Dữ Liệu
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportReport}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Xuất Báo Cáo Excel
            </Button>
          </div>
        </Card>

        {/* Overview Stats */}
        {attendanceOverview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Tổng Sinh Viên
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {attendanceOverview.summary?.totalStudents || 0}
                  </p>
                </div>
                <TrendingUp className="text-blue-600" size={40} />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Tỉ Lệ Đi Học Trung Bình
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {(
                      attendanceOverview.summary?.averageAttendanceRate || 0
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <TrendingUp className="text-green-600" size={40} />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Sinh Viên Có Nguy Cơ
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {attendanceOverview.totalAtRisk || 0}
                  </p>
                </div>
                <AlertTriangle className="text-red-600" size={40} />
              </div>
            </Card>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Students At Risk Table */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={20} />
            Sinh Viên Có Nguy Cơ Cấm Thi
          </h2>
          <DataTable
            data={studentsAtRisk}
            columns={[
              {
                key: "studentCode",
                label: "Mã Sinh Viên",
                width: "15%",
              },
              {
                key: "fullName",
                label: "Họ Tên",
                width: "25%",
              },
              {
                key: "className",
                label: "Lớp",
                width: "15%",
              },
              {
                key: "attendanceRate",
                label: "Tỉ Lệ Đi Học",
                width: "15%",
                render: (value: any) => {
                  const rate = typeof value === "number" ? value : 0;
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            rate >= 80
                              ? "bg-green-600"
                              : rate >= 60
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[45px]">
                        {rate.toFixed(1)}%
                      </span>
                    </div>
                  );
                },
              },
              {
                key: "riskLevel",
                label: "Mức Nguy Hiểm",
                width: "15%",
                render: (value: string) => (
                  <StatusBadge
                    status={
                      value === "CRITICAL"
                        ? "danger"
                        : value === "WARNING"
                          ? "warning"
                          : "info"
                    }
                  >
                    {value === "CRITICAL"
                      ? "Nguy Hiểm"
                      : value === "WARNING"
                        ? "Cảnh Báo"
                        : "Bình Thường"}
                  </StatusBadge>
                ),
              },
              {
                key: "absentSessions",
                label: "Số Buổi Vắng",
                width: "15%",
              },
            ]}
            isLoading={isLoading}
            page={page}
            onPageChange={setPage}
            total={total}
            limit={limit}
          />
        </Card>

        {/* Legend */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-3">Hướng Dẫn Đọc Dữ Liệu</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Tỉ Lệ Đi Học:</strong> Tỷ lệ phần trăm buổi học mà sinh
              viên tham gia so với tổng số buổi học
            </p>
            <p>
              <strong>Mức Cảnh Báo:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>
                <span className="text-red-600 font-medium">Cao (High):</span> Tỉ
                lệ &lt; 70% (Nguy cơ bị cấm thi rất cao)
              </li>
              <li>
                <span className="text-yellow-600 font-medium">
                  Trung Bình (Medium):
                </span>{" "}
                Tỉ lệ 70-80% (Cần theo dõi chặt chẽ)
              </li>
              <li>
                <span className="text-blue-600 font-medium">Thấp (Low):</span>{" "}
                Tỉ lệ &gt; 80% (An toàn)
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AttendanceStatisticsPage;
