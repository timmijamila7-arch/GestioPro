import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import logo from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      const role = res.data.user?.role;
      navigate(role === "admin" ? "/employees" : "/conges");
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f7fbff 0%, #e8f0f7 52%, #eef2f6 100%)",
        fontFamily: "'Segoe UI', sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 420,
          maxWidth: "100%",
          background: "rgba(251,253,255,0.96)",
          borderRadius: 24,
          padding: 36,
          border: "1px solid rgba(139, 161, 187, 0.22)",
          boxShadow: "0 24px 60px rgba(83, 107, 136, 0.10)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ marginBottom: 22, display: "flex", justifyContent: "center" }}>
          <img
            src={logo}
            alt="GestioPro logo"
            style={{ width: 250, maxWidth: "100%", display: "block", filter: "drop-shadow(0 4px 10px rgba(97, 113, 138, 0.10))" }}
          />
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#3b526f", margin: "0 0 6px", textAlign: "center" }}>
          Connexion
        </h3>
        <p style={{ fontSize: 12, color: "#8595aa", margin: "0 0 24px", textAlign: "center" }}>
          Entrez vos identifiants pour continuer
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: 12,
              padding: "11px 14px",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#536985", display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="admin@gestiopro.ma"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: 12,
                border: "1px solid #dce5ef",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                background: "#fbfdff",
                color: "#3b526f",
              }}
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#536985", display: "block", marginBottom: 6 }}>
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: 12,
                border: "1px solid #dce5ef",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                background: "#fbfdff",
                color: "#3b526f",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 12,
              border: "none",
              background: loading ? "#9ab0cb" : "#6f95c1",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background .15s, transform .15s",
              boxShadow: "0 14px 26px rgba(111, 149, 193, 0.22)",
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
