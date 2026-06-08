import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Newspaper,
  Database,
  Settings,
  FileText,
  ClipboardList,
  BookOpen,
  MessageCircle,
  Users,
  Upload,
  TrendingUp,
  AlertCircle,
  Library,
  Fingerprint,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useNotifications } from "../../hooks/useNotifications";
import logo from "../../assets/logo.svg";

interface SidebarProps {
  isOpen?: boolean;
}

const navItems = [
  {
    id: "dashboard",
    label: "Bảng Điều Khiển",
    href: "/",
    icon: BarChart3,
  },
  {
    id: "master-data",
    label: "Dữ Liệu Chính",
    href: "/master-data-enhanced",
    icon: Database,
  },
  {
    id: "users",
    label: "Quản Lý Người Dùng",
    href: "/users",
    icon: Users,
  },
  {
    id: "import",
    label: "Import Dữ Liệu",
    href: "/import",
    icon: Upload,
  },
  {
    id: "attendance-statistics",
    label: "Thống Kê Chuyên Cần",
    href: "/attendance-statistics",
    icon: TrendingUp,
  },
  {
    id: "knowledge-base",
    label: "Kho AI Content",
    href: "/knowledge-base",
    icon: Library,
  },
  {
    id: "attendance-warnings",
    label: "Cảnh Báo Cần",
    href: "/attendance-warnings",
    icon: AlertCircle,
  },
  {
    id: "faceid-management",
    label: "Quản Lý FaceID",
    href: "/faceid-management",
    icon: Fingerprint,
  },

  {
    id: "document-types",
    label: "Loại Tài Liệu",
    href: "/document-types",
    icon: FileText,
  },
  {
    id: "service-requests",
    label: "Yêu Cầu Dịch Vụ",
    href: "/service-requests",
    icon: ClipboardList,
  },
  {
    id: "grades",
    label: "Điểm Số",
    href: "/grades",
    icon: BookOpen,
  },
  {
    id: "news",
    label: "Tin Tức",
    href: "/news",
    icon: Newspaper,
  },
  {
    id: "chat",
    label: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    id: "settings",
    label: "Cài Đặt",
    href: "/settings",
    icon: Settings,
    isBottom: true,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    return location.pathname.startsWith(href) && href !== "/";
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen w-64 bg-white text-slate-900 transition-all duration-300 z-40 border-r border-gray-200",
        !isOpen && "-translate-x-full",
      )}
    >
      {/* Logo Section */}
      <div className="h-20 px-6 flex items-center justify-start border-b border-gray-300">
        <img src={logo} alt="Thăng Long University" className="h-12 w-auto" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6">
        <div className="space-y-1">
          {navItems
            .filter((item) => !item.isBottom)
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasNotification =
                item.id === "service-requests" && unreadCount > 0;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-150 text-sm font-medium relative group",
                    active
                      ? "bg-red-600 text-white"
                      : "text-slate-700 hover:text-slate-900 hover:bg-gray-100",
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {hasNotification && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-300 px-3 py-4 space-y-3">
        {/* Settings */}
        {navItems
          .filter((item) => item.isBottom)
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-150 text-sm font-medium",
                  active
                    ? "bg-red-600 text-white"
                    : "text-slate-700 hover:text-slate-900 hover:bg-gray-100",
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

        {/* User Profile Card */}
      </div>
    </aside>
  );
};

export default Sidebar;
