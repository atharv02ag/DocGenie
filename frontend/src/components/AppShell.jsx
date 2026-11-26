import { NavLink, Outlet } from "react-router-dom";
import Wordmark from "./Wordmark";
import UserMenu from "./UserMenu";

export default function AppShell() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Wordmark />
          <nav className="topnav">
            <NavLink to="/Library">Library</NavLink>
            <NavLink to="/Upload">Upload</NavLink>
          </nav>
          <UserMenu />
        </div>
      </header>
      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}
