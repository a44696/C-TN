import React, { useState, useEffect } from "react";
import { Plus, Upload, Trash2, Edit2 } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import DataTable from "../components/common/DataTable";
import FormModal, { type FormField } from "../components/common/FormModal";
import { apiClient } from "../utils/apiClient";
import { StatusBadge } from "../components/common/Badge";

type UserType = "user" | "student" | "lecturer";

const UsersManagementPage: React.FC = () => {
  const [userType, setUserType] = useState<UserType>("user");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const limit = 10;

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      let data: any[] = [];
      let totalCount = 0;

      if (userType === "user") {
        const response = await apiClient.getAllUsers({ page, limit });
        data = response;
        totalCount = response.length;
      } else if (userType === "student") {
        const response = await apiClient.getStudents({ page, limit });
        data = response;
        totalCount = response.length;
      } else if (userType === "lecturer") {
        const response = await apiClient.getLecturers({ page, limit });
        data = response;
        totalCount = response.length;
      }

      setUsers(data);
      setTotal(totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [userType]);

  useEffect(() => {
    fetchUsers();
  }, [page, userType]);

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();

    if (userType === "user") {
      return (
        user.username?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    } else if (userType === "student") {
      return (
        user.student_code?.toLowerCase().includes(query) ||
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.class_name?.toLowerCase().includes(query)
      );
    } else if (userType === "lecturer") {
      return (
        user.lecturer_code?.toLowerCase().includes(query) ||
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: any) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      if (userType === "user") {
        alert(
          "Không thể xóa người dùng hệ thống. Vui lòng xóa thông qua danh sách sinh viên hoặc giảng viên.",
        );
        return;
      } else if (userType === "student") {
        await apiClient.deleteStudent(userId.student_code);
      } else if (userType === "lecturer") {
        await apiClient.deleteLecturer(userId.lecturer_code);
      }
      await fetchUsers();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi xóa";
      alert(errorMsg);
    }
  };

  const handleSaveUser = async (formData: Record<string, unknown>) => {
    try {
      if (userType === "user") {
        if (selectedUser) {
          await apiClient.updateUser(selectedUser.id, {
            username: formData.username as string,
            role: formData.role as "ADMIN" | "LECTURER" | "STUDENT",
          });
        } else {
          await apiClient.createUser({
            username: formData.username as string,
            password: formData.password as string,
            role: formData.role as "ADMIN" | "LECTURER" | "STUDENT",
          });
        }
      } else if (userType === "student") {
        // Convert dob from YYYY-MM-DD to ISO 8601 format
        const studentData = { ...formData };
        if (studentData.dob && typeof studentData.dob === "string") {
          // Format: YYYY-MM-DD to YYYY-MM-DDTHH:mm:ss.sssZ
          const dobDate = new Date(studentData.dob);
          studentData.dob = dobDate.toISOString();
        }

        if (selectedUser) {
          await apiClient.updateStudent(selectedUser.student_code, studentData);
        } else {
          await apiClient.createStudent(studentData);
        }
      } else if (userType === "lecturer") {
        if (selectedUser) {
          await apiClient.updateLecturer(selectedUser.lecturer_code, formData);
        } else {
          await apiClient.createLecturer(formData as any);
        }
      }

      setIsModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Lỗi khi lưu");
    }
  };

  const getFormFields = (): FormField[] => {
    if (userType === "user") {
      return [
        {
          name: "username",
          label: "Tên người dùng",
          type: "text",
          required: true,
          defaultValue: selectedUser?.username || "",
        },
        {
          name: "password",
          label: "Mật khẩu",
          type: "password",
          required: !selectedUser,
          defaultValue: "",
        },
        {
          name: "role",
          label: "Vai trò",
          type: "select",
          required: true,
          options: [
            { value: "ADMIN", label: "Quản trị viên" },
            { value: "LECTURER", label: "Giáo viên" },
            { value: "STUDENT", label: "Sinh viên" },
          ],
          defaultValue: selectedUser?.role || "STUDENT",
        },
      ];
    } else if (userType === "student") {
      return [
        {
          name: "student_code",
          label: "Mã sinh viên",
          type: "text",
          required: !selectedUser,
          disabled: !!selectedUser,
          defaultValue: selectedUser?.student_code || "",
        },
        {
          name: "full_name",
          label: "Họ và tên",
          type: "text",
          required: true,
          defaultValue: selectedUser?.full_name || "",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          defaultValue: selectedUser?.email || "",
        },
        {
          name: "dob",
          label: "Ngày sinh",
          type: "text",
          required: true,
          placeholder: "YYYY-MM-DD",
          defaultValue: selectedUser?.dob ? selectedUser.dob.split("T")[0] : "",
        },
        {
          name: "gender",
          label: "Giới tính",
          type: "select",
          required: true,
          options: [
            { value: "MALE", label: "Nam" },
            { value: "FEMALE", label: "Nữ" },
            { value: "OTHER", label: "Khác" },
          ],
          defaultValue: selectedUser?.gender || "",
        },
        {
          name: "phone_number",
          label: "Số điện thoại",
          type: "text",
          defaultValue: selectedUser?.phone_number || "",
        },
        {
          name: "address",
          label: "Địa chỉ",
          type: "text",
          defaultValue: selectedUser?.address || "",
        },
        {
          name: "class_name",
          label: "Lớp",
          type: "text",
          defaultValue: selectedUser?.class_name || "",
        },
        {
          name: "major_name",
          label: "Ngành học",
          type: "text",
          defaultValue: selectedUser?.major_name || "",
        },
        {
          name: "department_name",
          label: "Bộ phận",
          type: "text",
          defaultValue: selectedUser?.department_name || "",
        },
      ];
    } else if (userType === "lecturer") {
      return [
        {
          name: "lecturer_code",
          label: "Mã giáo viên",
          type: "text",
          required: !selectedUser,
          disabled: !!selectedUser,
          defaultValue: selectedUser?.lecturer_code || "",
        },
        {
          name: "full_name",
          label: "Họ và tên",
          type: "text",
          required: true,
          defaultValue: selectedUser?.full_name || "",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          defaultValue: selectedUser?.email || "",
        },
        {
          name: "phone_number",
          label: "Số điện thoại",
          type: "text",
          defaultValue: selectedUser?.phone_number || "",
        },
        {
          name: "department",
          label: "Bộ phận",
          type: "text",
          required: true,
          defaultValue: selectedUser?.department || "",
        },
        {
          name: "degree",
          label: "Bằng cấp",
          type: "select",
          required: true,
          options: [
            { value: "BACHELOR", label: "Cử nhân" },
            { value: "MASTER", label: "Thạc sĩ" },
            { value: "PHD", label: "Tiến sĩ" },
          ],
          defaultValue: selectedUser?.degree || "",
        },
      ];
    }
    return [];
  };

  const getTableColumns = () => {
    if (userType === "user") {
      return [
        {
          key: "username",
          label: "Tên người dùng",
          width: "40%",
        },
        {
          key: "role",
          label: "Vai trò",
          width: "30%",
          render: (value: unknown) => (
            <StatusBadge
              status={
                value === "ADMIN"
                  ? ("active" as any)
                  : value === "LECTURER"
                    ? ("pending" as any)
                    : ("inactive" as any)
              }
            >
              {String(value)}
            </StatusBadge>
          ),
        },
        {
          key: "actions",
          label: "Thao tác",
          width: "30%",
          render: (_: unknown, record: any) => (
            <div className="flex gap-2">
              <button
                onClick={() => handleEditUser(record)}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <Edit2 size={18} />
              </button>
            </div>
          ),
        },
      ];
    } else if (userType === "student") {
      return [
        {
          key: "student_code",
          label: "Mã sinh viên",
          width: "15%",
        },
        {
          key: "full_name",
          label: "Họ tên",
          width: "25%",
        },
        {
          key: "email",
          label: "Email",
          width: "25%",
        },
        {
          key: "class_name",
          label: "Lớp",
          width: "15%",
        },
        {
          key: "actions",
          label: "Thao tác",
          width: "20%",
          render: (_: unknown, record: any) => (
            <div className="flex gap-2">
              <button
                onClick={() => handleEditUser(record)}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDeleteUser(record)}
                className="text-red-600 hover:text-red-800 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ),
        },
      ];
    } else if (userType === "lecturer") {
      return [
        {
          key: "lecturer_code",
          label: "Mã giáo viên",
          width: "15%",
        },
        {
          key: "full_name",
          label: "Họ tên",
          width: "25%",
        },
        {
          key: "email",
          label: "Email",
          width: "25%",
        },
        {
          key: "department",
          label: "Bộ phận",
          width: "15%",
        },
        {
          key: "actions",
          label: "Thao tác",
          width: "20%",
          render: (_: unknown, record: any) => (
            <div className="flex gap-2">
              <button
                onClick={() => handleEditUser(record)}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDeleteUser(record)}
                className="text-red-600 hover:text-red-800 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ),
        },
      ];
    }
    return [];
  };

  return (
    <AdminLayout topbarTitle="Quản Lý Người Dùng">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản Lý Người Dùng
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý tài khoản người dùng, sinh viên và giáo viên
          </p>
        </div>

        {/* Tabs */}
        <Card className="p-4 flex gap-4 border-b">
          {(["user", "student", "lecturer"] as UserType[]).map((type) => (
            <button
              key={type}
              onClick={() => setUserType(type)}
              className={`px-4 py-2 font-medium transition ${
                userType === type
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {type === "user"
                ? "Người Dùng"
                : type === "student"
                  ? "Sinh Viên"
                  : "Giáo Viên"}
            </button>
          ))}
        </Card>

        {/* Controls */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddUser} className="flex items-center gap-2">
            <Plus size={18} />
            Thêm Mới
          </Button>
          {userType === "student" && (
            <Button
              variant="secondary"
              onClick={() => {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = ".xlsx,.xls";
                fileInput.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  try {
                    await apiClient.uploadStudentsExcel(file);
                    await fetchUsers();
                    alert("Import thành công!");
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Lỗi import");
                  }
                };
                fileInput.click();
              }}
              className="flex items-center gap-2"
            >
              <Upload size={18} />
              Import Excel
            </Button>
          )}
          {userType === "lecturer" && (
            <Button
              variant="secondary"
              onClick={() => {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = ".xlsx,.xls";
                fileInput.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  try {
                    await apiClient.uploadLecturersExcel(file);
                    await fetchUsers();
                    alert("Import thành công!");
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Lỗi import");
                  }
                };
                fileInput.click();
              }}
              className="flex items-center gap-2"
            >
              <Upload size={18} />
              Import Excel
            </Button>
          )}
        </div>

        {/* Data Table */}
        <Card>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          <DataTable
            data={filteredUsers}
            columns={getTableColumns()}
            isLoading={isLoading}
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
            }}
          />
        </Card>

        {/* Form Modal */}
        <FormModal
          isOpen={isModalOpen}
          title={selectedUser ? "Chỉnh Sửa" : "Thêm Mới"}
          fields={getFormFields()}
          onSubmit={handleSaveUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default UsersManagementPage;
