import React, { useState, useEffect } from "react";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import DataTable from "../components/common/DataTable";
import FormModal, { type FormField } from "../components/common/FormModal";
import { apiClient } from "../utils/apiClient";
import type { ServiceRequest } from "../types/api";

const ServiceRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<1 | 2 | 3 | 4 | undefined>();

  const limit = 10;

  const fetchRequests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.getServiceRequests({
        page,
        limit,
        status: statusFilter as any,
      });
      setRequests(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (data: Record<string, unknown>) => {
    if (!selectedRequest) return;
    try {
      await apiClient.updateServiceRequestStatus(selectedRequest.id, {
        status: parseInt(data.status as string) as 1 | 2 | 3 | 4,
        note: data.note as string,
      });
      setIsModalOpen(false);
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  };

  const statusOptions = [
    { value: "1", label: "Đang chờ" },
    { value: "2", label: "Đang xử lý" },
    { value: "3", label: "Hoàn thành" },
    { value: "4", label: "Từ chối" },
  ];

  const statusIcons = {
    1: <Clock size={16} className="text-yellow-600" />,
    2: <Clock size={16} className="text-blue-600" />,
    3: <CheckCircle size={16} className="text-green-600" />,
    4: <XCircle size={16} className="text-red-600" />,
  };

  const statusLabels = {
    1: "Đang chờ",
    2: "Đang xử lý",
    3: "Hoàn thành",
    4: "Từ chối",
  };

  const formFields: FormField[] = [
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      required: true,
      options: statusOptions,
    },
    {
      name: "note",
      label: "Ghi chú",
      type: "textarea",
      placeholder: "Nhập ghi chú...",
    },
  ];

  const columns = [
    {
      key: "id" as const,
      label: "Mã sinh viên",
      render: (value: unknown, row: ServiceRequest) =>
        row.student?.student_code || "-",
    },
    {
      key: "id" as const,
      label: "Tên sinh viên",
      render: (value: unknown, row: ServiceRequest) =>
        row.student?.full_name || "-",
    },
    {
      key: "id" as const,
      label: "Loại tài liệu",
      render: (value: unknown, row: ServiceRequest) =>
        row.documentType?.document_name || "-",
    },
    { key: "reason" as const, label: "Lý do", className: "max-w-xs truncate" },
    {
      key: "status" as const,
      label: "Trạng thái",
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          {statusIcons[value as keyof typeof statusIcons]}
          {statusLabels[value as keyof typeof statusLabels]}
        </div>
      ),
    },
    {
      key: "created_at" as const,
      label: "Ngày tạo",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Yêu Cầu Dịch Vụ</h1>

        <Card className="p-4">
          <div className="flex gap-2">
            <Button
              variant={statusFilter === undefined ? "primary" : "secondary"}
              onClick={() => setStatusFilter(undefined)}
              size="sm"
            >
              Tất cả
            </Button>
            <Button
              variant={statusFilter === 1 ? "primary" : "secondary"}
              onClick={() => setStatusFilter(1)}
              size="sm"
            >
              Đang chờ
            </Button>
            <Button
              variant={statusFilter === 2 ? "primary" : "secondary"}
              onClick={() => setStatusFilter(2)}
              size="sm"
            >
              Đang xử lý
            </Button>
            <Button
              variant={statusFilter === 3 ? "primary" : "secondary"}
              onClick={() => setStatusFilter(3)}
              size="sm"
            >
              Hoàn thành
            </Button>
            <Button
              variant={statusFilter === 4 ? "primary" : "secondary"}
              onClick={() => setStatusFilter(4)}
              size="sm"
            >
              Từ chối
            </Button>
          </div>
        </Card>

        <Card>
          <DataTable<ServiceRequest>
            data={requests}
            columns={columns}
            isLoading={isLoading}
            error={error}
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
            }}
            actions={(row) => (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedRequest(row);
                  setIsModalOpen(true);
                }}
              >
                Xử lý
              </Button>
            )}
          />
        </Card>
      </div>

      <FormModal
        isOpen={isModalOpen}
        title="Xử lý yêu cầu dịch vụ"
        fields={formFields}
        initialData={
          selectedRequest
            ? {
                status: selectedRequest.status.toString(),
              }
            : {}
        }
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleUpdateStatus}
      />
    </AdminLayout>
  );
};

export default ServiceRequestsPage;
