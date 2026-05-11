// Global types and interfaces

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface StatCard {
  icon: string;
  label: string;
  value: string;
  subtitle: string;
  badge?: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

export interface AlertLevel {
  level: number;
  name: string;
  color: string;
  percentage: number;
}

export interface StudentRisk {
  id: string;
  name: string;
  studentId: string;
  department: string;
  absencePercentage: number;
  riskLevel: "low" | "medium" | "high";
}

// NewsItem moved to api.ts
export type { NewsItem } from "./api";

export interface MasterDataRecord {
  id: string;
  name: string;
  email: string;
  studentId: string;
  class: string;
  status: "active" | "inactive" | "pending";
  avatar?: string;
}

export interface ChartData {
  name: string;
  value: number;
}
