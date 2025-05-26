import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = ()=>{
    const savedToken = localStorage.getItem("session");
    const savedUser = localStorage.getItem("user");
    return (savedToken && savedUser) ? (<Outlet />) : (<Navigate to="/"/>);
}

export default ProtectedRoutes;