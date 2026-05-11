import React from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  FileText,
  Award,
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
import {
  dashboardStats,
  attendanceTrendsData,
  recentActivities,
} from "../mocks/dashboard.mock";

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
  activity: (typeof recentActivities)[number];
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
  const [chartType, setChartType] = React.useState<"weekly" | "monthly">(
    "weekly",
  );

  const iconMap: Record<string, React.ReactNode> = {
    Users: <Users size={20} />,
    BookOpen: <BookOpen size={20} />,
    TrendingUp: <TrendingUp size={20} />,
    Clock: <Clock size={20} />,
  };

  return (
    <AdminLayout topbarTitle="Phân Tích">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {dashboardStats.map((stat, idx) => (
          <StatCardComponent
            key={idx}
            icon={iconMap[stat.icon]}
            label={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
            badge={stat.badge}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Attendance Trends Chart */}
        <div className="col-span-2">
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
              <a
                href="#"
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Xem Tất Cả
              </a>
            </div>
            <div className="flex-1 overflow-y-auto">
              {recentActivities.slice(0, 5).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            <button className="mt-4 text-xs text-gray-600 hover:text-gray-900 font-medium w-full py-2 border-t border-gray-100 pt-4">
              Xóa Nhật Ký
            </button>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Generate Report Card */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-md flex items-center justify-center">
                  <FileText size={20} />
                </div>
              </div>
              <h3 className="text-base font-bold mb-2">Tạo Báo Cáo</h3>
              <p className="text-sm text-slate-300 mb-5 line-clamp-2">
                Tạo báo cáo điểm danh và hiệu suất toàn diện
              </p>
              <Button variant="primary" size="md">
                Tạo Ngay
              </Button>
            </div>
          </div>
        </Card>

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
