import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoRow from "../Components/InfoRow";
import ModalShell from "../Components/ModalShell";
import VerticalActions from "../Components/VerticalActions";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

const statusMap = {
  actif: { bg: "#dbeafe", txt: "#1d4ed8", label: "Actif" },
  conge: { bg: "#fef9c3", txt: "#854d0e", label: "Conge" },
  absent: { bg: "#fee2e2", txt: "#991b1b", label: "Absent" },
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.15)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function Badge({ value }) {
  const status = statusMap[value] ?? { bg: "#f1f5f9", txt: "#475569", label: value };

  return (
    <span
      style={{
        background: status.bg,
        color: status.txt,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
      }}
    >
      {status.label}
    </span>
  );
}

function EmployeeShowModal({ employee, onClose }) {
  const [details, setDetails] = useState(employee);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    let active = true;

    setDetails(employee);
    setLoadingDetails(true);

    api
      .get(`/employees/${employee.id}`)
      .then((res) => {
        if (active) setDetails(res.data.data ?? employee);
      })
      .catch(() => {
        if (active) setDetails(employee);
      })
      .finally(() => {
        if (active) setLoadingDetails(false);
      });

    return () => {
      active = false;
    };
  }, [employee]);

  const projets = details.affectations?.filter((affectation) => affectation.projet) ?? [];

  return (
    <ModalShell
      title="Detail de l'employe"
      width={520}
      onClose={onClose}
      footer={
        <button onClick={onClose} style={{ marginTop: 20, width: "100%", padding: "9px 0", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
          Fermer
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <InfoRow label="Nom" value={`${details.nom ?? ""} ${details.prenom ?? ""}`.trim()} />
        <InfoRow label="Email" value={details.user?.email ?? "-"} />
        <InfoRow label="Poste" value={details.poste ?? "-"} />
        <InfoRow label="Departement" value={details.departement ?? "-"} />
        <InfoRow label="Telephone" value={details.telephone ?? "-"} />
        <InfoRow label="Statut" value={statusMap[details.statut]?.label ?? details.statut} />
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
          Projets affectes
        </div>

        {loadingDetails ? (
          <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 13, color: "#94a3b8" }}>Chargement...</div>
        ) : projets.length === 0 ? (
          <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 13, color: "#94a3b8" }}>Aucun projet affecte.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {projets.map((affectation) => (
              <div key={affectation.id} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{affectation.projet.nom}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                  {affectation.role_projet ?? "Aucun role"}
                  {affectation.date_debut ? ` · ${new Date(affectation.date_debut).toLocaleDateString("fr-FR")}` : ""}
                  {affectation.date_fin ? ` -> ${new Date(affectation.date_fin).toLocaleDateString("fr-FR")}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function EmployeeEditModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: employee.nom ?? "",
    prenom: employee.prenom ?? "",
    email: employee.user?.email ?? "",
    poste: employee.poste ?? "",
    departement: employee.departement ?? "",
    telephone: employee.telephone ?? "",
    statut: employee.statut ?? "actif",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!form.nom || !form.prenom) {
      setErr("Nom et prenom obligatoires.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      await api.put(`/employees/${employee.id}`, form);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message ?? "Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Modifier l'employe"
      width={460}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b", fontFamily: "inherit" }}>
            Annuler
          </button>
          <button onClick={submit} disabled={saving} style={{ flex: 2, padding: "9px 0", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      }
    >
      {err && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 14px", fontSize: 13, marginBottom: 14 }}>{err}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Nom *</label>
            <input value={form.nom} onChange={(e) => setField("nom", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Prenom *</label>
            <input value={form.prenom} onChange={(e) => setField("prenom", e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Email</label>
          <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Poste</label>
          <input value={form.poste} onChange={(e) => setField("poste", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Departement</label>
          <input value={form.departement} onChange={(e) => setField("departement", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Telephone</label>
          <input value={form.telephone} onChange={(e) => setField("telephone", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Statut</label>
          <select value={form.statut} onChange={(e) => setField("statut", e.target.value)} style={inputStyle}>
            {Object.entries(statusMap).map(([value, status]) => (
              <option key={value} value={value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ModalShell>
  );
}

function Employees() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showing, setShowing] = useState(null);
  const [editing, setEditing] = useState(null);

  const navigate = useNavigate();

  const loadEmployees = () => {
    api
      .get("/employees")
      .then((res) => setEmployees(res.data.data ?? []))
      .catch(() => setError("Impossible de charger les employes."))
      .finally(() => setLoading(false));
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;

    try {
      await api.delete(`/employees/${id}`);
      setEmployees((current) => current.filter((employee) => employee.id !== id));
    } catch (e) {
      alert(e.response?.data?.message ?? "Erreur lors de la suppression.");
    }
  };

  useEffect(() => {
    api.get("/auth/me").then((res) => setUser(res.data)).catch(console.log);
    loadEmployees();
  }, []);

  const filtered = employees.filter((employee) => {
    const query = search.toLowerCase();

    return (
      `${employee.nom} ${employee.prenom}`.toLowerCase().includes(query) ||
      (employee.poste ?? "").toLowerCase().includes(query) ||
      (employee.user?.email ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar user={user} />

      {showing && <EmployeeShowModal employee={showing} onClose={() => setShowing(null)} />}
      {editing && (
        <EmployeeEditModal
          employee={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setLoading(true);
            loadEmployees();
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0, background: "#f0f4ff", minHeight: "100vh", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", margin: 0 }}>Employes</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>{employees.length} enregistres</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "6px 12px" }}>
              <input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", width: 180 }}
              />
            </div>

            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/create")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                Ajouter
              </button>
            )}
          </div>
        </div>

        {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Employe", "Poste", "Departement", "Telephone", "Statut", ...(user?.role === "admin" ? ["Actions"] : [])].map((header) => (
                  <th key={header} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 500, color: "#94a3b8", textAlign: "left", textTransform: "uppercase" }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={user?.role === "admin" ? 6 : 5} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    Chargement...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={user?.role === "admin" ? 6 : 5} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    Aucun employe trouve
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((employee) => (
                  <tr key={employee.id} style={{ borderBottom: "0.5px solid #eee" }}>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                          {`${employee.nom?.[0] ?? ""}${employee.prenom?.[0] ?? ""}`.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{employee.nom} {employee.prenom}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{employee.user?.email ?? "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: 13 }}>{employee.poste ?? "-"}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13 }}>{employee.departement ?? "-"}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13 }}>{employee.telephone ?? "-"}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <Badge value={employee.statut} />
                    </td>
                    {user?.role === "admin" && (
                      <td style={{ padding: "11px 16px" }}>
                        <VerticalActions onView={() => setShowing(employee)} onEdit={() => setEditing(employee)} onDelete={() => deleteEmployee(employee.id)} />
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          <div style={{ padding: "10px 16px", borderTop: "0.5px solid #eee", fontSize: 11, color: "#94a3b8" }}>
            {filtered.length} / {employees.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Employees;
