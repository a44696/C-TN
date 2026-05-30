import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Lock,
  Loader,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import { apiClient } from "../utils/apiClient";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import type { User } from "../types/api";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError("");

      // Get user from localStorage or fetch from API
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        const currentUser = await apiClient.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải thông tin người dùng",
      );
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordForm.currentPassword.trim()) {
      setError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!passwordForm.newPassword.trim()) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Call backend API to change password
      await apiClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setSuccessMessage("Mật khẩu được cập nhật thành công!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Lỗi khi cập nhật mật khẩu (kiểm tra mật khẩu hiện tại)",
      );
      console.error("Failed to change password:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <AdminLayout topbarTitle="Cài Đặt">
        <div className="flex justify-center items-center h-96">
          <Loader className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout topbarTitle="Cài Đặt">
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ {successMessage}
          </div>
        )}

        {/* Profile Section */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thông Tin Tài Khoản
          </h2>

          <div className="flex flex-col items-center mb-8">
            {/* Avatar Display */}
            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg mb-6">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon size={48} />
              )}
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {user?.username || "Admin"}
              </h3>
              <p className="text-gray-600 mt-1">{user?.email || "N/A"}</p>
              <p className="text-sm text-gray-500 mt-3">
                Vai trò:{" "}
                <span className="font-semibold text-gray-700">
                  {user?.role || "Admin"}
                </span>
              </p>
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Tên Đăng Nhập
              </label>
              <input
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full mt-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full mt-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Vai Trò
              </label>
              <input
                type="text"
                value={user?.role || ""}
                disabled
                className="w-full mt-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Change Password Section */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Lock size={24} className="text-red-600" />
              Bảo Mật
            </h2>
            {!showChangePassword && (
              <Button
                onClick={() => setShowChangePassword(true)}
                variant="secondary"
              >
                Đổi Mật Khẩu
              </Button>
            )}
          </div>

          {showChangePassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật Khẩu Hiện Tại
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật Khẩu Mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Xác Nhận Mật Khẩu Mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-semibold mb-2">Yêu cầu mật khẩu:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ít nhất 6 ký tự</li>
                  <li>Mật khẩu mới và xác nhận phải khớp</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập Nhật Mật Khẩu"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setError("");
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          ) : (
            <div></div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
