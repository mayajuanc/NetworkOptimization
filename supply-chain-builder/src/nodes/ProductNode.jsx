
import React from "react";
import { Handle } from "react-flow-renderer";

const ProductNode = ({ data }) => (
  <div style={{ borderRadius: "50%", backgroundColor: "#fff59d", border: "2px solid orange", width: "80px", height: "80px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
    <Handle type="target" position="left" style={{ background: "#555" }} />
    <div style={{ textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.label}</div>
    <Handle type="source" position="right" style={{ background: "#555" }} />
  </div>
);

export default ProductNode;
