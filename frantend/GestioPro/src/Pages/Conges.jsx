import React, { useEffect, useState } from "react";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

/* ─── helpers ─── */
const fmt = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");

const daysBetween = (a, b) => {
  if (!a || !b) return 1;
  const diff = new Date(b) - new Date(a);
  return diff >= 0 ? Math.ceil(diff / 86400000) + 1 : 1;
};

const STATUT_MAP = {
  en_attente: { bg: "#fef3c7", txt: "#92400e", dot: "#f59e0b", label: "En attente" },
  approuve:   { bg: "#d1fae5", txt: "#065f46", dot: "#10b981", label: "Approuvé"   },
  refuse:     { bg: "#fee2e2", txt: "#991b1b", dot: "#ef4444", label: "Refusé"     },
};

const TYPE_LABELS = {
  conge_annuel: "Congé annuel",
  maladie:      "Maladie",
  maternite:    "Maternité",
  sans_solde:   "Sans solde",
  autre:        "Autre",
};

const Badge = ({ statut }) => {
  const s = STATUT_MAP[statut] ?? { bg: "#f1f5f9", txt: "#475569", dot: "#94a3b8", label: statut };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.txt,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

/* ─── Modal Demande ─── */
const ModalDemande = ({ user, employees, onClose, onSaved }) => {
  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState({
    type_conge: "conge_annuel",
    date_debut: "",
    date_fin: "",
    motif: "",
    employee_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.date_debut || !form.date_fin) { setErr("Dates obligatoires."); return; }
    if (isAdmin && !form.employee_id)       { setErr("Choisir un employé."); return; }

    setSaving(true); setErr("");
    try {
      const payload = {
        type_conge: form.type_conge,
        date_debut: form.date_debut,
        date_fin:   form.date_fin,
        motif:      form.motif || null,
      };
      if (isAdmin) payload.employee_id = form.employee_id;

      await api.post("/conges", payload);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "0.5px solid rgba(0,0,0,0.15)", fontSize: 13,
    outline: "none", boxSizing: "border-box", background: "#fff",
    fontFamily: "inherit",
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:460, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Nouvelle demande</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Remplissez les informations ci-dessous</div>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, fontSize:16, cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        {err && <div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"9px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {isAdmin && (
            <div>
              <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Employé *</label>
              <select value={form.employee_id} onChange={e => set("employee_id", e.target.value)} style={inp}>
                <option value="">-- Choisir un employé --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nom} {emp.prenom}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Type de congé *</label>
            <select value={form.type_conge} onChange={e => set("type_conge", e.target.value)} style={inp}>
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Date début *</label>
              <input type="date" value={form.date_debut} onChange={e => set("date_debut", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Date fin *</label>
              <input type="date" value={form.date_fin} min={form.date_debut} onChange={e => set("date_fin", e.target.value)} style={inp} />
            </div>
          </div>

          {form.date_debut && form.date_fin && (
            <div style={{ background:"#f0f4ff", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#3b82f6", fontWeight:500 }}>
              Durée : {daysBetween(form.date_debut, form.date_fin)} jour{daysBetween(form.date_debut, form.date_fin) > 1 ? "s" : ""}
            </div>
          )}

          <div>
            <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:5 }}>Motif <span style={{ color:"#94a3b8", fontWeight:400 }}>(optionnel)</span></label>
            <textarea
              value={form.motif}
              onChange={e => set("motif", e.target.value)}
              rows={3}
              placeholder="Précisez le motif si nécessaire..."
              style={{ ...inp, resize:"vertical", lineHeight:1.5 }}
            />
          </div>

        </div>

        <div style={{ display:"flex", gap:10, marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1, padding:"9px 0", borderRadius:8, border:"0.5px solid rgba(0,0,0,0.15)", background:"#fff", fontSize:13, cursor:"pointer", color:"#64748b", fontFamily:"inherit" }}>
            Annuler
          </button>
          <button onClick={submit} disabled={saving} style={{ flex:2, padding:"9px 0", borderRadius:8, border:"none", background: saving ? "#93c5fd" : "#3b82f6", color:"#fff", fontSize:13, fontWeight:600, cursor: saving ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
            {saving ? "Envoi en cours..." : "Soumettre la demande"}
          </button>
        </div>

      </div>
    </div>
  );
};

/* ─── Modal Validation ─── */
const ModalValidation = ({ conge, onClose, onSaved }) => {
  const [statut, setStatut]           = useState("approuve");
  const [commentaire, setCommentaire] = useState("");
  const [saving, setSaving]           = useState(false);
  const [err, setErr]                 = useState("");

  const submit = async () => {
    setSaving(true); setErr("");
    try {
      await api.patch(`/conges/${conge.id}/valider`, { statut, commentaire });
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message ?? "Erreur lors de la validation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#fff", padding:28, borderRadius:16, width:430, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>Valider la demande</div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:30, height:30, fontSize:16, cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        {/* Résumé */}
        <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 16px", marginBottom:18 }}>
          <div style={{ fontWeight:600, color:"#1e293b", fontSize:14 }}>
            {conge.employee?.nom} {conge.employee?.prenom}
          </div>
          <div style={{ color:"#64748b", fontSize:12, marginTop:3 }}>
            {TYPE_LABELS[conge.type_conge] ?? conge.type_conge} · {fmt(conge.date_debut)} → {fmt(conge.date_fin)}
          </div>
          <div style={{ color:"#94a3b8", fontSize:12, marginTop:2 }}>
            {daysBetween(conge.date_debut, conge.date_fin)} jour{daysBetween(conge.date_debut, conge.date_fin) > 1 ? "s" : ""}
            {conge.motif ? ` · ${conge.motif}` : ""}
          </div>
        </div>

        {/* Choix */}
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          {["approuve","refuse"].map(s => (
            <button
              key={s}
              onClick={() => setStatut(s)}
              style={{
                flex:1, padding:"10px 0", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit",
                border: statut === s ? "none" : "0.5px solid rgba(0,0,0,0.12)",
                background: statut === s
                  ? (s === "approuve" ? "#10b981" : "#ef4444")
                  : "#f8fafc",
                color: statut === s ? "#fff" : "#64748b",
                transition: "all .15s",
              }}
            >
              {s === "approuve" ? "✓ Approuver" : "✗ Refuser"}
            </button>
          ))}
        </div>

        <textarea
          placeholder="Commentaire optionnel..."
          value={commentaire}
          onChange={e => setCommentaire(e.target.value)}
          rows={3}
          style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"0.5px solid rgba(0,0,0,0.15)", fontSize:13, outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"inherit" }}
        />

        {err && <div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"9px 14px", fontSize:13, marginTop:10 }}>{err}</div>}

        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <button onClick={onClose} style={{ flex:1, padding:"9px 0", borderRadius:8, border:"0.5px solid rgba(0,0,0,0.15)", background:"#fff", fontSize:13, cursor:"pointer", color:"#64748b", fontFamily:"inherit" }}>
            Annuler
          </button>
          <button onClick={submit} disabled={saving} style={{
            flex:2, padding:"9px 0", borderRadius:8, border:"none",
            background: saving ? "#93c5fd" : (statut === "approuve" ? "#10b981" : "#ef4444"),
            color:"#fff", fontSize:13, fontWeight:600, cursor: saving ? "not-allowed" : "pointer", fontFamily:"inherit",
          }}>
            {saving ? "Confirmation..." : "Confirmer"}
          </button>
        </div>

      </div>
    </div>
  );
};

/* ─── PAGE PRINCIPALE ─── */
const Conges = () => {
  const [user, setUser]         = useState(null);
  const [conges, setConges]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showDemande, setShowDemande] = useState(false);
  const [validating, setValidating]   = useState(null);
  const [filter, setFilter]     = useState("tous");

  const isAdmin = user?.role === "admin";

  const load = () => {
    setLoading(true);
    api.get("/conges")
      .then(r => setConges(r.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get("/auth/me").then(r => setUser(r.data));
    load();
  }, []);

  useEffect(() => {
    if (isAdmin) api.get("/employees").then(r => setEmployees(r.data.data ?? []));
  }, [isAdmin]);

  const filtered = filter === "tous" ? conges : conges.filter(c => c.statut === filter);

  // Stats
  const stats = {
    total:      conges.length,
    en_attente: conges.filter(c => c.statut === "en_attente").length,
    approuve:   conges.filter(c => c.statut === "approuve").length,
    refuse:     conges.filter(c => c.statut === "refuse").length,
  };

  const FILTERS = [
    { key:"tous",       label:"Tous",        count: stats.total      },
    { key:"en_attente", label:"En attente",  count: stats.en_attente },
    { key:"approuve",   label:"Approuvés",   count: stats.approuve   },
    { key:"refuse",     label:"Refusés",     count: stats.refuse     },
  ];

  return (
    <div style={{ display:"flex", fontFamily:"'Segoe UI', sans-serif", minHeight:"100vh" }}>
      <Sidebar user={user} />

      {/* Modals */}
      {showDemande && (
        <ModalDemande
          user={user}
          employees={employees}
          onClose={() => setShowDemande(false)}
          onSaved={() => { setShowDemande(false); load(); }}
        />
      )}
      {validating && (
        <ModalValidation
          conge={validating}
          onClose={() => setValidating(null)}
          onSaved={() => { setValidating(null); load(); }}
        />
      )}

      {/* Content */}
      <div style={{ flex:1, background:"#f0f4ff", minHeight:"100vh", padding:24, boxSizing:"border-box" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
          <div>
            <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:"#1e293b" }}>
              {isAdmin ? "Gestion des congés" : "Mes congés"}
            </h2>
            <p style={{ margin:"3px 0 0", fontSize:12, color:"#94a3b8" }}>
              {isAdmin ? "Consultez et validez toutes les demandes" : "Consultez et gérez vos demandes"}
            </p>
          </div>
          <button
            onClick={() => setShowDemande(true)}
            style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"9px 18px", background:"#3b82f6", color:"#fff",
              border:"none", borderRadius:9, fontSize:13, fontWeight:600,
              cursor:"pointer", boxShadow:"0 2px 8px rgba(59,130,246,0.35)",
            }}
          >
            <span style={{ fontSize:18, lineHeight:1, marginTop:-1 }}>+</span>
            Nouvelle demande
          </button>
        </div>

        {/* Stats cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12, marginBottom:20 }}>
          {[
            { label:"Total",       value: stats.total,      color:"#3b82f6", bg:"#eff6ff" },
            { label:"En attente",  value: stats.en_attente, color:"#f59e0b", bg:"#fffbeb" },
            { label:"Approuvés",   value: stats.approuve,   color:"#10b981", bg:"#f0fdf4" },
            { label:"Refusés",     value: stats.refuse,     color:"#ef4444", bg:"#fef2f2" },
          ].map(s => (
            <div key={s.label} style={{ background:"#fff", borderRadius:10, padding:"14px 16px", border:"0.5px solid rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:14 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:500, fontFamily:"inherit",
                background: filter === f.key ? "#3b82f6" : "#fff",
                color:      filter === f.key ? "#fff"    : "#64748b",
                boxShadow:  filter === f.key ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
                transition: "all .15s",
              }}
            >
              {f.label}
              <span style={{
                background: filter === f.key ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                color:      filter === f.key ? "#fff" : "#64748b",
                borderRadius:10, padding:"1px 7px", fontSize:11,
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid rgba(0,0,0,0.08)", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f8fafc", borderBottom:"0.5px solid rgba(0,0,0,0.08)" }}>
                {isAdmin && (
                  <th style={TH}>Employé</th>
                )}
                <th style={TH}>Type</th>
                <th style={TH}>Période</th>
                <th style={TH}>Durée</th>
                <th style={TH}>Statut</th>
                {isAdmin && <th style={TH}>Action</th>}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} style={{ padding:40, textAlign:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, color:"#94a3b8", fontSize:13 }}>
                      <div style={{ width:18, height:18, border:"2px solid #e2e8f0", borderTop:"2px solid #3b82f6", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
                      Chargement...
                    </div>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} style={{ padding:50, textAlign:"center", color:"#94a3b8", fontSize:13 }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
                    Aucune demande {filter !== "tous" ? `avec statut "${STATUT_MAP[filter]?.label}"` : ""}
                  </td>
                </tr>
              )}

              {!loading && filtered.map((c, i) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? "0.5px solid #f1f5f9" : "none",
                    transition: "background .1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {isAdmin && (
                    <td style={TD}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <div style={{
                          width:30, height:30, borderRadius:"50%",
                          background:"#dbeafe", color:"#1d4ed8",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:11, fontWeight:700, flexShrink:0,
                        }}>
                          {`${c.employee?.nom?.[0] ?? ""}${c.employee?.prenom?.[0] ?? ""}`.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:"#1e293b" }}>
                            {c.employee?.nom} {c.employee?.prenom}
                          </div>
                          <div style={{ fontSize:11, color:"#94a3b8" }}>{c.employee?.poste ?? ""}</div>
                        </div>
                      </div>
                    </td>
                  )}

                  <td style={TD}>
                    <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>
                      {TYPE_LABELS[c.type_conge] ?? c.type_conge}
                    </span>
                  </td>

                  <td style={TD}>
                    <div style={{ fontSize:13, color:"#374151" }}>
                      {fmt(c.date_debut)}
                    </div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>
                      → {fmt(c.date_fin)}
                    </div>
                  </td>

                  <td style={TD}>
                    <span style={{
                      background:"#f0f4ff", color:"#3b82f6",
                      padding:"3px 10px", borderRadius:20,
                      fontSize:12, fontWeight:600,
                    }}>
                      {daysBetween(c.date_debut, c.date_fin)}j
                    </span>
                  </td>

                  <td style={TD}>
                    <Badge statut={c.statut} />
                    {c.commentaire && (
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:4, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {c.commentaire}
                      </div>
                    )}
                  </td>

                  {isAdmin && (
                    <td style={TD}>
                      {c.statut === "en_attente" ? (
                        <button
                          onClick={() => setValidating(c)}
                          style={{
                            padding:"5px 12px",
                            background:"#1e3a5f", color:"#fff",
                            border:"none", borderRadius:7,
                            fontSize:12, fontWeight:500, cursor:"pointer",
                            fontFamily:"inherit",
                          }}
                        >
                          Valider
                        </button>
                      ) : (
                        <span style={{ fontSize:12, color:"#cbd5e1" }}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding:"10px 16px", borderTop:"0.5px solid #f1f5f9", fontSize:11, color:"#94a3b8" }}>
              {filtered.length} demande{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
              {filter !== "tous" ? ` · filtre : ${STATUT_MAP[filter]?.label}` : ""}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const TH = {
  padding:"10px 16px", fontSize:11, fontWeight:600,
  color:"#94a3b8", textAlign:"left", textTransform:"uppercase", letterSpacing:".05em",
};

const TD = { padding:"13px 16px", verticalAlign:"middle" };

export default Conges;
