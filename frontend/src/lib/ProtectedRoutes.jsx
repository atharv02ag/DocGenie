import { Outlet, Navigate } from "react-router-dom";
import { getToken, getUser } from "./session";

const ProtectedRoutes = () => {
  return getToken() && getUser() ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoutes;
