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
/* ─── Modal Show ─── */
const ModalShow = ({ absence, onClose }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div style={{ background:"#fff", borderRadius:16, padding:28, width:420, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Détail de l'absence</div>
        <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, fontSize:16, cursor:"pointer", color:"#64748b" }}>×</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {[
          { label:"Employé", value:`${absence.employee?.nom ?? ""} ${absence.employee?.prenom ?? ""}` },
          { label:"Date",    value: fmt(absence.date_absence) },
          { label:"Motif",   value: absence.motif ?? "—" },
          { label:"Statut",  value: absence.justifiee ? "Justifiée" : "Non justifiée" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", background:"#f8fafc", borderRadius:8 }}>
            <span style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>{label}</span>
            <span style={{ fontSize:13, color:"#1e293b", fontWeight:600 }}>{value}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose} style={{ marginTop:20, width:"100%", padding:"9px 0", borderRadius:8, border:"0.5px solid rgba(0,0,0,0.15)", background:"#fff", fontSize:13, cursor:"pointer", color:"#64748b" }}>
        Fermer
      </button>
    </div>
  </div>
);

/* ─── Modal Modifier ─── */
const ModalModifier = ({ absence, employees, onClose, onSaved }) => {
  const [form, setForm] = useState({
    employee_id:  absence.employee_id ?? "",
    date_absence: absence.date_absence?.slice(0,10) ?? "",
    motif:        absence.motif ?? "",
    justifiee:    absence.justifiee ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.date_absence) { setErr("Date obligatoire."); return; }
    setSaving(true); setErr("");
    try {
      await api.put(`/absences/${absence.id}`, form);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message ?? "Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  const inp = { width:"100%", padding:"9px 12px", borderRadius:8, border:"0.5px solid rgba(0,0,0,0.15)", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:460, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Modifier l'absence</div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, fontSize:16, cursor:"pointer", color:"#64748b" }}>×</button>
        </div>

        {err && <div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"9px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Employé *</label>
            <select value={form.employee_id} onChange={e => set("employee_id", e.target.value)} style={inp}>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.nom} {emp.prenom}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Date *</label>
            <input type="date" value={form.date_absence} onChange={e => set("date_absence", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Motif</label>
            <textarea value={form.motif} onChange={e => set("motif", e.target.value)} rows={3} style={{ ...inp, resize:"vertical" }} />
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#475569" }}>
            <input type="checkbox" checked={form.justifiee} onChange={e => set("justifiee", e.target.checked)} />
            Absence justifiée
          </label>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1, padding:"9px 0", borderRadius:8, border:"0.5px solid rgba(0,0,0,0.15)", background:"#fff", fontSize:13, cursor:"pointer", color:"#64748b", fontFamily:"inherit" }}>
            Annuler
          </button>
          <button onClick={submit} disabled={saving} style={{ flex:2, padding:"9px 0", borderRadius:8, border:"none", background: saving ? "#93c5fd" : "#3b82f6", color:"#fff", fontSize:13, fontWeight:600, cursor: saving ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
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
  const [showing, setShowing] = useState(null);
const [editing, setEditing] = useState(null);

const deleteAbsence = async (id) => {
  if (!window.confirm("Confirmer la suppression ?")) return;
  try {
    await api.delete(`/absences/${id}`);
    load();
  } catch (e) {
    alert(e.response?.data?.message ?? "Erreur lors de la suppression.");
  }
};
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
      {showing && <ModalShow absence={showing} onClose={() => setShowing(null)} />}
{editing && (
  <ModalModifier
    absence={editing}
    employees={employees}
    onClose={() => setEditing(null)}
    onSaved={() => { setEditing(null); load(); }}
  />
)}
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
                  {isAdmin && <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Actions</th>}
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
                    {isAdmin && (
  <td style={{ padding: "12px 16px" }}>
    <div style={{ display:"flex", gap:6 }}>
      <button onClick={() => setShowing(absence)} style={{ padding:"5px 12px", background:"#f0f4ff", color:"#3b82f6", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
        👁 Voir
      </button>
      <button onClick={() => setEditing(absence)} style={{ padding:"5px 12px", background:"#fef9c3", color:"#ca8a04", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
        ✏️ Modifier
      </button>
      <button onClick={() => deleteAbsence(absence.id)} style={{ padding:"5px 12px", background:"#fee2e2", color:"#ef4444", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
        🗑 Supprimer
      </button>
    </div>
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
};

export default Absences;
