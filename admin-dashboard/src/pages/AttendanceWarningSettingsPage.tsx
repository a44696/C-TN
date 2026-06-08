import React, { useState, useEffect } from "react";
import { Settings, AlertCircle, RefreshCw } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const AttendanceWarningSettingsPage: React.FC = () => {
  const [thresholds, setThresholds] = useState({
    level1: 10,
    level2: 15,
    level3: 20,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Load current thresholds from API
    // apiClient.getAttendanceWarningPolicy()
  }, []);

  const handleSaveThresholds = async () => {
    // Validate
    if (
      thresholds.level1 <= 0 ||
      thresholds.level2 <= 0 ||
      thresholds.level3 <= 0
    ) {
      setError("Tất cả ngưỡng phải lớn hơn 0");
      return;
    }

    if (
      thresholds.level1 >= thresholds.level2 ||
      thresholds.level2 >= thresholds.level3
    ) {
      setError("Các ngưỡng phải tăng dần: Level 1 < Level 2 < Level 3");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO: Call API to update
      // await apiClient.updateAttendanceWarningPolicy({
      //   level1: thresholds.level1,
      //   level2: thresholds.level2,
      //   level3: thresholds.level3,
      // });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualScan = async () => {
    setIsLoading(true);
    setError("");

    try {
      // TODO: Call API for manual scan
      // await apiClient.triggerAttendanceWarningsScan()
      alert("Đã khởi động quét cảnh báo chuyên cần");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi quét");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout topbarTitle="Cảnh Báo Chuyên Cần">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Cấu Hình Cảnh Báo Chuyên Cần
          </h1>
          <p className="text-gray-600 mt-1">
            Thiết lập ngưỡng cảnh báo tỉ lệ vắng học
          </p>
        </div>

        {/* Warning Info */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900">
                Thông Tin Quan Trọng
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                Hệ thống sẽ tự động quét và cập nhật cảnh báo hàng ngày lúc 1:00
                AM.{" "}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AttendanceWarningSettingsPage;
