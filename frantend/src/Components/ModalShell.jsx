import React from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const closeButtonStyle = {
  background: "#f1f5f9",
  border: "none",
  borderRadius: 8,
  width: 30,
  height: 30,
  fontSize: 16,
  cursor: "pointer",
  color: "#64748b",
};

function ModalShell({ title, width = 460, onClose, children, footer }) {
  return (
    <div style={overlayStyle}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          width,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{title}</div>
          <button onClick={onClose} style={closeButtonStyle}>
            x
          </button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

export default ModalShell;
