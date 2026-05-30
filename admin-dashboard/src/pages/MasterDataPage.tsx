import React, { useState, useEffect } from "react";
import { Upload, Filter } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { StatusBadge } from "../components/common/Badge";
import { apiClient } from "../utils/apiClient";
import type { User } from "../types/api";

const QuickInsightCard: React.FC<{
  label: string;
  value: string;
  trend: string;
}> = ({ label, value, trend }) => (
  <div className="text-center">
    <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-1">
      {label}
    </p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p
      className={`text-xs font-semibold mt-1 ${
        trend.startsWith("+")
          ? "text-green-600"
          : trend.startsWith("-")
            ? "text-red-600"
            : "text-gray-600"
      }`}
    >
      {trend}
    </p>
  </div>
);

const DataTableRow: React.FC<{
  record: any;
}> = ({ record }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {(record.student?.full_name || record.username || "?").charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {record.student?.full_name || record.username}
          </p>
          <p className="text-xs text-gray-500">
            {record.student?.email || record.username}
          </p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-gray-700">
      {record.student?.student_code || "-"}
    </td>
    <td className="px-6 py-4 text-sm text-gray-700">
      {record.student?.class_name || "-"}
    </td>
    <td className="px-6 py-4">
      <StatusBadge status="active" />
    </td>
    <td className="px-6 py-4 text-right">
      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
        Details
      </button>
    </td>
  </tr>
);

export default function MasterDataPage() {
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  // Fetch students data
  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.getCourseClasses({
          page,
          limit: rowsPerPage,
        });
        // Use course classes which contain student count info
        // For now, we'll show course classes as we need student endpoint
        setStudents(response.data || []);
        setTotal(response.total || 0);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [page, rowsPerPage]);

  // Calculate quick insights from students data
  const quickInsights = [
    {
      label: "Total Students",
      value: total.toString(),
      trend: "+5 this week",
    },
    {
      label: "Active Classes",
      value: students.length.toString(),
      trend: "+2 this month",
    },
    {
      label: "Avg Attendance",
      value: "92%",
      trend: "+3.5% from last month",
    },
  ];

  return (
    <AdminLayout
      topbarTitle="Master Data Management"
      topbarRightAction={<Button variant="primary">+ Add New Record</Button>}
    >
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Master Data Management
        </h1>
        <p className="text-sm text-gray-600">
          Manage and configure all student records and data
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Bulk Import Card */}
        <div className="col-span-2">
          <Card className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Bulk Import Data
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Import student records from CSV or Excel file
                </p>
              </div>
              <a
                href="#"
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Download template
              </a>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 hover:bg-red-50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <Upload size={32} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-600">
                    CSV or Excel file up to 50MB
                  </p>
                </div>
                <Button variant="secondary" size="sm" className="mt-4">
                  Select File
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Insights */}
        <div>
          <Card className="p-6 h-full">
            <h3 className="font-bold text-gray-900 mb-6 text-center">
              Quick Insights
            </h3>
            <div className="space-y-4">
              {quickInsights.map((insight, idx) => (
                <QuickInsightCard key={idx} {...insight} />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Data Table Card */}
      <Card className="p-6">
        {/* Table Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">All Records</h2>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Search records..."
              className="w-64"
            />
            <Button variant="secondary" size="md">
              <Filter size={18} />
              Filter
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Class Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Lecturer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                students.map((record) => (
                  <DataTableRow key={record.id} record={record} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <p className="text-sm text-gray-600">
            Showing {Math.min((page - 1) * rowsPerPage + 1, total)} to{" "}
            {Math.min(page * rowsPerPage, total)} of {total} results
          </p>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * rowsPerPage >= total}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
