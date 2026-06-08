import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { apiClient } from "../utils/apiClient";
import type { CourseClass } from "../types/api";
import {
  MapPin,
  Navigation,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  ExternalLink,
  Radio,
  AlertTriangle,
} from "lucide-react";

// ===================== TYPES =====================

interface GPSFormData {
  latitude: string;
  longitude: string;
  allowed_radius: string;
}

const DAY_LABELS: Record<number, string> = {
  2: "Thứ Hai",
  3: "Thứ Ba",
  4: "Thứ Tư",
  5: "Thứ Năm",
  6: "Thứ Sáu",
  7: "Thứ Bảy",
  8: "Chủ Nhật",
};

// ===================== HELPER =====================

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ===================== MODAL =====================

interface GPSModalProps {
  courseClass: CourseClass;
  onClose: () => void;
  onSave: (id: number, data: Partial<CourseClass>) => Promise<void>;
}

function GPSModal({ courseClass, onClose, onSave }: GPSModalProps) {
  const [form, setForm] = useState<GPSFormData>({
    latitude: courseClass.latitude?.toString() ?? "",
    longitude: courseClass.longitude?.toString() ?? "",
    allowed_radius: courseClass.allowed_radius?.toString() ?? "50",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [previewDist, setPreviewDist] = useState<number | null>(null);

  const subjectName =
    courseClass.subject?.subject_name ?? `Môn #${courseClass.subject_id}`;
  const lecturerName =
    courseClass.lecturer?.full_name ?? `GV #${courseClass.lecturer_id}`;

  // Compute preview distance from TLU default position when both fields filled
  useEffect(() => {
    const lat = parseFloat(form.latitude);
    const lon = parseFloat(form.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      // Distance from TLU main gate as reference
      const dist = haversineDistance(21.0071, 105.8239, lat, lon);
      setPreviewDist(dist);
    } else {
      setPreviewDist(null);
    }
  }, [form.latitude, form.longitude]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  function getDeviceLocation() {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setError("Không lấy được vị trí. Hãy kiểm tra quyền GPS.");
        setLocating(false);
      },
      { enableHighAccuracy: true },
    );
  }

  function clearGPS() {
    setForm({ latitude: "", longitude: "", allowed_radius: "50" });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const lat = form.latitude.trim() ? parseFloat(form.latitude) : undefined;
    const lon = form.longitude.trim() ? parseFloat(form.longitude) : undefined;
    const radius = form.allowed_radius.trim()
      ? parseInt(form.allowed_radius)
      : 50;

    if ((lat !== undefined) !== (lon !== undefined)) {
      setError("Phải nhập cả Latitude lẫn Longitude.");
      return;
    }
    if (lat !== undefined && (lat < -90 || lat > 90)) {
      setError("Latitude phải từ -90 đến 90.");
      return;
    }
    if (lon !== undefined && (lon < -180 || lon > 180)) {
      setError("Longitude phải từ -180 đến 180.");
      return;
    }
    if (isNaN(radius) || radius < 0) {
      setError("Bán kính phải là số nguyên dương.");
      return;
    }

    setSaving(true);
    try {
      await onSave(courseClass.id, {
        latitude: lat ?? (null as any),
        longitude: lon ?? (null as any),
        allowed_radius: radius,
      });
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Lưu thất bại, thử lại.",
      );
    } finally {
      setSaving(false);
    }
  }

  const mapsUrl =
    form.latitude && form.longitude
      ? `https://www.google.com/maps?q=${form.latitude},${form.longitude}`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Cấu Hình GPS</h2>
                <p className="text-blue-100 text-sm">{subjectName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info row */}
          <div className="flex gap-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
            <span className="font-medium text-gray-800">{lecturerName}</span>
            <span>•</span>
            <span>{courseClass.room || "Chưa có phòng"}</span>
            <span>•</span>
            <span>
              {DAY_LABELS[courseClass.day_of_week] ??
                `Thứ ${courseClass.day_of_week}`}
            </span>
          </div>

          {/* GPS coordinates */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Tọa Độ GPS
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Latitude (Vĩ độ)
                </label>
                <input
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="VD: 21.007100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Longitude (Kinh độ)
                </label>
                <input
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="VD: 105.823900"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  inputMode="decimal"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={getDeviceLocation}
                disabled={locating}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                {locating ? "Đang xác định..." : "Dùng vị trí hiện tại"}
              </button>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Xem trên Maps
                </a>
              )}
              {(form.latitude || form.longitude) && (
                <button
                  type="button"
                  onClick={clearGPS}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Xóa GPS
                </button>
              )}
            </div>

            {/* Distance preview */}
            {previewDist !== null && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Cách trung tâm TLU khoảng{" "}
                <strong>
                  {previewDist < 1000
                    ? `${Math.round(previewDist)}m`
                    : `${(previewDist / 1000).toFixed(2)}km`}
                </strong>
              </div>
            )}
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bán Kính Cho Phép (mét)
            </label>
            <div className="flex items-center gap-3">
              <input
                name="allowed_radius"
                value={form.allowed_radius}
                onChange={handleChange}
                type="number"
                min="0"
                max="5000"
                placeholder="50"
                className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                {[30, 50, 75, 100, 150].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        allowed_radius: r.toString(),
                      }))
                    }
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      form.allowed_radius === r.toString()
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {r}m
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Khuyến nghị: 30-50m cho phòng trong nhà, 100-150m cho ngoài trời.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu Cấu Hình"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===================== MAIN PAGE =====================

export default function LocationGPSPage() {
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "configured" | "not_configured"
  >("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedClass, setSelectedClass] = useState<CourseClass | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const LIMIT = 15;

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getCourseClasses({ page, limit: LIMIT });
      setClasses(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  async function handleSaveGPS(id: number, data: Partial<CourseClass>) {
    await apiClient.updateCourseClass(id, data as any);
    await fetchClasses();
    setSuccessMsg("Cấu hình GPS đã được lưu thành công!");
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  // Client-side filter & search
  const filtered = classes.filter((cc) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      cc.subject?.subject_name?.toLowerCase().includes(term) ||
      cc.subject?.subject_code?.toLowerCase().includes(term) ||
      cc.lecturer?.full_name?.toLowerCase().includes(term) ||
      cc.room?.toLowerCase().includes(term);

    const hasGPS = cc.latitude != null && cc.longitude != null;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "configured" && hasGPS) ||
      (filterStatus === "not_configured" && !hasGPS);

    return matchSearch && matchStatus;
  });

  const configuredCount = classes.filter(
    (cc) => cc.latitude != null && cc.longitude != null,
  ).length;
  const totalCount = classes.length;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout
      topbarTitle="Cấu Hình Định Vị GPS"
      showSearch={false}
      topbarRightAction={
        <button
          onClick={fetchClasses}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      }
    >
      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg animate-pulse">
          <CheckCircle className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {/* Modal */}
      {selectedClass && (
        <GPSModal
          courseClass={selectedClass}
          onClose={() => setSelectedClass(null)}
          onSave={handleSaveGPS}
        />
      )}

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cấu Hình Định Vị GPS
            </h1>
            <p className="text-gray-500 text-sm">
              Thiết lập tọa độ GPS và bán kính hợp lệ cho từng lớp học
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Radio className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tổng Lớp Học</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Đã Cấu Hình GPS</p>
              <p className="text-2xl font-bold text-green-700">
                {configuredCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Chưa Cấu Hình</p>
              <p className="text-2xl font-bold text-amber-700">
                {totalCount - configuredCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Tỷ lệ cấu hình GPS</span>
            <span className="font-bold text-blue-600">
              {Math.round((configuredCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(configuredCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo môn học, giảng viên, phòng..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(
            [
              { key: "all", label: "Tất cả" },
              { key: "configured", label: "Đã có GPS" },
              { key: "not_configured", label: "Chưa có GPS" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filterStatus === key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <XCircle className="w-8 h-8" />
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchClasses}
              className="text-blue-600 text-sm underline"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <MapPin className="w-10 h-10 opacity-30" />
            <p>Không tìm thấy lớp học nào.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Lớp Học
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Giảng Viên
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Phòng / Thứ
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Tọa Độ GPS
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Bán Kính
                    </th>
                    <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Trạng Thái
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((cc) => {
                    const hasGPS = cc.latitude != null && cc.longitude != null;
                    const mapsUrl = hasGPS
                      ? `https://www.google.com/maps?q=${cc.latitude},${cc.longitude}`
                      : null;

                    return (
                      <tr
                        key={cc.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Subject */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-800">
                            {cc.subject?.subject_name ??
                              `Môn #${cc.subject_id}`}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {cc.subject?.subject_code ?? `ID: ${cc.id}`}
                          </div>
                        </td>

                        {/* Lecturer */}
                        <td className="px-4 py-4 text-gray-600">
                          {cc.lecturer?.full_name ?? `GV #${cc.lecturer_id}`}
                        </td>

                        {/* Room / Day */}
                        <td className="px-4 py-4">
                          <div className="text-gray-700 font-medium">
                            {cc.room || (
                              <span className="text-gray-300 italic">
                                Chưa có
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {DAY_LABELS[cc.day_of_week] ??
                              `Thứ ${cc.day_of_week}`}{" "}
                            • {cc.lesson_slot}
                          </div>
                        </td>

                        {/* GPS Coordinates */}
                        <td className="px-4 py-4">
                          {hasGPS ? (
                            <div className="space-y-0.5">
                              <div className="text-xs font-mono text-gray-700">
                                {Number(cc.latitude).toFixed(6)}°N
                              </div>
                              <div className="text-xs font-mono text-gray-700">
                                {Number(cc.longitude).toFixed(6)}°E
                              </div>
                              {mapsUrl && (
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Xem Maps
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300 italic">
                              Chưa cấu hình
                            </span>
                          )}
                        </td>

                        {/* Radius */}
                        <td className="px-4 py-4">
                          {hasGPS ? (
                            <div className="flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-sm font-semibold text-blue-700">
                                {cc.allowed_radius ?? 50}m
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs italic">
                              —
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          {hasGPS ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Đã cấu hình
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Chưa có GPS
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedClass(cc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Cấu hình
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Trang {page} / {totalPages} · {total} lớp học
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Trước
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info box */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Hướng dẫn cấu hình GPS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-medium mb-1">1. Xác định tọa độ</p>
            <p className="text-xs text-blue-600">
              Đứng tại giảng đường → Nhấn "Dùng vị trí hiện tại" hoặc tra Google
              Maps rồi nhập thủ công.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">2. Chọn bán kính phù hợp</p>
            <p className="text-xs text-blue-600">
              30-50m cho phòng trong nhà. 100-150m cho khu vực ngoài trời rộng.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">3. Không cấu hình = bỏ qua GPS</p>
            <p className="text-xs text-blue-600">
              Nếu để trống tọa độ, lớp học sẽ không yêu cầu xác minh vị trí khi
              điểm danh.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
