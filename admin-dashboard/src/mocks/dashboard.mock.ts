import type { StatCard, ActivityItem, ChartData } from "../types";

export const dashboardStats: StatCard[] = [
  {
    icon: "Users",
    label: "Tổng Số Sinh Viên",
    value: "2,543",
    subtitle: "+12 mới tuần này",
  },
  {
    icon: "BookOpen",
    label: "Các Lớp Đang Hoạt Động",
    value: "24",
    subtitle: "Tất cả đang chạy suôn sẻ",
  },
  {
    icon: "TrendingUp",
    label: "Tỉ Lệ Điểm Danh",
    value: "94.2%",
    subtitle: "+2.1% so với tuần trước",
    badge: "KHẨN CẤP",
  },
  {
    icon: "Clock",
    label: "Yêu Cầu Đang Chờ",
    value: "18",
    subtitle: "4 cần sự chú ý khẩn cấp",
  },
];

export const attendanceTrendsData: ChartData[] = [
  { name: "T2", value: 88 },
  { name: "T3", value: 92 },
  { name: "T4", value: 89 },
  { name: "T5", value: 95 },
  { name: "T6", value: 91 },
  { name: "T7", value: 87 },
  { name: "CN", value: 84 },
];

export const recentActivities: ActivityItem[] = [
  {
    id: "1",
    type: "attendance",
    message: "Quét điểm danh hệ thống hoàn tất",
    timestamp: "5 phút trước",
    avatar: "QD",
  },
  {
    id: "2",
    type: "alert",
    message: "Cảnh báo: 3 sinh viên được đánh dấu vắng mặt",
    timestamp: "15 phút trước",
    avatar: "CB",
  },
  {
    id: "3",
    type: "news",
    message: "Thông báo mới được công bố",
    timestamp: "2 giờ trước",
    avatar: "TB",
  },
  {
    id: "4",
    type: "system",
    message: "Sao lưu cơ sở dữ liệu hoàn tất",
    timestamp: "4 giờ trước",
    avatar: "SL",
  },
  {
    id: "5",
    type: "config",
    message: "Cấu hình điểm danh được cập nhật",
    timestamp: "1 ngày trước",
    avatar: "CF",
  },
];
