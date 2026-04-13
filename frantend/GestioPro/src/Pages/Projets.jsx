import React, { useEffect, useState } from "react";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

const fmt = (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "—");
const currency = (value) => (value ? `${Number(value).toLocaleString("fr-FR")} MAD` : "—");

const box = {
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

const statusLabel = {
  en_cours: "En cours",
  termine: "Terminé",
  suspendu: "Suspendu",
};
/* ─── Modal Show ─── */
const ModalShow = ({ projet, onClose }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div style={{ background:"#fff", borderRadius:16, padding:28, width:440, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Détail du projet</div>
        <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, fontSize:16, cursor:"pointer", color:"#64748b" }}>×</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {[
          { label:"Nom",         value: projet.nom },
          { label:"Description", value: projet.description ?? "—" },
          { label:"Date début",  value: fmt(projet.date_debut) },
          { label:"Date fin",    value: fmt(projet.date_fin) },
          { label:"Budget",      value: currency(projet.budget) },
          { label:"Statut",      value: statusLabel[projet.statut] ?? projet.statut },
          { label:"Équipe",      value: `${projet.affectations?.length ?? 0} membre(s)` },
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
const ModalModifier = ({ projet, onClose, onSaved }) => {
  const [form, setForm] = useState({
    nom:         projet.nom ?? "",
    description: projet.description ?? "",
    date_debut:  projet.date_debut?.slice(0,10) ?? "",
    date_fin:    projet.date_fin?.slice(0,10) ?? "",
    statut:      projet.statut ?? "en_cours",
    budget:      projet.budget ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.nom) { setErr("Nom obligatoire."); return; }
    setSaving(true); setErr("");
    try {
      await api.put(`/projets/${projet.id}`, { ...form, budget: form.budget === "" ? null : form.budget });
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
          <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Modifier le projet</div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, fontSize:16, cursor:"pointer", color:"#64748b" }}>×</button>
        </div>

        {err && <div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"9px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Nom *</label>
            <input value={form.nom} onChange={e => set("nom", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} style={{ ...inp, resize:"vertical" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Date début *</label>
              <input type="date" value={form.date_debut} onChange={e => set("date_debut", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Date fin *</label>
              <input type="date" value={form.date_fin} onChange={e => set("date_fin", e.target.value)} style={inp} />
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Statut</label>
            <select value={form.statut} onChange={e => set("statut", e.target.value)} style={inp}>
              {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Budget</label>
            <input type="number" min="0" step="0.01" value={form.budget} onChange={e => set("budget", e.target.value)} style={inp} />
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

const Projets = () => {
  const [user, setUser] = useState(null);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "",
    description: "",
    date_debut: "",
    date_fin: "",
    statut: "en_cours",
    budget: "",
  });

  const isAdmin = user?.role === "admin";
  const [showing, setShowing] = useState(null);
const [editing, setEditing] = useState(null);

const deleteProjet = async (id) => {
  if (!window.confirm("Confirmer la suppression ?")) return;
  try {
    await api.delete(`/projets/${id}`);
    load();
  } catch (e) {
    alert(e.response?.data?.message ?? "Erreur lors de la suppression.");
  }
};

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [meRes, projetsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/projets"),
      ]);

      setUser(meRes.data);
      setProjets(projetsRes.data.data ?? []);
    } catch {
      setError("Impossible de charger les projets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post("/projets", {
        ...form,
        budget: form.budget === "" ? null : form.budget,
      });

      setForm({
        nom: "",
        description: "",
        date_debut: "",
        date_fin: "",
        statut: "en_cours",
        budget: "",
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible de créer le projet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar user={user} />
      {showing && <ModalShow projet={showing} onClose={() => setShowing(null)} />}
{editing && (
  <ModalModifier
    projet={editing}
    onClose={() => setEditing(null)}
    onSaved={() => { setEditing(null); load(); }}
  />
)}

      <div style={{ flex: 1, minHeight: "100vh", background: "#f0f4ff", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "minmax(320px, 380px) 1fr" : "1fr", gap: 20 }}>
          {isAdmin && (
            <div style={{ ...box, padding: 20, alignSelf: "start" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>Nouveau projet</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 18px" }}>
                Créez un projet et suivez son statut.
              </p>

              {error && (
                <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom du projet" style={inputStyle} required />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                <input name="date_debut" type="date" value={form.date_debut} onChange={handleChange} style={inputStyle} required />
                <input name="date_fin" type="date" value={form.date_fin} onChange={handleChange} style={inputStyle} required />
                <select name="statut" value={form.statut} onChange={handleChange} style={inputStyle}>
                  {Object.entries(statusLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <input name="budget" type="number" min="0" step="0.01" value={form.budget} onChange={handleChange} placeholder="Budget" style={inputStyle} />
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
                  {saving ? "Création..." : "Créer le projet"}
                </button>
              </form>
            </div>
          )}

          <div style={box}>
            <div style={{ padding: 20, borderBottom: "0.5px solid #e2e8f0" }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e293b" }}>Projets</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
                {projets.length} projet(s) visible(s)
              </p>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Nom</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Période</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Budget</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Statut</th>
                  <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Équipe</th>
                  {isAdmin && <th style={{ padding: "10px 16px", fontSize: 11, textAlign: "left", color: "#94a3b8" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Chargement...</td>
                  </tr>
                )}

                {!loading && projets.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Aucun projet disponible.</td>
                  </tr>
                )}

                {!loading && projets.map((projet) => (
                  <tr key={projet.id} style={{ borderTop: "0.5px solid #eef2f7" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{projet.nom}</div>
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>{projet.description || "Sans description"}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmt(projet.date_debut)} - {fmt(projet.date_fin)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{currency(projet.budget)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <span style={{ background: "#dbeafe", color: "#1d4ed8", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>
                        {statusLabel[projet.statut] ?? projet.statut}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{projet.affectations?.length ?? 0} membre(s)</td>
                    {isAdmin && (
  <td style={{ padding: "12px 16px" }}>
    <div style={{ display:"flex", gap:6 }}>
      <button onClick={() => setShowing(projet)} style={{ padding:"5px 12px", background:"#f0f4ff", color:"#3b82f6", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>      </button>
      <button onClick={() => setEditing(projet)} style={{ padding:"5px 12px", background:"#fef9c3", color:"#ca8a04", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
      </button>
      <button onClick={() => deleteProjet(projet.id)} style={{ padding:"5px 12px", background:"#fee2e2", color:"#ef4444", border:"none", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer" }}>
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

export default Projets;
