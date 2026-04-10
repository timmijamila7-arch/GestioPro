import React, { useEffect, useState } from "react";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

const fmt = (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "—");

const cardStyle = {
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

const Absences = () => {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    employee_id: "",
    date_absence: "",
    motif: "",
    justifiee: false,
  });

  const isAdmin = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [meRes, absencesRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/absences"),
      ]);

      setUser(meRes.data);
      setAbsences(absencesRes.data.data ?? []);
    } catch {
      setError("Impossible de charger les absences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      api.get("/employees").then((res) => setEmployees(res.data.data ?? []));
    }
  }, [isAdmin]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post("/absences", {
        employee_id: form.employee_id,
        date_absence: form.date_absence,
        motif: form.motif,
        justifiee: form.justifiee,
      });

      setForm({
        employee_id: "",
        date_absence: "",
        motif: "",
        justifiee: false,
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible d'enregistrer l'absence.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar user={user} />

      <div style={{ flex: 1, minHeight: "100vh", background: "#f0f4ff", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "minmax(300px, 380px) 1fr" : "1fr", gap: 20 }}>
          {isAdmin && (
            <div style={{ ...cardStyle, padding: 20, alignSelf: "start" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>Nouvelle absence</h2>
    

              {error && (
                <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: 12 }}>
                  <select name="employee_id" value={form.employee_id} onChange={handleChange} style={inputStyle} required>
                    <option value="">Choisir un employé</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.nom} {employee.prenom}
                      </option>
                    ))}
                  </select>

                  <input name="date_absence" type="date" value={form.date_absence} onChange={handleChange} style={inputStyle} required />
                  <textarea name="motif" value={form.motif} onChange={handleChange} placeholder="Motif" rows={4} style={{ ...inputStyle, resize: "vertical" }} required />

                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
                    <input name="justifiee" type="checkbox" checked={form.justifiee} onChange={handleChange} />
                    Absence justifiée
                  </label>

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
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={cardStyle}>
            <div style={{ padding: 20, borderBottom: "0.5px solid #e2e8f0" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>
                {isAdmin ? "Toutes les absences" : "Mes absences"}
              </h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
                {absences.length} absence(s) enregistrée(s)
              </p>
            </div>

            {!isAdmin && (
              <div style={{ margin: 16, marginBottom: 0, background: "#eff6ff", color: "#1d4ed8", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                Les absences sont déclarées par l'administrateur. Cette page est en lecture seule pour l'employé.
              </div>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {isAdmin && <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Employé</th>}
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Date</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Motif</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>
                      Chargement...
                    </td>
                  </tr>
                )}

                {!loading && absences.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>
                      Aucune absence pour le moment.
                    </td>
                  </tr>
                )}

                {!loading && absences.map((absence) => (
                  <tr key={absence.id} style={{ borderTop: "0.5px solid #eef2f7" }}>
                    {isAdmin && <td style={{ padding: "12px 16px", fontSize: 13 }}>{absence.employee?.nom} {absence.employee?.prenom}</td>}
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmt(absence.date_absence)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{absence.motif}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <span style={{
                        background: absence.justifiee ? "#dcfce7" : "#fee2e2",
                        color: absence.justifiee ? "#166534" : "#991b1b",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {absence.justifiee ? "Justifiée" : "Non justifiée"}
                      </span>
                    </td>
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

export default Absences;
