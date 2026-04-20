import React, { useEffect, useState } from "react";
import InfoRow from "../Components/InfoRow";
import ModalShell from "../Components/ModalShell";
import VerticalActions from "../Components/VerticalActions";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

const fmt = (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-");

const daysBetween = (start, end) => {
  if (!start || !end) return 1;
  const diff = new Date(end) - new Date(start);
  return diff >= 0 ? Math.ceil(diff / 86400000) + 1 : 1;
};

const STATUS_MAP = {
  en_attente: { bg: "#fef3c7", txt: "#92400e", dot: "#f59e0b", label: "En attente" },
  approuve: { bg: "#d1fae5", txt: "#065f46", dot: "#10b981", label: "Approuve" },
  refuse: { bg: "#fee2e2", txt: "#991b1b", dot: "#ef4444", label: "Refuse" },
};

const TYPE_LABELS = {
  annuel: "Conge annuel",
  maladie: "Maladie",
  maternite: "Maternite",
  sans_solde: "Sans solde",
  autre: "Autre",
};

const fieldStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.15)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  fontFamily: "inherit",
};

function StatusBadge({ statut }) {
  const status = STATUS_MAP[statut] ?? { bg: "#f1f5f9", txt: "#475569", dot: "#94a3b8", label: statut };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: status.bg,
        color: status.txt,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.dot, flexShrink: 0 }} />
      {status.label}
    </span>
  );
}

function CongeRequestModal({ user, employees, onClose, onSaved }) {
  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState({
    employee_id: "",
    type_conge: "annuel",
    date_debut: "",
    date_fin: "",
    motif: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!form.date_debut || !form.date_fin) {
      setErr("Dates obligatoires.");
      return;
    }

    if (isAdmin && !form.employee_id) {
      setErr("Choisir un employe.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      await api.post("/conges", {
        employee_id: isAdmin ? form.employee_id : user?.employee?.id,
        type_conge: form.type_conge,
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        motif: form.motif || null,
      });
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Nouvelle demande"
      width={460}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b", fontFamily: "inherit" }}>
            Annuler
          </button>
          <button onClick={submit} disabled={saving} style={{ flex: 2, padding: "9px 0", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Envoi en cours..." : "Soumettre la demande"}
          </button>
        </div>
      }
    >
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>Remplissez les informations ci-dessous</div>
      {err && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 14px", fontSize: 13, marginBottom: 14 }}>{err}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {isAdmin && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Employe *</label>
            <select value={form.employee_id} onChange={(e) => setField("employee_id", e.target.value)} style={fieldStyle}>
              <option value="">-- Choisir un employe --</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.nom} {employee.prenom}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Type de conge *</label>
          <select value={form.type_conge} onChange={(e) => setField("type_conge", e.target.value)} style={fieldStyle}>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Date debut *</label>
            <input type="date" value={form.date_debut} onChange={(e) => setField("date_debut", e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Date fin *</label>
            <input type="date" value={form.date_fin} min={form.date_debut} onChange={(e) => setField("date_fin", e.target.value)} style={fieldStyle} />
          </div>
        </div>

        {form.date_debut && form.date_fin && (
          <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#3b82f6", fontWeight: 500 }}>
            Duree : {daysBetween(form.date_debut, form.date_fin)} jour{daysBetween(form.date_debut, form.date_fin) > 1 ? "s" : ""}
          </div>
        )}

        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            Motif <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optionnel)</span>
          </label>
          <textarea value={form.motif} onChange={(e) => setField("motif", e.target.value)} rows={3} placeholder="Precisez le motif si necessaire..." style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.5 }} />
        </div>
      </div>
    </ModalShell>
  );
}

function CongeValidationModal({ conge, onClose, onSaved }) {
  const [statut, setStatut] = useState("approuve");
  const [commentaire, setCommentaire] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setSaving(true);
    setErr("");

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
    <ModalShell
      title="Valider la demande"
      width={430}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b", fontFamily: "inherit" }}>
            Annuler
          </button>
          <button onClick={submit} disabled={saving} style={{ flex: 2, padding: "9px 0", borderRadius: 8, border: "none", background: saving ? "#93c5fd" : statut === "approuve" ? "#10b981" : "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Confirmation..." : "Confirmer"}
          </button>
        </div>
      }
    >
      <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", marginBottom: 18 }}>
        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{conge.employee?.nom} {conge.employee?.prenom}</div>
        <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>
          {TYPE_LABELS[conge.type_conge] ?? conge.type_conge} - {fmt(conge.date_debut)} {"->"} {fmt(conge.date_fin)}
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
          {daysBetween(conge.date_debut, conge.date_fin)} jour{daysBetween(conge.date_debut, conge.date_fin) > 1 ? "s" : ""}
          {conge.motif ? ` - ${conge.motif}` : ""}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {["approuve", "refuse"].map((value) => (
          <button
            key={value}
            onClick={() => setStatut(value)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              border: statut === value ? "none" : "0.5px solid rgba(0,0,0,0.12)",
              background: statut === value ? (value === "approuve" ? "#10b981" : "#ef4444") : "#f8fafc",
              color: statut === value ? "#fff" : "#64748b",
            }}
          >
            {value === "approuve" ? "Approuver" : "Refuser"}
          </button>
        ))}
      </div>

      <textarea placeholder="Commentaire optionnel..." value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows={3} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
      {err && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 14px", fontSize: 13, marginTop: 10 }}>{err}</div>}
    </ModalShell>
  );
}

function CongeShowModal({ conge, onClose }) {
  return (
    <ModalShell
      title="Detail du conge"
      width={440}
      onClose={onClose}
      footer={
        <button onClick={onClose} style={{ marginTop: 20, width: "100%", padding: "9px 0", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
          Fermer
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <InfoRow label="Employe" value={`${conge.employee?.nom ?? ""} ${conge.employee?.prenom ?? ""}`} />
        <InfoRow label="Type" value={TYPE_LABELS[conge.type_conge] ?? conge.type_conge} />
        <InfoRow label="Date debut" value={fmt(conge.date_debut)} />
        <InfoRow label="Date fin" value={fmt(conge.date_fin)} />
        <InfoRow label="Duree" value={`${daysBetween(conge.date_debut, conge.date_fin)} jour(s)`} />
        <InfoRow label="Statut" value={<StatusBadge statut={conge.statut} />} />
        <InfoRow label="Motif" value={conge.motif ?? "-"} />
        <InfoRow label="Commentaire" value={conge.commentaire ?? "-"} />
      </div>
    </ModalShell>
  );
}

function CongeEditModal({ conge, employees, user, onClose, onSaved }) {
  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState({
    type_conge: conge.type_conge,
    date_debut: conge.date_debut?.slice(0, 10) ?? "",
    date_fin: conge.date_fin?.slice(0, 10) ?? "",
    motif: conge.motif ?? "",
    employee_id: conge.employee_id ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!form.date_debut || !form.date_fin) {
      setErr("Dates obligatoires.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      await api.put(`/conges/${conge.id}`, form);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message ?? "Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Modifier la demande"
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
        {isAdmin && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Employe *</label>
            <select value={form.employee_id} onChange={(e) => setField("employee_id", e.target.value)} style={fieldStyle}>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.nom} {employee.prenom}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Type de conge *</label>
          <select value={form.type_conge} onChange={(e) => setField("type_conge", e.target.value)} style={fieldStyle}>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Date debut *</label>
            <input type="date" value={form.date_debut} onChange={(e) => setField("date_debut", e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Date fin *</label>
            <input type="date" value={form.date_fin} min={form.date_debut} onChange={(e) => setField("date_fin", e.target.value)} style={fieldStyle} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Motif</label>
          <textarea value={form.motif} onChange={(e) => setField("motif", e.target.value)} rows={3} style={{ ...fieldStyle, resize: "vertical" }} />
        </div>
      </div>
    </ModalShell>
  );
}

function Conges() {
  const [user, setUser] = useState(null);
  const [conges, setConges] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDemande, setShowDemande] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showing, setShowing] = useState(null);
  const [validating, setValidating] = useState(null);
  const [filter, setFilter] = useState("tous");

  const isAdmin = user?.role === "admin";

  const load = () => {
    setLoading(true);
    api.get("/conges").then((res) => setConges(res.data.data ?? [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get("/auth/me").then((res) => setUser(res.data));
    load();
  }, []);

  useEffect(() => {
    if (isAdmin) api.get("/employees").then((res) => setEmployees(res.data.data ?? []));
  }, [isAdmin]);

  const deleteConge = async (id) => {
    if (!window.confirm("Confirmer la suppression de cette demande ?")) return;

    try {
      await api.delete(`/conges/${id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.message ?? "Erreur lors de la suppression.");
    }
  };

  const filtered = filter === "tous" ? conges : conges.filter((conge) => conge.statut === filter);

  const stats = {
    total: conges.length,
    en_attente: conges.filter((conge) => conge.statut === "en_attente").length,
    approuve: conges.filter((conge) => conge.statut === "approuve").length,
    refuse: conges.filter((conge) => conge.statut === "refuse").length,
  };

  const filters = [
    { key: "tous", label: "Tous", count: stats.total },
    { key: "en_attente", label: "En attente", count: stats.en_attente },
    { key: "approuve", label: "Approuves", count: stats.approuve },
    { key: "refuse", label: "Refuses", count: stats.refuse },
  ];

  return (
    <div style={{ display: "flex", fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh" }}>
      <Sidebar user={user} />

      {showDemande && <CongeRequestModal user={user} employees={employees} onClose={() => setShowDemande(false)} onSaved={() => { setShowDemande(false); load(); }} />}
      {showing && <CongeShowModal conge={showing} onClose={() => setShowing(null)} />}
      {editing && <CongeEditModal conge={editing} employees={employees} user={user} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {validating && <CongeValidationModal conge={validating} onClose={() => setValidating(null)} onSaved={() => { setValidating(null); load(); }} />}

      <div style={{ flex: 1, background: "#f0f4ff", minHeight: "100vh", padding: 24, boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{isAdmin ? "Gestion des conges" : "Mes conges"}</h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
              {isAdmin ? "Consultez et validez toutes les demandes" : "Consultez et gerez vos demandes"}
            </p>
          </div>
          {user && !isAdmin && (
            <button onClick={() => setShowDemande(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(59,130,246,0.35)" }}>
              <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span>
              Nouvelle demande
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total", value: stats.total, color: "#3b82f6" },
            { label: "En attente", value: stats.en_attente, color: "#f59e0b" },
            { label: "Approuves", value: stats.approuve, color: "#10b981" },
            { label: "Refuses", value: stats.refuse, color: "#ef4444" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "0.5px solid rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                background: filter === item.key ? "#3b82f6" : "#fff",
                color: filter === item.key ? "#fff" : "#64748b",
              }}
            >
              {item.label}
              <span style={{ background: filter === item.key ? "rgba(255,255,255,0.25)" : "#f1f5f9", color: filter === item.key ? "#fff" : "#64748b", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                {isAdmin && <th style={TH}>Employe</th>}
                <th style={TH}>Type</th>
                <th style={TH}>Periode</th>
                <th style={TH}>Duree</th>
                <th style={TH}>Statut</th>
                {isAdmin && <th style={TH}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Chargement...</td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    Aucune demande {filter !== "tous" ? `avec statut "${STATUS_MAP[filter]?.label}"` : ""}
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((conge, index) => (
                  <tr key={conge.id} style={{ borderBottom: index < filtered.length - 1 ? "0.5px solid #f1f5f9" : "none" }}>
                    {isAdmin && (
                      <td style={TD}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {`${conge.employee?.nom?.[0] ?? ""}${conge.employee?.prenom?.[0] ?? ""}`.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{conge.employee?.nom} {conge.employee?.prenom}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{conge.employee?.poste ?? ""}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td style={TD}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{TYPE_LABELS[conge.type_conge] ?? conge.type_conge}</span></td>
                    <td style={TD}>
                      <div style={{ fontSize: 13, color: "#374151" }}>{fmt(conge.date_debut)}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>→ {fmt(conge.date_fin)}</div>
                    </td>
                    <td style={TD}>
                      <span style={{ background: "#f0f4ff", color: "#3b82f6", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{daysBetween(conge.date_debut, conge.date_fin)}j</span>
                    </td>
                    <td style={TD}>
                      <StatusBadge statut={conge.statut} />
                      {conge.commentaire && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conge.commentaire}</div>}
                    </td>
                    {isAdmin && (
                      <td style={TD}>
                        <VerticalActions onView={() => setShowing(conge)} onEdit={conge.statut === "en_attente" ? () => setEditing(conge) : null} onDelete={conge.statut === "en_attente" ? () => deleteConge(conge.id) : null} />
                        {conge.statut === "en_attente" && (
                          <button onClick={() => setValidating(conge)} style={{ marginTop: 6, padding: "5px 12px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                            Valider
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && filtered.length > 0 && (
            <div style={{ padding: "10px 16px", borderTop: "0.5px solid #f1f5f9", fontSize: 11, color: "#94a3b8" }}>
              {filtered.length} demande{filtered.length > 1 ? "s" : ""} affichee{filtered.length > 1 ? "s" : ""}
              {filter !== "tous" ? ` · filtre : ${STATUS_MAP[filter]?.label}` : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TH = {
  padding: "10px 16px",
  fontSize: 11,
  fontWeight: 600,
  color: "#94a3b8",
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: ".05em",
};

const TD = { padding: "13px 16px", verticalAlign: "middle" };

export default Conges;
