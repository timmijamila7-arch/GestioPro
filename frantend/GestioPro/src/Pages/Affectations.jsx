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
/* ─── Modal Show ─── */
const ModalShow = ({ affectation, onClose }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div style={{ background:"#fff", borderRadius:16, padding:28, width:420, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Détail de l'affectation</div>
        <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, fontSize:16, cursor:"pointer", color:"#64748b" }}>×</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {[
          { label:"Employé",    value:`${affectation.employee?.nom ?? ""} ${affectation.employee?.prenom ?? ""}` },
          { label:"Projet",     value: affectation.projet?.nom ?? "—" },
          { label:"Rôle",       value: affectation.role_projet ?? "—" },
          { label:"Date début", value: fmt(affectation.date_debut) },
          { label:"Date fin",   value: fmt(affectation.date_fin) },
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
const ModalModifier = ({ affectation, employees, projets, onClose, onSaved }) => {
  const [form, setForm] = useState({
    employee_id: affectation.employee_id ?? "",
    projet_id:   affectation.projet_id ?? "",
    role_projet: affectation.role_projet ?? "",
    date_debut:  affectation.date_debut?.slice(0,10) ?? "",
    date_fin:    affectation.date_fin?.slice(0,10) ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.date_debut) { setErr("Date début obligatoire."); return; }
    setSaving(true); setErr("");
    try {
      await api.put(`/affectations/${affectation.id}`, form);
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
          <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Modifier l'affectation</div>
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
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Projet *</label>
            <select value={form.projet_id} onChange={e => set("projet_id", e.target.value)} style={inp}>
              {projets.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Rôle *</label>
            <input value={form.role_projet} onChange={e => set("role_projet", e.target.value)} placeholder="Rôle dans le projet" style={inp} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Date début *</label>
              <input type="date" value={form.date_debut} onChange={e => set("date_debut", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Date fin</label>
              <input type="date" value={form.date_fin} onChange={e => set("date_fin", e.target.value)} style={inp} />
            </div>
          </div>
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
  const [showing, setShowing] = useState(null);
const [editing, setEditing] = useState(null);

const deleteAffectation = async (id) => {
  if (!window.confirm("Confirmer la suppression ?")) return;
  try {
    await api.delete(`/affectations/${id}`);
    load();
  } catch (e) {
    alert(e.response?.data?.message ?? "Erreur lors de la suppression.");
  }
};

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
      {showing && <ModalShow affectation={showing} onClose={() => setShowing(null)} />}
{editing && (
  <ModalModifier
    affectation={editing}
    employees={employees}
    projets={projets}
    onClose={() => setEditing(null)}
    onSaved={() => { setEditing(null); load(); }}
  />
)}

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
                  {isAdmin && <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Actions</th>}
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
                    
                    {isAdmin && (
  <td style={{ padding: "12px 16px" }}>
    <div style={{ display:"flex", gap:6 }}>
      <button onClick={() => setShowing(affectation)} style={{ padding:"5px 12px", background:"#f0f4ff", color:"#3b82f6", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
        👁 Voir
      </button>
      <button onClick={() => setEditing(affectation)} style={{ padding:"5px 12px", background:"#fef9c3", color:"#ca8a04", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
        ✏️ Modifier
      </button>
      <button onClick={() => deleteAffectation(affectation.id)} style={{ padding:"5px 12px", background:"#fee2e2", color:"#ef4444", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
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

export default Affectations;
