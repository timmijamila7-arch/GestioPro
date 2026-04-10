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
