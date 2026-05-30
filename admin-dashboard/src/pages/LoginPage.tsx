import React, { useState } from "react";
import { Phone } from "lucide-react";
import Input from "../components/common/Input";
import { apiClient } from "../utils/apiClient";
import universityImage from "../assets/anh trường.jpg";
import logo from "../assets/logo.svg";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await apiClient.login({
        username,
        password,
      });

      // Redirect to dashboard on success
      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đăng nhập thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image (55%) */}
      <div
        className="hidden lg:block lg:w-[55%] bg-cover bg-center"
        style={{
          backgroundImage: `url(${universityImage})`,
        }}
      />

      {/* Right Side - Form (45% on desktop, 100% on mobile) */}
      <div className="w-full lg:w-[45%] bg-gray-50 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Content Container */}
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            {/* Logo - Centered */}
            <div className="flex justify-center mb-4">
              <img
                src={logo}
                alt="Thăng Long University"
                className="h-12 lg:h-16"
              />
            </div>
            <h2 className="text-xs lg:text-sm font-semibold text-blue-900 tracking-widest mb-2 uppercase letter-spacing">
              TRƯỜNG ĐẠI HỌC THĂNG LONG
            </h2>
            <h3 className="text-sm lg:text-lg font-semibold text-blue-900 uppercase tracking-wide">
              CỔNG THÔNG TIN ĐÀO TẠO
            </h3>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-xl shadow-2xl p-10 lg:p-12">
            {/* Form Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-red-700 mb-2">
              ĐĂNG NHẬP
            </h1>
            <p className="text-gray-600 text-sm mb-10 font-normal">
              Cổng thông tin đào tạo
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-md text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Main Login Button */}
              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full bg-red-700 hover:bg-red-800 disabled:bg-red-600 text-white font-bold py-3 rounded-md transition duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-xs mt-8 px-4 leading-relaxed">
            <p>
              @Copyright © 2026 Trường Đại Học Thăng Long | All Rights Reserved
              Development
            </p>
          </div>
        </div>

        {/* Floating Contact Button - Bottom Right */}
        <button
          className="fixed bottom-6 right-6 bg-red-700 hover:bg-red-800 text-white rounded-full p-4 shadow-lg transition duration-200 ease-in-out transform hover:scale-110 active:scale-95 z-40"
          aria-label="Contact support"
        >
          <Phone size={24} className="stroke-current" />
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
