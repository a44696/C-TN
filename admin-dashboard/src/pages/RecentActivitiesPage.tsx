import React, { useEffect } from "react";
import { ArrowLeft, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import { apiClient } from "../utils/apiClient";

const ActivityItem: React.FC<{
  activity: {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    avatar: string;
  };
}> = ({ activity }) => (
  <div className="py-4 border-b border-gray-100 last:border-b-0">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-sm font-semibold text-red-600 flex-shrink-0">
        {activity.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
      </div>
    </div>
  </div>
);

export default function RecentActivitiesPage() {
  const [recentActivities, setRecentActivities] = React.useState<
    Array<{
      id: string;
      type: string;
      message: string;
      timestamp: string;
      avatar: string;
    }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const activities = await apiClient.getRecentActivities();
      setRecentActivities(activities);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải hoạt động gần đây",
      );
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout topbarTitle="Hoạt Động Gần Đây">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Quay Lại
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Hoạt Động Gần Đây
          </h1>
          <p className="text-gray-600 mt-2">
            Tất cả hoạt động đã được ghi nhận trong hệ thống
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <Card className="p-12 flex justify-center">
            <Loader className="w-8 h-8 animate-spin text-red-600" />
          </Card>
        ) : recentActivities.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Không có hoạt động nào</p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-0">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
              Tổng cộng {recentActivities.length} hoạt động
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
