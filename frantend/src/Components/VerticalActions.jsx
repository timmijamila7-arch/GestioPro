import React from "react";

const buttonBaseStyle = {
  padding: "5px 12px",
  border: "none",
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
};

const variants = {
  view: { background: "#f0f4ff", color: "#3b82f6", icon: "👁" },
  edit: { background: "#fef9c3", color: "#ca8a04", icon: "✏️" },
  delete: { background: "#fee2e2", color: "#ef4444", icon: "🗑" },
};

function ActionButton({ type, title, onClick }) {
  const variant = variants[type];

  return (
    <button title={title} onClick={onClick} style={{ ...buttonBaseStyle, background: variant.background, color: variant.color }}>
      {variant.icon}
    </button>
  );
}

function VerticalActions({ onView, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      {onView && <ActionButton type="view" title="Voir" onClick={onView} />}
      {onEdit && <ActionButton type="edit" title="Modifier" onClick={onEdit} />}
      {onDelete && <ActionButton type="delete" title="Supprimer" onClick={onDelete} />}
    </div>
  );
}

export default VerticalActions;
