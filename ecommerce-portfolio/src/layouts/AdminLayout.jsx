import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/admin/AdminLayout.css";

import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Mail,
  MessageSquare,
  Settings as SettingsIcon,
  Star,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products & Stock", path: "/admin/products", icon: ShoppingBag },
  { label: "Customer Orders", path: "/admin/orders", icon: Truck },
  { label: "Customer Reviews", path: "/admin/reviews", icon: Star },
  { label: "Product Inquiries", path: "/admin/inquiries", icon: Mail },
  { label: "Contact Messages", path: "/admin/messages", icon: MessageSquare },
  { label: "Store Settings & Policy", path: "/admin/settings", icon: SettingsIcon },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-icon">📦</div>

          <div className="admin-brand-text">
            <h2>EcoStore</h2>
            <span>Store Manager</span>
          </div>

          <button
            type="button"
            className="admin-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-nav-heading">STORE MANAGEMENT</div>

        <nav className="admin-navigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/admin/dashboard"}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <NavLink
            to="/"
            className="admin-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <ExternalLink size={19} />
            <span>View Live Store</span>
          </NavLink>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="admin-topbar-label">ECOSTORE CONTROL PANEL</span>
              <h1>Store Dashboard</h1>
            </div>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>

            <div className="admin-profile-info">
              <strong>{user?.name || "Admin"}</strong>
              <span>{user?.email || "Store Administrator"}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
