import React, { useEffect, useState } from "react";
import InfoRow from "../Components/InfoRow";
import ModalShell from "../Components/ModalShell";
import VerticalActions from "../Components/VerticalActions";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

const fmt = (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-");

const panel = {
  background: "#fff",
  borderRadius: 12,
  border: "0.5px solid rgba(0,0,0,0.1)",
  overflow: "hidden",
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

function AffectationShowModal({ affectation, onClose }) {
  return (
    <ModalShell
      title="Detail de l'affectation"
      width={420}
      onClose={onClose}
      footer={
        <button onClick={onClose} style={{ marginTop: 20, width: "100%", padding: "9px 0", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
          Fermer
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <InfoRow label="Employe" value={`${affectation.employee?.nom ?? ""} ${affectation.employee?.prenom ?? ""}`} />
        <InfoRow label="Projet" value={affectation.projet?.nom ?? "-"} />
        <InfoRow label="Role" value={affectation.role_projet ?? "-"} />
        <InfoRow label="Date debut" value={fmt(affectation.date_debut)} />
        <InfoRow label="Date fin" value={fmt(affectation.date_fin)} />
      </div>
    </ModalShell>
  );
}

function AffectationEditModal({ affectation, employees, projets, onClose, onSaved }) {
  const [form, setForm] = useState({
    employee_id: affectation.employee_id ?? "",
    projet_id: affectation.projet_id ?? "",
    role_projet: affectation.role_projet ?? "",
    date_debut: affectation.date_debut?.slice(0, 10) ?? "",
    date_fin: affectation.date_fin?.slice(0, 10) ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!form.date_debut) {
      setErr("Date debut obligatoire.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      await api.put(`/affectations/${affectation.id}`, form);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message ?? "Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Modifier l'affectation"
      width={460}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
            Annuler
          </button>
          <button onClick={submit} disabled={saving} style={{ flex: 2, padding: "9px 0", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      }
    >
      {err && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 14px", fontSize: 13, marginBottom: 14 }}>{err}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Employe *</label>
          <select value={form.employee_id} onChange={(e) => setField("employee_id", e.target.value)} style={inputStyle}>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.nom} {employee.prenom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Projet *</label>
          <select value={form.projet_id} onChange={(e) => setField("projet_id", e.target.value)} style={inputStyle}>
            {projets.map((projet) => (
              <option key={projet.id} value={projet.id}>
                {projet.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Role *</label>
          <input value={form.role_projet} onChange={(e) => setField("role_projet", e.target.value)} placeholder="Role dans le projet" style={inputStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Date debut *</label>
            <input type="date" value={form.date_debut} onChange={(e) => setField("date_debut", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Date fin</label>
            <input type="date" value={form.date_fin} onChange={(e) => setField("date_fin", e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function Affectations() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projets, setProjets] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [filters, setFilters] = useState({
    date_debut: "",
    date_fin: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showing, setShowing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    employee_id: "",
    projet_id: "",
    date_debut: "",
    date_fin: "",
    role_projet: "",
  });

  const isAdmin = user?.role === "admin";

  const filteredAffectations = affectations.filter((affectation) => {
    const start = affectation.date_debut ? affectation.date_debut.slice(0, 10) : "";
    const end = affectation.date_fin ? affectation.date_fin.slice(0, 10) : "";

    if (filters.date_debut && (!end || end < filters.date_debut)) {
      return false;
    }

    if (filters.date_fin && start && start > filters.date_fin) {
      return false;
    }

    return true;
  });

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [meRes, affectationsRes] = await Promise.all([api.get("/auth/me"), api.get("/affectations")]);
      setUser(meRes.data);
      setAffectations(affectationsRes.data.data ?? []);
    } catch {
      setError("Impossible de charger les affectations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([api.get("/employees"), api.get("/projets")]).then(([employeesRes, projetsRes]) => {
        setEmployees(employeesRes.data.data ?? []);
        setProjets(projetsRes.data.data ?? []);
      });
    }
  }, [isAdmin]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFilterChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const resetFilters = () => {
    setFilters({ date_debut: "", date_fin: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post("/affectations", form);
      setForm({ employee_id: "", projet_id: "", date_debut: "", date_fin: "", role_projet: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible d'enregistrer l'affectation.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAffectation = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;

    try {
      await api.delete(`/affectations/${id}`);
      load();
    } catch (error) {
      alert(error.response?.data?.message ?? "Erreur lors de la suppression.");
    }
  };

  return (
    <div style={{ display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar user={user} />

      {showing && <AffectationShowModal affectation={showing} onClose={() => setShowing(null)} />}
      {editing && <AffectationEditModal affectation={editing} employees={employees} projets={projets} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <div style={{ flex: 1, minHeight: "100vh", background: "#f0f4ff", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "minmax(320px, 380px) 1fr" : "1fr", gap: 20 }}>
          {isAdmin && (
            <div style={{ ...panel, padding: 20, alignSelf: "start" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>Nouvelle affectation</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 18px" }}>Associez un employe a un projet.</p>

              {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <select name="employee_id" value={form.employee_id} onChange={handleChange} style={inputStyle} required>
                  <option value="">Choisir un employe</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.nom} {employee.prenom}
                    </option>
                  ))}
                </select>
                <select name="projet_id" value={form.projet_id} onChange={handleChange} style={inputStyle} required>
                  <option value="">Choisir un projet</option>
                  {projets.map((projet) => (
                    <option key={projet.id} value={projet.id}>
                      {projet.nom}
                    </option>
                  ))}
                </select>
                <input name="role_projet" value={form.role_projet} onChange={handleChange} placeholder="Role dans le projet" style={inputStyle} required />
                <input name="date_debut" type="date" value={form.date_debut} onChange={handleChange} style={inputStyle} required />
                <input name="date_fin" type="date" value={form.date_fin} onChange={handleChange} style={inputStyle} />
                <button type="submit" disabled={saving} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Enregistrement..." : "Affecter"}
                </button>
              </form>
            </div>
          )}

          <div style={panel}>
            <div style={{ padding: 20, borderBottom: "0.5px solid #e2e8f0" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>{isAdmin ? "Toutes les affectations" : "Mes affectations"}</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>{filteredAffectations.length} affectation(s)</p>
            </div>

            <div style={{ padding: 20, borderBottom: "0.5px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Du</label>
                <input type="date" name="date_debut" value={filters.date_debut} onChange={handleFilterChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Au</label>
                <input type="date" name="date_fin" value={filters.date_fin} onChange={handleFilterChange} style={inputStyle} />
              </div>
              <button
                type="button"
                onClick={resetFilters}
                style={{ padding: "10px 14px", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", color: "#475569", fontSize: 13, cursor: "pointer" }}
              >
                Reinitialiser
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Projet</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Employe</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Role</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Periode</th>
                  {isAdmin && <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Chargement...</td>
                  </tr>
                )}

                {!loading && filteredAffectations.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>
                      {affectations.length === 0 ? "Aucune affectation disponible." : "Aucune affectation pour cette periode."}
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredAffectations.map((affectation) => (
                    <tr key={affectation.id} style={{ borderTop: "0.5px solid #eef2f7" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{affectation.projet?.nom}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{affectation.employee?.nom} {affectation.employee?.prenom}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{affectation.role_projet || "-"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmt(affectation.date_debut)} - {fmt(affectation.date_fin)}</td>
                      {isAdmin && (
                        <td style={{ padding: "12px 16px" }}>
                          <VerticalActions onView={() => setShowing(affectation)} onEdit={() => setEditing(affectation)} onDelete={() => deleteAffectation(affectation.id)} />
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Affectations;
