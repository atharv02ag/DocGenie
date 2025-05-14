import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = ()=>{
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("access_token");
    return (savedToken && savedUser) ? (<Outlet />) : (<Navigate to="/"/>);
}

export default ProtectedRoutes;