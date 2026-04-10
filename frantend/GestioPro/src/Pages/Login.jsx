import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      // ✅ FIX: Redirect selon le rôle
      // Avant: navigate("/employees") — employé normal yshuf 403!
      const role = res.data.user?.role;
      navigate(role === "admin" ? "/employees" : "/conges");

    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "#f0f4ff",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        width: 360, background: "#fff",
        borderRadius: 16, padding: 32,
        border: "0.5px solid rgba(0,0,0,0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>

        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 38, height: 38, background: "#1e3a5f",
            borderRadius: 9, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>GestioPro</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Système de gestion RH</div>
          </div>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", margin: "0 0 4px" }}>
          Connexion
        </h3>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px" }}>
          Entrez vos identifiants pour continuer
        </p>

        {error && (
          <div style={{
            background: "#fee2e2", color: "#991b1b",
            borderRadius: 8, padding: "9px 14px",
            fontSize: 13, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="admin@gestiopro.ma"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "100%", padding: "9px 12px",
                borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)",
                fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: "100%", padding: "9px 12px",
                borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)",
                fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "10px 0",
              borderRadius: 8, border: "none",
              background: loading ? "#93c5fd" : "#3b82f6",
              color: "#fff", fontSize: 13, fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background .15s",
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
