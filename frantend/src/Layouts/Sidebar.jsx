import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

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
  padding: "10px 16px",
  fontSize: 13,
  textDecoration: "none",
  borderLeft: `3px solid ${isActive ? "#6e95c1" : "transparent"}`,
  background: isActive ? "rgba(111, 149, 193, 0.16)" : "transparent",
  color: isActive ? "#eef5fc" : "rgba(255,255,255,0.72)",
  transition: "all .15s",
});

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const isLoaded = Boolean(user);
  const navItems = !isLoaded ? [] : user.role === "admin" ? adminNav : employeeNav;
  const sectionLabel = !isLoaded ? "Chargement" : user.role === "admin" ? "Administration" : "Espace employe";

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
        background: "linear-gradient(180deg, #6d8bae 0%, #627f9f 46%, #58738f 100%)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
      }}
    >
      <div
        style={{
          padding: "18px 16px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <img
          src={logo}
          alt="GestioPro logo"
          style={{
            width: 138,
            maxWidth: "100%",
            display: "block",
            margin: "0 auto",
            filter: "drop-shadow(0 6px 14px rgba(55, 77, 102, 0.14))",
          }}
        />
      </div>

      <nav style={{ flex: 1, padding: "10px 0" }}>
        <div
          style={{
            padding: "8px 16px 4px",
            fontSize: 9,
            color: "rgba(245,248,252,0.64)",
            textTransform: "uppercase",
            letterSpacing: ".1em",
          }}
        >
          {sectionLabel}
        </div>

        {!isLoaded &&
          [1, 2, 3].map((item) => (
            <div
              key={item}
              style={{
                margin: "6px 16px",
                height: 35,
                borderRadius: 8,
                background: "rgba(255,255,255,0.14)",
              }}
            />
          ))}

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
          borderTop: "1px solid rgba(255,255,255,0.18)",
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
            background: "#6f95c1",
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
              color: "rgba(255,255,255,0.96)",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.name ?? "Chargement..."}
          </div>
          <div style={{ fontSize: 10, color: "rgba(245,248,252,0.7)" }}>
            {!isLoaded ? "Veuillez patienter" : user.role === "admin" ? "Administrateur" : "Employe"}
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
          onMouseEnter={(event) => {
            event.currentTarget.style.color = "rgba(255,255,255,0.85)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          {icons.logout}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
