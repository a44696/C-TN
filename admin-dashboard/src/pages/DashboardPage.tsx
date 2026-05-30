import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  Newspaper,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { apiClient } from "../utils/apiClient";

const StatCardComponent: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  badge?: string;
}> = ({ icon, label, value, subtitle, badge }) => (
  <Card className="p-5 hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-3">
      <div className="w-11 h-11 bg-red-50 rounded-md flex items-center justify-center text-red-600">
        {icon}
      </div>
      {badge && (
        <Badge variant="error" className="text-xs px-2 py-1">
          {badge}
        </Badge>
      )}
    </div>
    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
      {label}
    </p>
    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>
  </Card>
);

const ActivityItem: React.FC<{
  activity: {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    avatar: string;
  };
}> = ({ activity }) => (
  <div className="py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-xs font-semibold text-red-600 flex-shrink-0">
        {activity.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 line-clamp-2">{activity.message}</p>
        <p className="text-xs text-gray-500 mt-0.5">{activity.timestamp}</p>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const [chartType, setChartType] = React.useState<"weekly" | "monthly">(
    "weekly",
  );
  const [dashboardStats, setDashboardStats] = React.useState<
    Array<{
      icon: string;
      label: string;
      value: string;
      subtitle: string;
      badge?: string;
    }>
  >([]);
  const [attendanceTrendsData, setAttendanceTrendsData] = React.useState<
    Array<{ name: string; value: number }>
  >([]);
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all data in parallel
        const [stats, trends, activities] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getAttendanceTrends(chartType),
          apiClient.getRecentActivities(),
        ]);

        // Format stats for display
        const formattedStats = [
          {
            icon: "Users",
            label: "Tổng Số Sinh Viên",
            value: stats.totalStudents.toLocaleString(),
            subtitle: `${stats.totalStudents > 0 ? "+5 mới tuần này" : "Sinh viên đang học"}`,
          },
          {
            icon: "BookOpen",
            label: "Các Lớp Đang Hoạt Động",
            value: stats.activeClasses.toString(),
            subtitle: "Tất cả đang chạy suôn sẻ",
          },
          {
            icon: "TrendingUp",
            label: "Tỉ Lệ Điểm Danh",
            value: `${stats.attendanceRate.toFixed(1)}%`,
            subtitle: `${stats.attendanceRate >= 90 ? "+2.1% so với tuần trước" : "-1.5% so với tuần trước"}`,
            badge: stats.attendanceRate < 85 ? "KHẨN CẤP" : undefined,
          },
          {
            icon: "Clock",
            label: "Yêu Cầu Đang Chờ",
            value: stats.pendingRequests.toString(),
            subtitle: `${Math.max(0, stats.pendingRequests - 1)} cần sự chú ý khẩn cấp`,
          },
        ];

        setDashboardStats(formattedStats);
        setAttendanceTrendsData(trends);
        setRecentActivities(activities);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Lỗi khi tải dữ liệu dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [chartType]);

  const iconMap: Record<string, React.ReactNode> = {
    Users: <Users size={20} />,
    BookOpen: <BookOpen size={20} />,
    TrendingUp: <TrendingUp size={20} />,
    Clock: <Clock size={20} />,
  };

  return (
    <AdminLayout topbarTitle="Bảng Điều Khiển">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-5 bg-gray-100 rounded-lg animate-pulse h-32"
              />
            ))
          : dashboardStats.map((stat, idx) => (
              <StatCardComponent
                key={idx}
                icon={iconMap[stat.icon] || <Clock size={20} />}
                label={stat.label}
                value={stat.value}
                subtitle={stat.subtitle}
                badge={stat.badge}
              />
            ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Attendance Trends Chart */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Xu Hướng Điểm Danh
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tổng quan hàng tuần
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType("weekly")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    chartType === "weekly"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => setChartType("monthly")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    chartType === "monthly"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Tháng
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={attendanceTrendsData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f3f4f6"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#dc2626"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activities */}
        <div>
          <Card className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Hoạt Động Gần Đây
              </h2>
              <Link
                to="/recent-activities"
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Xem Tất Cả
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              {recentActivities.slice(0, 3).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            <button className="mt-2 text-xs text-gray-600 hover:text-gray-900 font-medium w-full py-2 border-t border-gray-100 pt-4">
              Xóa Nhật Ký
            </button>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Create News Card */}
        <div
          onClick={() => navigate("/news/create")}
          className="cursor-pointer"
        >
          <Card className="p-6 bg-gradient-to-br from-blue-900 to-blue-800 border-0 text-white hover:shadow-lg transition-shadow h-full">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-md flex items-center justify-center">
                    <Newspaper size={20} />
                  </div>
                </div>
                <h3 className="text-base font-bold mb-2">Tạo Tin Tức</h3>
                <p className="text-sm text-blue-200 mb-5 line-clamp-2">
                  Tạo và gửi tin tức cho sinh viên
                </p>
                <Button variant="primary" size="md">
                  Tạo Ngay
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Faculty Health Score */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex-shrink-0 flex items-center justify-center text-green-600">
              <Award size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Điểm Sức Khỏe Giảng Viên
              </h3>
              <div className="mb-3">
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-gray-900">8.4</p>
                  <p className="text-sm text-gray-600">/10</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: "84%" }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-gray-600">Điểm danh chung xuất sắc</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
