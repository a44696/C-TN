import React from "react";
import type { ReactNode } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

interface AdminLayoutProps {
  children: ReactNode;
  topbarTitle?: string;
  topbarRightAction?: React.ReactNode;
  showSearch?: boolean;
}

export default function AdminLayout({
  children,
  topbarTitle,
  topbarRightAction,
  showSearch = true,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar
        title={topbarTitle}
        showSearch={showSearch}
        rightAction={topbarRightAction}
      />
      <main className="ml-64 mt-20 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
