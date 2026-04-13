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
/* ─── Modal Show ─── */
const ModalShow = ({ employee, onClose }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div style={{ background:"#fff", borderRadius:16, padding:28, width:440, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Détail de l'employé</div>
        <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, fontSize:16, cursor:"pointer", color:"#64748b" }}>×</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {[
          { label:"Nom",         value:`${employee.nom ?? ""} ${employee.prenom ?? ""}` },
          { label:"Email",       value: employee.email ?? "—" },
          { label:"Poste",       value: employee.poste ?? "—" },
          { label:"Département", value: employee.departement ?? "—" },
          { label:"Téléphone",   value: employee.telephone ?? "—" },
          { label:"Statut",      value: statusMap[employee.statut]?.label ?? employee.statut },
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
const ModalModifier = ({ employee, onClose, onSaved }) => {
  const [form, setForm] = useState({
    nom:         employee.nom ?? "",
    prenom:      employee.prenom ?? "",
    email:       employee.email ?? "",
    poste:       employee.poste ?? "",
    departement: employee.departement ?? "",
    telephone:   employee.telephone ?? "",
    statut:      employee.statut ?? "actif",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.nom || !form.prenom) { setErr("Nom et prénom obligatoires."); return; }
    setSaving(true); setErr("");
    try {
      await api.put(`/employees/${employee.id}`, form);
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
          <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Modifier l'employé</div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, fontSize:16, cursor:"pointer", color:"#64748b" }}>×</button>
        </div>

        {err && <div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"9px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Nom *</label>
              <input value={form.nom} onChange={e => set("nom", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Prénom *</label>
              <input value={form.prenom} onChange={e => set("prenom", e.target.value)} style={inp} />
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Email</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Poste</label>
            <input value={form.poste} onChange={e => set("poste", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Département</label>
            <input value={form.departement} onChange={e => set("departement", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Téléphone</label>
            <input value={form.telephone} onChange={e => set("telephone", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Statut</label>
            <select value={form.statut} onChange={e => set("statut", e.target.value)} style={inp}>
              {Object.entries(statusMap).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
            </select>
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

const Employees = () => {
  const [user, setUser]             = useState(null);
  const [employees, setEmployees]   = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError]           = useState("");

  const navigate = useNavigate();
  const [showing, setShowing] = useState(null);
const [editing, setEditing] = useState(null);

const deleteEmployee = async (id) => {
  if (!window.confirm("Confirmer la suppression ?")) return;
  try {
    await api.delete(`/employees/${id}`);
    setEmployees(prev => prev.filter(e => e.id !== id));
  } catch (e) {
    alert(e.response?.data?.message ?? "Erreur lors de la suppression.");
  }
};

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
      {showing && <ModalShow employee={showing} onClose={() => setShowing(null)} />}
{editing && (
  <ModalModifier
    employee={editing}
    onClose={() => setEditing(null)}
    onSaved={() => { setEditing(null); api.get("/employees").then(r => setEmployees(r.data.data ?? [])); }}
  />
)}

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
                {["Employé","Poste","Département","Téléphone","Statut", ...(user?.role === "admin" ? ["Actions"] : [])].map(h => (
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
                  {user?.role === "admin" && (
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => setShowing(e)} style={{ padding:"5px 12px", background:"#f0f4ff", color:"#3b82f6", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
                          👁 Voir
                        </button>
                        <button onClick={() => setEditing(e)} style={{ padding:"5px 12px", background:"#fef9c3", color:"#ca8a04", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
                          ✏️ Modifier
                        </button>
                        <button onClick={() => deleteEmployee(e.id)} style={{ padding:"5px 12px", background:"#fee2e2", color:"#ef4444", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
                          🗑 Supprimer
                        </button>
                      </div>
                    </td>
                  )}
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