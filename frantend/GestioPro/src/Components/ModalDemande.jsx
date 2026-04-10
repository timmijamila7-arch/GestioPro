import { useState } from "react";
import api from "../api";

const fieldStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.15)",
  fontSize: 13,
  boxSizing: "border-box",
};

const ModalDemande = ({ user, employees, onClose, onSaved }) => {
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState({
    employee_id: isAdmin ? "" : user?.employee?.id ?? "",
    type_conge: "annuel",
    date_debut: "",
    date_fin: "",
    motif: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    if (!form.date_debut || !form.date_fin) {
      setErr("Dates obligatoires.");
      return;
    }

    if (!isAdmin && !user?.employee?.id) {
      setErr("Aucun profil employé lié à cet utilisateur.");
      return;
    }

    if (isAdmin && !form.employee_id) {
      setErr("Choisir un employé.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      await api.post("/conges", {
        employee_id: isAdmin ? form.employee_id : user.employee.id,
        type_conge: form.type_conge,
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        motif: form.motif,
      });

      onSaved();
    } catch (error) {
      const message = error.response?.data?.message ?? "Erreur lors de l'enregistrement.";
      setErr(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: 440,
          boxShadow: "0 18px 48px rgba(15,23,42,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>Nouvelle demande de congé</h3>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 20 }}>
            ×
          </button>
        </div>

        {err && (
          <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>
            {err}
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {isAdmin && (
            <div>
              <label style={{ display: "block", fontSize: 12, marginBottom: 5, color: "#475569" }}>Employé</label>
              <select value={form.employee_id} onChange={(event) => setField("employee_id", event.target.value)} style={fieldStyle}>
                <option value="">Choisir un employé</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.nom} {employee.prenom}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 5, color: "#475569" }}>Type</label>
            <select value={form.type_conge} onChange={(event) => setField("type_conge", event.target.value)} style={fieldStyle}>
              <option value="annuel">Congé annuel</option>
              <option value="maladie">Maladie</option>
              <option value="maternite">Maternité</option>
              <option value="sans_solde">Sans solde</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 5, color: "#475569" }}>Date début</label>
            <input type="date" value={form.date_debut} onChange={(event) => setField("date_debut", event.target.value)} style={fieldStyle} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 5, color: "#475569" }}>Date fin</label>
            <input type="date" value={form.date_fin} onChange={(event) => setField("date_fin", event.target.value)} style={fieldStyle} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 5, color: "#475569" }}>Motif</label>
            <textarea value={form.motif} onChange={(event) => setField("motif", event.target.value)} rows={4} style={{ ...fieldStyle, resize: "vertical" }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ padding: "9px 14px", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", cursor: "pointer" }}>
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "none",
              background: saving ? "#93c5fd" : "#3b82f6",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Envoi..." : "Soumettre"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDemande;
