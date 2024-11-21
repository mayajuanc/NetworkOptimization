import React from "react";

const CustomNode = ({ id, data, selected, xPos, yPos, onRemove }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: xPos,
        top: yPos,
        padding: "10px",
        background: selected ? "#e8e8e8" : "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "5px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <button
        onClick={() => onRemove(id)}
        style={{
          position: "absolute",
          top: "-5px",
          right: "-5px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          cursor: "pointer",
          lineHeight: "18px",
          fontSize: "14px",
          textAlign: "center",
          padding: 0,
        }}
      >
        X
      </button>
      <div>{data.label}</div>
    </div>
  );
};

export default CustomNode;