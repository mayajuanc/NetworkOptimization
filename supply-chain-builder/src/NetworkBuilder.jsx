
import React, { useState, useCallback } from "react";
import { useNodesState, useEdgesState, addEdge } from "react-flow-renderer";
import * as XLSX from "xlsx";
import ReactFlowWrapper from "./components/ReactFlowWrapper";
import nodeTypes from "./nodes/nodeTypes";
import { calculateNewNodePositions } from "./utils/calculateNewNodePositions";
import { renderNodeProperties } from "./utils/renderNodeProperties";

const NetworkBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [newNodeType, setNewNodeType] = useState("product");
  const [numberOfNodes, setNumberOfNodes] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "source", direction: "asc" });
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  

  const highlightedEdges = edges.map((edge) => ({
    ...edge,
    style: {
      ...edge.style,
      stroke: edge.id === selectedEdgeId ? "yellow" : edge.style?.stroke || "black", // Highlight color
      strokeWidth: edge.id === selectedEdgeId ? 5 : edge.style?.strokeWidth || 2,   // Thicker stroke for selected edge
    },
  }));
  
  const handleRowClick = (edgeId) => {
    setSelectedEdgeId(edgeId);
  };
  
  const onRemoveEdge = (edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  };
  
  const sortedEdges = edges.slice().sort((a, b) => {
    const sourceNodeA = nodes.find((node) => node.id === a.source)?.data.label || "Unknown";
    const sourceNodeB = nodes.find((node) => node.id === b.source)?.data.label || "Unknown";
    const targetNodeA = nodes.find((node) => node.id === a.target)?.data.label || "Unknown";
    const targetNodeB = nodes.find((node) => node.id === b.target)?.data.label || "Unknown";
  
    const valueA = sortConfig.key === "source" ? sourceNodeA : sortConfig.key === "target" ? targetNodeA : a.data?.edgeType || "Unknown";
    const valueB = sortConfig.key === "source" ? sourceNodeB : sortConfig.key === "target" ? targetNodeB : b.data?.edgeType || "Unknown";
  
    if (valueA < valueB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
  
  const exportConnections = () => {
    const edgeData = edges.map((edge) => ({
      Source: edge.source,
      Destination: edge.target,
      Type: edge.data?.edgeType || "Unknown",
      Cost: edge.data?.cost || 0,
      LeadTime: edge.data?.leadTime || 0,
      Capacity: edge.data?.capacity || 0,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(edgeData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Edges");
    XLSX.writeFile(workbook, "edges.xlsx");
  };
  
  const importConnections = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      const importedEdges = sheetData.map((row) => ({
        id: `edge-${row.Source}-${row.Destination}`,
        source: row.Source,
        target: row.Destination,
        data: {
          edgeType: row.Type || "Unknown",
          cost: row.Cost || 0,
          leadTime: row.LeadTime || 0,
          capacity: row.Capacity || 0,
        },
        style: { stroke: "black", strokeWidth: 2 },
        animated: true,
      }));
  
      setEdges((existingEdges) => [...existingEdges, ...importedEdges]);
    };
    reader.readAsBinaryString(file);
  };

  const addNodes = () => {
    const positions = calculateNewNodePositions(newNodeType.toLowerCase(), nodes, numberOfNodes);
    const prefixMapping = {
      product: "P_",
      factory: "F_",
      warehouse: "W_",
      customer: "C_",
    };
    
    
    const newNodes = Array.from({ length: numberOfNodes }, (_, index) => ({
      id: `${nodeIdCounter + index}`,
      type: newNodeType.toLowerCase(),
      data: {
        label: `${prefixMapping[newNodeType.toLowerCase()]}${String(nodeIdCounter + index).padStart(3, "0")}`,
        description: "",
        latlon: "",
        productionCost: 0,
        handlingCost: 0,
        startingInventory: 0,
        productionCapacity: 0,
        storageCapacity: 0,
        properties: "",
        weight: 0,
      },
      position: positions[index],
    }));

    setNodes((nds) => [...nds, ...newNodes]);
    setNodeIdCounter((prev) => prev + numberOfNodes);
  };

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);
  
      let edgeType = "error";
      let edgeColor = "#000";
  
      // Determine edge type and color
      if (sourceNode?.type === "product") {
        edgeType = "product input";
        edgeColor = "red";
      } else if (
        (sourceNode?.type === "factory" || sourceNode?.type === "warehouse") &&
        (targetNode?.type === "factory" || targetNode?.type === "warehouse")
      ) {
        edgeType = "interfacility";
        edgeColor = "blue";
      } else if (
        (sourceNode?.type === "factory" ||
          sourceNode?.type === "warehouse" ||
          sourceNode?.type === "customer") &&
        targetNode?.type === "customer"
      ) {
        edgeType = "demand link";
        edgeColor = "green";
      }
  
      // Add edge with label and color
      setEdges((eds) =>
        addEdge(
          { 
            ...params,
          animated: true,
          label: edgeType,
          data: {
            edgeType,
            cost: 0,          // Default Cost
            leadTime: 0,      // Default LeadTime
            capacity: 0,      // Default Capacity
          },
            style: { 
              stroke: edgeColor, 
              strokeWidth: 5 // Set edge thickness here
            },  
          },
          eds
        )
      );
    },
    [nodes]
  );
  


  const onNodeClick = (_, node) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, ...selectedNode.data } }
            : n
        )
      );
    }
    setSelectedNode(node);
  };
  
  const onEdgeClick = (event, edge) => {
    setSelectedEdge(edge); // Set the selected edge
    setSelectedNode(null); // Clear selected node
  };

  const exportNodeData = () => {
    if (!selectedNode) return;

    const filteredNodes = nodes.filter((node) => node.type === selectedNode.type);

    // Map properties specific to the selected node type
    const excelData = filteredNodes.map((node) => {
      const baseData = {
        ID: node.id,
        Label: node.data.label,
      };

      if (node.type === "factory") {
        return {
          ...baseData,
          Description: node.data.description || "",
          LatLon: node.data.latlon || "",
          ProductionCost: node.data.productionCost || 0,
          StartingInventory: node.data.startingInventory || 0,
          ProductionCapacity: node.data.productionCapacity || 0,
        };
      } else if (node.type === "warehouse" || node.type === "customer") {
        return {
          ...baseData,
          Description: node.data.description || "",
          LatLon: node.data.latlon || "",
          HandlingCost: node.data.handlingCost || 0,
          StartingInventory: node.data.startingInventory || 0,
          StorageCapacity: node.data.storageCapacity || 0,
        };
      } else if (node.type === "product") {
        return {
          ...baseData,
          Properties: node.data.properties || "",
          Weight: node.data.weight || 0,
        };
      }

      return baseData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedNode.type}_Nodes`);
    XLSX.writeFile(workbook, `${selectedNode.type}_Nodes_Data.xlsx`);
  };

  const importNodeData = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === selectedNode.type) {
            const matchingData = sheetData.find((row) => row.ID === node.id);
            if (matchingData) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: matchingData.Label || node.data.label,
                  description: matchingData.Description || node.data.description,
                  latlon: matchingData.LatLon || node.data.latlon,
                  productionCost: matchingData.ProductionCost || node.data.productionCost,
                  handlingCost: matchingData.HandlingCost || node.data.handlingCost,
                  startingInventory: matchingData.StartingInventory || node.data.startingInventory,
                  productionCapacity: matchingData.ProductionCapacity || node.data.productionCapacity,
                  storageCapacity: matchingData.StorageCapacity || node.data.storageCapacity,
                  properties: matchingData.Properties || node.data.properties,
                  weight: matchingData.Weight || node.data.weight,
                },
              };
            }
          }
          return node;
        })
      );
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <div
    style={{
      padding: "10px",
      background: "#f4f4f4",
      gap: "10px",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 10,
    }}
  >
        <select value={newNodeType} onChange={(e) => setNewNodeType(e.target.value)}
          style={{
            width: "150px", // Adjust width
            fontSize: "16px", // Adjust font size
            padding: "5px", // Adjust padding
          }}
          >
          <option value="product">Product</option>
          <option value="factory">Factory</option>
          <option value="warehouse">Warehouse</option>
          <option value="customer">Customer</option>
        </select>
        <select value={numberOfNodes} onChange={(e) => setNumberOfNodes(parseInt(e.target.value))}
        style={{
        width: "100px", // Adjust width
        fontSize: "16px", // Adjust font size
        padding: "5px", // Adjust padding
      }}
    >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        <button
      onClick={addNodes}
      style={{
        fontSize: "14px", // Adjust button font size
        padding: "8px 10px", // Adjust button padding
        cursor: "pointer",
      }}
    >
      Add Nodes
    </button>
      </div>


      {selectedEdge && (
      <div
        style={{
          width: "400px",
          background: "#f4f4f4",
          padding: "20px",
          boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          zIndex: 10,
        }}
      >
<h3>Edge Properties</h3>
        <label>
          Name:
          <input
            type="text"
            value={selectedEdge.data?.source || ""}
            onChange={(e) =>
              setEdges((eds) =>
                eds.map((edge) =>
                  edge.id === selectedEdge.id
                    ? { ...edge, data: { ...edge.data, name: e.target.value } }
                    : edge
                )
              )
            }
          />
        </label>
        <label>
          Cost:
          <input
            type="number"
            value={selectedEdge.data?.cost || 0}
            onChange={(e) =>
              setEdges((eds) =>
                eds.map((edge) =>
                  edge.id === selectedEdge.id
                    ? { ...edge, data: { ...edge.data, cost: parseFloat(e.target.value) || 0 } }
                    : edge
                )
              )
            }
          />
        </label>
        <label>
          LeadTime:
          <input
            type="number"
            value={selectedEdge.data?.leadTime || 0}
            onChange={(e) =>
              setEdges((eds) =>
                eds.map((edge) =>
                  edge.id === selectedEdge.id
                    ? { ...edge, data: { ...edge.data, leadTime: parseFloat(e.target.value) || 0 } }
                    : edge
                )
              )
            }
          />
        </label>
        <label>
          Capacity:
          <input
            type="number"
            value={selectedEdge.data?.capacity || 0}
            onChange={(e) =>
              setEdges((eds) =>
                eds.map((edge) =>
                  edge.id === selectedEdge.id
                    ? { ...edge, data: { ...edge.data, capacity: parseFloat(e.target.value) || 0 } }
                    : edge
                )
              )
            }
          />
        </label>
      
    
        <h3>Link Properties</h3>
        <ul>
          
        {edges.length > 0 && (
  <>
    <h3>Connected Nodes</h3>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
        <th
            style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", cursor: "pointer" }}
            onClick={() => setSortConfig({ key: "source", direction: sortConfig.direction === "asc" ? "desc" : "asc" })}
          >
            Source {sortConfig.key === "source" && (sortConfig.direction === "asc" ? "▲" : "▼")}
          </th>
          <th
            style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", cursor: "pointer" }}
            onClick={() => setSortConfig({ key: "target", direction: sortConfig.direction === "asc" ? "desc" : "asc" })}
          >
            Destination {sortConfig.key === "target" && (sortConfig.direction === "asc" ? "▲" : "▼")}
          </th>
          <th
            style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left", cursor: "pointer" }}
            onClick={() => setSortConfig({ key: "type", direction: sortConfig.direction === "asc" ? "desc" : "asc" })}
          >
            Type {sortConfig.key === "type" && (sortConfig.direction === "asc" ? "▲" : "▼")}
          </th>
        </tr>
      </thead>

      <tbody>
      {sortedEdges.map((edge) => {
          const sourceNode = nodes.find((node) => node.id === edge.source)?.data.label || "Unknown";
          const targetNode = nodes.find((node) => node.id === edge.target)?.data.label || "Unknown";
          const isSelected = edge.id === selectedEdgeId;

          return (
            <tr
            key={edge.id}
            onClick={() => handleRowClick(edge.id)}
            style={{
              cursor: "pointer",
              backgroundColor: isSelected ? "#ffeb3b" : "transparent", // Highlight selected row
            }}
          >
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{sourceNode}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{targetNode}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{edge.data?.edgeType || "Unknown"}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                <button
                  onClick={() => onRemoveEdge(edge.id)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "5px",
                    cursor: "pointer",
                  }}
                >
                  X
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </>
)}

    </ul>

    <div style={{ marginTop: "20px" }}>
  <button onClick={exportConnections} style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginBottom: "10px" }}>
    Export Connections
  </button>
  <input type="file" accept=".xlsx" onChange={(e) => importConnections(e.target.files[0])} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px", cursor: "pointer" }} />
</div>

    <button
      onClick={() => setSelectedEdge(null)} // Clear the selection to close the panel
      style={{
                padding: "10px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
    >
      Close
      </button>
      </div>
    )}

   

      <ReactFlowWrapper
        nodes={nodes}
        edges={highlightedEdges} // Use dynamically styled edges
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
      />

      {selectedNode && (
        <div
        style={{
          width: "400px",
          background: "#f4f4f4",
          padding: "20px",
          boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          zIndex: 10,
        }}
      >
          <h3>{selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Properties</h3>
          {renderNodeProperties(selectedNode, setSelectedNode)}

          <div style={{ display: "flex", flexDirection: "column", marginTop: "10px" }}>
            <button
              onClick={() => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === selectedNode.id
                      ? { ...node, data: { ...node.data, ...selectedNode.data } }
                      : node
                  )
                );
                setSelectedNode(null); // Deselect after saving
              }}
              style={{
                padding: "10px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              Close
            </button>
            <button
              onClick={exportNodeData}
              style={{
                padding: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              Export Data
            </button>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => importNodeData(e.target.files[0])}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
              }}

              
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkBuilder;
