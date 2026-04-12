import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRole,
}) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Check role if needed in future
  // const user = localStorage.getItem("user");
  // if (requiredRole && user) {
  //   const userData = JSON.parse(user);
  //   if (userData.role !== requiredRole) {
  //     return <Navigate to="/unauthorized" replace />;
  //   }
  // }

  return element;
};

export default ProtectedRoute;
