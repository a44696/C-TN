import React from "react";
import { Search, LogOut } from "lucide-react";
import { cn } from "../../utils/cn";
import { apiClient } from "../../utils/apiClient";
import NotificationDropdown from "./NotificationDropdown";

interface TopbarProps {
  title?: string;
  showSearch?: boolean;
  showNotification?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  showSearch = true,
  showNotification = true,
  rightAction,
  className,
}) => {
  const [searchValue, setSearchValue] = React.useState("");

  // If title is provided, show the new header style
  if (title) {
    return (
      <header
        className={cn(
          "fixed top-0 left-64 right-0 h-20 bg-red-900 z-30 flex items-center justify-center px-12",
          className,
        )}
      >
        {/* Full Width Title on Red Background */}
        <h1 className="text-2xl font-bold text-white tracking-wider uppercase">
          TRƯỜNG ĐẠI HỌC THĂNG LONG
        </h1>

        {/* Top Right Actions */}
        <div className="fixed top-4 right-8 flex items-center gap-4 z-40">
          {rightAction && (
            <div className="flex items-center gap-3">{rightAction}</div>
          )}

          {showNotification && <NotificationDropdown />}

          <button
            onClick={() => apiClient.logout()}
            className="p-1.5 text-white hover:text-gray-200 transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
    );
  }

  // Default topbar without title
  return (
    <header
      className={cn(
        "fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-30",
        className,
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-6 flex-1">
        {showSearch && (
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent bg-white text-sm"
            />
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        {rightAction && (
          <div className="flex items-center gap-3">{rightAction}</div>
        )}

        {showNotification && <NotificationDropdown />}

        <button
          onClick={() => apiClient.logout()}
          className="p-1.5 text-gray-600 hover:text-red-600 transition-colors"
          title="Đăng xuất"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
