import React from "react";

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 12px",
        background: "#f8fafc",
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default InfoRow;
