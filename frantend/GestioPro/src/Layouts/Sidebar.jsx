import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const icons = {
  employees: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" />
    </svg>
  ),
  absences: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  conges: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  projets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  ),
  affectations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="23" y1="11" x2="17" y2="11" />
      <line x1="20" y1="8" x2="20" y2="14" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const adminNav = [
  { to: "/employees", label: "Employes", icon: icons.employees },
  { to: "/affectations", label: "Affectations", icon: icons.affectations },
  { to: "/absences", label: "Toutes les absences", icon: icons.absences },
  { to: "/conges", label: "Tous les conges", icon: icons.conges },
  { to: "/projets", label: "Projets", icon: icons.projets },
];

const employeeNav = [
  { to: "/absences", label: "Mes absences", icon: icons.absences },
  { to: "/conges", label: "Mes conges", icon: icons.conges },
  { to: "/projets", label: "Mes projets", icon: icons.projets },
];

const navLinkStyle = ({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 16px",
  fontSize: 13,
  textDecoration: "none",
  borderLeft: `2px solid ${isActive ? "#93C5FD" : "transparent"}`,
  background: isActive ? "rgba(59,130,246,0.2)" : "transparent",
  color: isActive ? "#93C5FD" : "rgba(255,255,255,0.6)",
  transition: "all .15s",
});

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const navItems = user?.role === "admin" ? adminNav : employeeNav;
  const sectionLabel = user?.role === "admin" ? "Administration" : "Espace employe";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      style={{
        width: 220,
        minHeight: "100vh",
        background: "#1e3a5f",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
      }}
    >
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "0.5px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "#3b82f6",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" width="17" height="17">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>GestioPro</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".07em" }}>
            Systeme RH
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "10px 0" }}>
        <div
          style={{
            padding: "8px 16px 4px",
            fontSize: 9,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: ".1em",
          }}
        >
          {sectionLabel}
        </div>

        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} style={navLinkStyle}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          padding: "12px 16px",
          borderTop: "0.5px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.name ?? "Utilisateur"}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>
            {user?.role === "admin" ? "Administrateur" : "Employe"}
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Deconnexion"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            padding: 4,
            borderRadius: 6,
            display: "flex",
            transition: "color .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.85)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          {icons.logout}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
