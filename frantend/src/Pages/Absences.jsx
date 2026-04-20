import React, { useEffect, useState } from "react";
import InfoRow from "../Components/InfoRow";
import ModalShell from "../Components/ModalShell";
import VerticalActions from "../Components/VerticalActions";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

const fmt = (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-");
const apiBaseUrl = api.defaults.baseURL?.replace(/\/api\/?$/, "") ?? "http://localhost:8000";
const fileUrl = (path) => (path ? `${apiBaseUrl}/storage/${path}` : null);
const fileName = (path) => (path ? path.split("/").pop() : "Aucun fichier");

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
  fontFamily: "inherit",
};

function FileLink({ path, label = "Ouvrir" }) {
  if (!path) {
    return <span style={{ color: "#94a3b8" }}>Aucun</span>;
  }

  return (
    <a href={fileUrl(path)} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
      {label}
    </a>
  );
}

function AbsenceShowModal({ absence, onClose }) {
  return (
    <ModalShell
      title="Detail de l'absence"
      width={460}
      onClose={onClose}
      footer={
        <button onClick={onClose} style={{ marginTop: 20, width: "100%", padding: "9px 0", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
          Fermer
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <InfoRow label="Employe" value={`${absence.employee?.nom ?? ""} ${absence.employee?.prenom ?? ""}`.trim() || "-"} />
        <InfoRow label="Date" value={fmt(absence.date_absence)} />
        <InfoRow label="Statut" value={absence.justifiee ? "Justifiee" : "Non justifiee"} />
        <InfoRow label="Declaree par" value={absence.enregistrePar?.name ?? "-"} />
        <InfoRow label="Justificatif" value={<FileLink path={absence.fichier_justification} label="Voir le fichier" />} />
      </div>
    </ModalShell>
  );
}

function AbsenceEditModal({ absence, employees, onClose, onSaved }) {
  const [form, setForm] = useState({
    employee_id: absence.employee_id ?? "",
    date_absence: absence.date_absence?.slice(0, 10) ?? "",
    justifiee: absence.justifiee ?? false,
    fichier_justification: null,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!form.date_absence) {
      setErr("Date obligatoire.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const payload = new FormData();
      payload.append("employee_id", form.employee_id);
      payload.append("date_absence", form.date_absence);
      payload.append("justifiee", form.justifiee ? "1" : "0");
      payload.append("_method", "PUT");

      if (form.fichier_justification) {
        payload.append("fichier_justification", form.fichier_justification);
      }

      await api.post(`/absences/${absence.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message ?? "Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Modifier l'absence"
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
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Date *</label>
          <input type="date" value={form.date_absence} onChange={(e) => setField("date_absence", e.target.value)} style={inputStyle} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
          <input type="checkbox" checked={form.justifiee} onChange={(e) => setField("justifiee", e.target.checked)} />
          Absence justifiee
        </label>

        {form.justifiee && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Fichier justificatif</label>
            {absence.fichier_justification && (
              <div style={{ marginBottom: 8 }}>
                <a href={fileUrl(absence.fichier_justification)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none" }}>
                  Fichier actuel : {fileName(absence.fichier_justification)}
                </a>
              </div>
            )}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setField("fichier_justification", e.target.files?.[0] ?? null)} style={inputStyle} />
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function Absences() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    employee_id: "",
    date_absence: "",
    justifiee: false,
    fichier_justification: null,
  });
  const [showing, setShowing] = useState(null);
  const [editing, setEditing] = useState(null);

  const isAdmin = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [meRes, absencesRes] = await Promise.all([api.get("/auth/me"), api.get("/absences")]);
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

  const deleteAbsence = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;

    try {
      await api.delete(`/absences/${id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.message ?? "Erreur lors de la suppression.");
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : type === "file" ? files?.[0] ?? null : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("employee_id", form.employee_id);
      payload.append("date_absence", form.date_absence);
      payload.append("justifiee", form.justifiee ? "1" : "0");

      if (form.fichier_justification) {
        payload.append("fichier_justification", form.fichier_justification);
      }

      await api.post("/absences", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm({ employee_id: "", date_absence: "", justifiee: false, fichier_justification: null });
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

      {showing && <AbsenceShowModal absence={showing} onClose={() => setShowing(null)} />}
      {editing && (
        <AbsenceEditModal
          absence={editing}
          employees={employees}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      <div style={{ flex: 1, minHeight: "100vh", background: "#f0f4ff", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "minmax(320px, 400px) 1fr" : "1fr", gap: 20 }}>
          {isAdmin && (
            <div style={{ ...cardStyle, padding: 20, alignSelf: "start" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>Nouvelle absence</h2>

              {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginTop: 14, marginBottom: 14 }}>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                  <select name="employee_id" value={form.employee_id} onChange={handleChange} style={inputStyle} required>
                    <option value="">Choisir un employe</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.nom} {employee.prenom}
                      </option>
                    ))}
                  </select>

                  <input name="date_absence" type="date" value={form.date_absence} onChange={handleChange} style={inputStyle} required />

                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
                    <input name="justifiee" type="checkbox" checked={form.justifiee} onChange={handleChange} />
                    Absence justifiee
                  </label>

                  {form.justifiee && (
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>Fichier justificatif</label>
                      <input name="fichier_justification" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} style={inputStyle} />
                    </div>
                  )}

                  <button type="submit" disabled={saving} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={cardStyle}>
            <div style={{ padding: 20, borderBottom: "0.5px solid #e2e8f0" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>{isAdmin ? "Toutes les absences" : "Mes absences"}</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>{absences.length} absence(s) enregistree(s)</p>
            </div>

            {!isAdmin && (
              <div style={{ margin: 16, marginBottom: 0, background: "#eff6ff", color: "#1d4ed8", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                Les absences sont declarees par l&apos;administrateur. Cette page est en lecture seule pour l&apos;employe.
              </div>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {isAdmin && <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Employe</th>}
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Date</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Statut</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Justificatif</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Declaree par</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Chargement...</td>
                  </tr>
                )}

                {!loading && absences.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Aucune absence pour le moment.</td>
                  </tr>
                )}

                {!loading &&
                  absences.map((absence) => (
                    <tr key={absence.id} style={{ borderTop: "0.5px solid #eef2f7" }}>
                      {isAdmin && <td style={{ padding: "12px 16px", fontSize: 13 }}>{absence.employee?.nom} {absence.employee?.prenom}</td>}
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmt(absence.date_absence)}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>
                        <span style={{ background: absence.justifiee ? "#dcfce7" : "#fee2e2", color: absence.justifiee ? "#166534" : "#991b1b", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>
                          {absence.justifiee ? "Justifiee" : "Non justifiee"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}><FileLink path={absence.fichier_justification} /></td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{absence.enregistrePar?.name ?? "-"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <VerticalActions onView={() => setShowing(absence)} onEdit={isAdmin ? () => setEditing(absence) : null} onDelete={isAdmin ? () => deleteAbsence(absence.id) : null} />
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
}

export default Absences;
