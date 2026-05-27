import { Link, useLocation } from "react-router-dom";
import { getRole } from "../services/auth";

function AdminNavbar() {
  const location = useLocation();

  const rawRole = getRole();
  const role = rawRole
    ? rawRole.toString().toLowerCase().split(".").pop()
    : null;

  if (role !== "admin") return null;

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "⬛" },
    { to: "/manage", label: "Manage Events", icon: "🗂" },
    { to: "/scanner", label: "Scan QR", icon: "📱" },
    { to: "/scan-history", label: "History", icon: "📋" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .admin-navbar {
          height: 60px;
          background: rgba(5,8,24,0.97);
          display: flex;
          align-items: center;
          padding: 0 32px;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 200;
          border-bottom: 1px solid rgba(139,92,246,0.12);
          backdrop-filter: blur(20px);
          font-family: 'DM Sans', sans-serif;
        }

        .admin-navbar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #7c3aed, #818cf8, #7c3aed, transparent);
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          color: #f8fafc;
          margin-right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-logo-mark {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          box-shadow: 0 0 14px rgba(109,40,217,0.4);
        }

        .admin-navbar a {
          color: #94a3b8;
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          padding: 6px 14px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid transparent;
        }

        .admin-navbar a:hover {
          color: #c4b5fd;
          background: rgba(139,92,246,0.08);
          border-color: rgba(139,92,246,0.15);
        }

        .admin-navbar a.active {
          color: #818cf8;
          background: rgba(129,140,248,0.1);
          border-color: rgba(129,140,248,0.2);
          font-weight: 500;
        }

        .nav-icon { font-size: 13px; }
      `}</style>

      <div className="admin-navbar">
        <div className="nav-left">
          <div className="nav-logo">
            <span className="nav-logo-mark">⚡</span>
            Symposium OS
          </div>
          {links.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={location.pathname === to ? "active" : ""}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default AdminNavbar;
