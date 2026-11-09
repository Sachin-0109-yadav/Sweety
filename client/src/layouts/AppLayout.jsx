
import {
  Activity,
  Droplets,
  HeartPulse,
  LogOut,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <div className="app-brand-icon">
            <HeartPulse size={25} />
          </div>
          <span>Sweety</span>
        </div>

        <p className="app-sidebar-label">WORKSPACE</p>

        <nav className="app-sidebar-navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `app-nav-link${isActive ? " active" : ""}`
            }
          >
            <Activity size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/readings"
            className={({ isActive }) =>
              `app-nav-link${isActive ? " active" : ""}`
            }
          >
            <Droplets size={19} />
            <span>Glucose readings</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `app-nav-link${isActive ? " active" : ""}`
            }
          >
            <TrendingUp size={19} />
            <span>Health reports</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `app-nav-link${isActive ? " active" : ""}`
            }
          >
            <UserRound size={19} />
            <span>Profile & Settings</span>
          </NavLink>
        </nav>

        <div className="app-sidebar-bottom">
          <div className="app-user-profile">
            <div className="app-user-avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="app-user-details">
              <strong>{user?.name || "User"}</strong>
              <span>Personal account</span>
            </div>
          </div>

          <button
            className="app-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="app-layout-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
