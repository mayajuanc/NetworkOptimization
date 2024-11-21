
import React from "react";
import { Handle } from "react-flow-renderer";

const WarehouseNode = ({ data }) => (
  <div style={{ padding: 10, borderRadius: 5, backgroundColor: "#e8f5e9", border: "2px solid green", width: "120px", height: "40px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
    <Handle type="target" position="left" style={{ background: "#555" }} />
    <div style={{ textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.label}</div>
    <Handle type="source" position="right" style={{ background: "#555" }} />
  </div>
);

export default WarehouseNode;
