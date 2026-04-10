import React, { useState } from "react";
import api from "../api";

const ModalValidation = ({ conge, onClose, onSaved }) => {
  const [statut, setStatut]           = useState("approuve");
  const [commentaire, setCommentaire] = useState("");
  const [saving, setSaving]           = useState(false);
  const [err, setErr]                 = useState("");

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

  const fmt = d => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");

  return (
    // ✅ FIX: zIndex ajouté — modal kana kat9a3 m3a baqin overlays
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff", padding: 28, borderRadius: 16, width: 420,
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
      }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
            Valider la demande
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}
          >
            ×
          </button>
        </div>

        {/* Résumé congé */}
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
            {conge.employee?.nom} {conge.employee?.prenom}
          </div>
          <div style={{ color: "#64748b" }}>
            {conge.type_conge} · {fmt(conge.date_debut)} → {fmt(conge.date_fin)}
          </div>
          {conge.motif && (
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>Motif : {conge.motif}</div>
          )}
        </div>

        {/* Choix statut */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => setStatut("approuve")}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: statut === "approuve" ? "#d1fae5" : "#f1f5f9",
              color:      statut === "approuve" ? "#065f46" : "#64748b",
              outline:    statut === "approuve" ? "2px solid #10b981" : "none",
            }}
          >
            ✓ Approuver
          </button>
          <button
            onClick={() => setStatut("refuse")}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: statut === "refuse" ? "#fee2e2" : "#f1f5f9",
              color:      statut === "refuse" ? "#991b1b" : "#64748b",
              outline:    statut === "refuse" ? "2px solid #ef4444" : "none",
            }}
          >
            ✗ Refuser
          </button>
        </div>

        {/* Commentaire */}
        <textarea
          placeholder="Commentaire (optionnel)..."
          value={commentaire}
          onChange={e => setCommentaire(e.target.value)}
          rows={3}
          style={{
            width: "100%", padding: "9px 12px",
            borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)",
            fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box",
          }}
        />

        {/* Error */}
        {err && (
          <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 14px", fontSize: 13, marginTop: 10 }}>
            {err}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.15)",
              background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b",
            }}
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
              background: saving ? "#93c5fd" : (statut === "approuve" ? "#10b981" : "#ef4444"),
              color: "#fff", fontSize: 13, fontWeight: 500,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "..." : "Confirmer"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalValidation;
