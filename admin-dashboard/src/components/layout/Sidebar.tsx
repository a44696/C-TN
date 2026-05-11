import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  Newspaper,
  Database,
  Settings,
  FileText,
  ClipboardList,
  Bell,
  AlertTriangle,
  BookOpen,
  Calendar,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useNotifications } from "../../hooks/useNotifications";

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
        "fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40",
        !isOpen && "-translate-x-full",
      )}
    >
      {/* Logo Section */}
      <div className="h-20 px-6 flex items-center justify-start border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">Quản Lý</span>
            <span className="text-xs text-slate-400">Hệ Thống</span>
          </div>
        </div>
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
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50",
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
      <div className="border-t border-slate-700 px-3 py-4 space-y-3">
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
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50",
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

        {/* User Profile Card */}
        <div className="bg-slate-700/40 rounded-lg p-3 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
              AD
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-semibold text-white">Quản Lý</span>
              <span className="text-xs text-slate-400">Quản Trị Hệ Thống</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
