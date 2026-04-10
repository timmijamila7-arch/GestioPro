import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

const statusMap = {
  actif:  { bg: "#dbeafe", txt: "#1d4ed8", label: "Actif" },
  conge:  { bg: "#fef9c3", txt: "#854d0e", label: "Congé" },
  absent: { bg: "#fee2e2", txt: "#991b1b", label: "Absent" },
};

const Badge = ({ value }) => {
  const s = statusMap[value] ?? { bg: "#f1f5f9", txt: "#475569", label: value };
  return (
    <span style={{
      background: s.bg, color: s.txt,
      padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 500,
    }}>
      {s.label}
    </span>
  );
};

const Employees = () => {
  const [user, setUser]             = useState(null);
  const [employees, setEmployees]   = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError]           = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/me")
      .then(res => setUser(res.data))
      .catch(console.log)
      .finally(() => setLoadingUser(false));

    api.get("/employees")
      .then(res => setEmployees(res.data.data ?? []))
      .catch(() => setError("Impossible de charger les employés."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (
      `${e.nom} ${e.prenom}`.toLowerCase().includes(q) ||
      (e.poste ?? "").toLowerCase().includes(q) ||
      (e.email ?? "").toLowerCase().includes(q)
    );
  });

  if (loadingUser) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#f0f4ff",
        flexDirection: "column", gap: 12,
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid #e2e8f0",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin .8s linear infinite",
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>

      <Sidebar user={user} />

      <div style={{
        flex: 1, minWidth: 0,
        background: "#f0f4ff",
        minHeight: "100vh",
        padding: 24,
      }}>

        {/* HEADER */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16, gap: 12,
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              Employés
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>
              {employees.length} enregistrés
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "#fff",
              border: "0.5px solid rgba(0,0,0,0.12)",
              borderRadius: 8, padding: "6px 12px",
            }}>
              <input
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  border: "none", outline: "none",
                  fontSize: 13, background: "transparent", width: 180,
                }}
              />
            </div>

            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/create")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px",
                  background: "#3b82f6", color: "#fff",
                  border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}
              >
                Ajouter
              </button>
            )}
          </div>
        </div>

        {/* error banner */}
        {error && (
          <div style={{
            background: "#fee2e2", color: "#991b1b",
            borderRadius: 8, padding: "9px 14px",
            fontSize: 13, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* TABLE */}
        <div style={{
          background: "#fff",
          border: "0.5px solid rgba(0,0,0,0.1)",
          borderRadius: 12, overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Employé","Poste","Département","Téléphone","Statut"].map(h => (
                  <th key={h} style={{
                    padding: "10px 16px", fontSize: 11,
                    fontWeight: 500, color: "#94a3b8",
                    textAlign: "left", textTransform: "uppercase",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    Chargement...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    Aucun employé trouvé
                  </td>
                </tr>
              )}

              {!loading && filtered.map(e => (
                <tr key={e.id} style={{ borderBottom: "0.5px solid #eee" }}>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "#dbeafe", color: "#1d4ed8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 600,
                      }}>
                        {`${e.nom?.[0] ?? ""}${e.prenom?.[0] ?? ""}`.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {e.nom} {e.prenom}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {e.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13 }}>{e.poste ?? "—"}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13 }}>{e.departement ?? "—"}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13 }}>{e.telephone ?? "—"}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <Badge value={e.statut} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            padding: "10px 16px",
            borderTop: "0.5px solid #eee",
            fontSize: 11, color: "#94a3b8",
          }}>
            {filtered.length} / {employees.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;