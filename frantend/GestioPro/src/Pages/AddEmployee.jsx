import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layouts/Sidebar";
import api from "../api";

const EMPTY = {
  matricule: "", nom: "", prenom: "", cin: "",
  date_naissance: "", date_embauche: "", email: "",
  password: "", poste: "", departement: "",
  telephone: "", adresse: "", statut: "actif",
};

const AddEmployee = () => {
  const navigate        = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ FIX: khdm api.get("/auth/me") bedel localStorage.getItem("user")
  // localStorage ma kay5zenach "user" — ghir "token" kay5zen
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/me").then(r => setUser(r.data)).catch(console.error);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api.post("/employees", form);
      navigate("/employees");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        setErrors({ global: err.response?.data?.message || "Erreur lors de l'ajout" });
      }
    } finally {
      setSaving(false);
    }
  };

  const inp = (field) => ({
    width: "100%", padding: "7px 11px",
    border: `0.5px solid ${errors[field] ? "#fca5a5" : "rgba(0,0,0,0.18)"}`,
    borderRadius: 8, fontSize: 13, color: "#1e293b",
    outline: "none", background: errors[field] ? "#fff5f5" : "#fff",
    boxSizing: "border-box",
  });
  const lbl = { fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4, display: "block" };
  const errMsg = (field) => errors[field] && (
    <span style={{ fontSize: 11, color: "#dc2626", marginTop: 3, display: "block" }}>{errors[field][0]}</span>
  );
  const grp = { display: "flex", flexDirection: "column" };
  const row = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

  return (
    <div style={{ display: "flex", fontFamily: "'Segoe UI',sans-serif" }}>
      <Sidebar user={user} />

      <div style={{ flex: 1, minWidth: 0, background: "#f0f4ff", minHeight: "100vh", padding: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate("/employees")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#475569", cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Retour
          </button>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", margin: 0 }}>Ajouter un employé</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Remplir les informations ci-dessous</p>
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {errors.global && (
              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
                {errors.global}
              </div>
            )}

            {/* Identité */}
            <div style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", textTransform: "uppercase", letterSpacing: ".06em", paddingBottom: 6, borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
              Identité
            </div>

            <div style={row}>
              <div style={grp}>
                <label style={lbl}>Nom *</label>
                <input name="nom" value={form.nom} onChange={handleChange} required style={inp("nom")} placeholder="Karimi" />
                {errMsg("nom")}
              </div>
              <div style={grp}>
                <label style={lbl}>Prénom *</label>
                <input name="prenom" value={form.prenom} onChange={handleChange} required style={inp("prenom")} placeholder="Amine" />
                {errMsg("prenom")}
              </div>
            </div>

            <div style={row}>
              <div style={grp}>
                <label style={lbl}>Matricule *</label>
                <input name="matricule" value={form.matricule} onChange={handleChange} required style={inp("matricule")} placeholder="EMP-001" />
                {errMsg("matricule")}
              </div>
              <div style={grp}>
                <label style={lbl}>CIN *</label>
                <input name="cin" value={form.cin} onChange={handleChange} required style={inp("cin")} placeholder="AB123456" />
                {errMsg("cin")}
              </div>
            </div>

            <div style={row}>
              <div style={grp}>
                <label style={lbl}>Date de naissance *</label>
                <input type="date" name="date_naissance" value={form.date_naissance} onChange={handleChange} required style={inp("date_naissance")} />
                {errMsg("date_naissance")}
              </div>
              <div style={grp}>
                <label style={lbl}>Date d'embauche *</label>
                <input type="date" name="date_embauche" value={form.date_embauche} onChange={handleChange} required style={inp("date_embauche")} />
                {errMsg("date_embauche")}
              </div>
            </div>

            {/* Compte */}
            <div style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", textTransform: "uppercase", letterSpacing: ".06em", paddingBottom: 6, borderBottom: "0.5px solid rgba(0,0,0,0.08)", marginTop: 4 }}>
              Compte
            </div>

            <div style={row}>
              <div style={grp}>
                <label style={lbl}>Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required style={inp("email")} placeholder="amine@gestiopro.ma" />
                {errMsg("email")}
              </div>
              <div style={grp}>
                <label style={lbl}>Mot de passe *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required style={inp("password")} placeholder="••••••••" />
                {errMsg("password")}
              </div>
            </div>

            {/* Poste */}
            <div style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", textTransform: "uppercase", letterSpacing: ".06em", paddingBottom: 6, borderBottom: "0.5px solid rgba(0,0,0,0.08)", marginTop: 4 }}>
              Poste
            </div>

            <div style={row}>
              <div style={grp}>
                <label style={lbl}>Poste *</label>
                <input name="poste" value={form.poste} onChange={handleChange} required style={inp("poste")} placeholder="Développeur Backend" />
                {errMsg("poste")}
              </div>
              <div style={grp}>
                <label style={lbl}>Département *</label>
                <input name="departement" value={form.departement} onChange={handleChange} required style={inp("departement")} placeholder="Informatique" />
                {errMsg("departement")}
              </div>
            </div>

            <div style={row}>
              <div style={grp}>
                <label style={lbl}>Téléphone</label>
                <input name="telephone" value={form.telephone} onChange={handleChange} style={inp("telephone")} placeholder="06 XX XX XX XX" />
              </div>
              <div style={grp}>
                <label style={lbl}>Statut *</label>
                <select name="statut" value={form.statut} onChange={handleChange} style={inp("statut")}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>

            <div style={grp}>
              <label style={lbl}>Adresse</label>
              <textarea name="adresse" value={form.adresse} onChange={handleChange} rows={2}
                style={{ ...inp("adresse"), resize: "vertical" }} placeholder="Rue, Ville..." />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 12, borderTop: "0.5px solid rgba(0,0,0,0.08)" }}>
              <button type="button" onClick={() => navigate("/employees")}
                style={{ padding: "7px 16px", background: "transparent", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#475569" }}>
                Annuler
              </button>
              <button type="submit" disabled={saving}
                style={{ padding: "7px 16px", background: saving ? "#93c5fd" : "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Enregistrement..." : "Ajouter l'employé"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
