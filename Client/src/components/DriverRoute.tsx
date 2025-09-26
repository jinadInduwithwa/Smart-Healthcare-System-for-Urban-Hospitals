import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface DriverRouteProps {
  children: React.ReactNode;
}

const DriverRoute: React.FC<DriverRouteProps> = ({ children }) => {
  console.log("DriverRoute component rendered");
  const { user } = useAuth();
  console.log("Current user in DriverRoute:", user);

  if (!user) {
    console.log("No user found, redirecting to signin");
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== "DELIVERY") {
    console.log("User role is not DELIVERY, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("User is authorized, rendering children");
  return <>{children}</>;
};

export default DriverRoute;
