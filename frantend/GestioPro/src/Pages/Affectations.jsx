import React, { useEffect, useState } from "react";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

const fmt = (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "—");

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
};

const Affectations = () => {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projets, setProjets] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    employee_id: "",
    projet_id: "",
    date_debut: "",
    date_fin: "",
    role_projet: "",
  });

  const isAdmin = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [meRes, affectationsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/affectations"),
      ]);

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
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post("/affectations", form);
      setForm({
        employee_id: "",
        projet_id: "",
        date_debut: "",
        date_fin: "",
        role_projet: "",
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible d'enregistrer l'affectation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar user={user} />

      <div style={{ flex: 1, minHeight: "100vh", background: "#f0f4ff", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "minmax(320px, 380px) 1fr" : "1fr", gap: 20 }}>
          {isAdmin && (
            <div style={{ ...panel, padding: 20, alignSelf: "start" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>Nouvelle affectation</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 18px" }}>
                Associez un employé à un projet.
              </p>

              {error && (
                <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <select name="employee_id" value={form.employee_id} onChange={handleChange} style={inputStyle} required>
                  <option value="">Choisir un employé</option>
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

                <input name="role_projet" value={form.role_projet} onChange={handleChange} placeholder="Rôle dans le projet" style={inputStyle} required />
                <input name="date_debut" type="date" value={form.date_debut} onChange={handleChange} style={inputStyle} required />
                <input name="date_fin" type="date" value={form.date_fin} onChange={handleChange} style={inputStyle} />

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: saving ? "#93c5fd" : "#3b82f6",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Enregistrement..." : "Affecter"}
                </button>
              </form>
            </div>
          )}

          <div style={panel}>
            <div style={{ padding: 20, borderBottom: "0.5px solid #e2e8f0" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>
                {isAdmin ? "Toutes les affectations" : "Mes affectations"}
              </h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
                {affectations.length} affectation(s)
              </p>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Projet</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Employé</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Rôle</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Période</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Chargement...</td>
                  </tr>
                )}

                {!loading && affectations.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Aucune affectation disponible.</td>
                  </tr>
                )}

                {!loading && affectations.map((affectation) => (
                  <tr key={affectation.id} style={{ borderTop: "0.5px solid #eef2f7" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{affectation.projet?.nom}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{affectation.employee?.nom} {affectation.employee?.prenom}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{affectation.role_projet || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmt(affectation.date_debut)} - {fmt(affectation.date_fin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affectations;
