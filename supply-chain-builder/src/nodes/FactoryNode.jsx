import React, { useState } from "react";
import { Handle } from "react-flow-renderer";
import { useNodesState, useEdgesState, addEdge } from "react-flow-renderer";

const FactoryNode = ({ data, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false); // State to track hover status
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const onRemoveNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
  };
  
  return (
    <div
      onMouseEnter={handleMouseEnter} // Track mouse enter
      onMouseLeave={handleMouseLeave} // Track mouse leave
      style={{
        position: "relative",
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#e0f7fa",
        border: "2px solid blue",
        width: "120px",
        height: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Handle type="target" position="left" style={{ background: "#555" }} />
      <div style={{ textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {data.label}
      </div>
      <Handle type="source" position="right" style={{ background: "#555" }} />
      {isHovered && ( // Conditionally render the button
        <button
          onClick={onRemoveNode}
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "100%",
            width: 15,
            height: 15,
            cursor: "pointer",
            fontSize: "8px",
            lineHeight: "10px",
            textAlign: "center"
          }}
        >
          X
        </button>
      )}
    </div>
  );
};

export default FactoryNode;
