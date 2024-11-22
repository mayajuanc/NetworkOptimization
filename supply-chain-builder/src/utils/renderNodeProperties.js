
import React from "react";

export const renderNodeProperties = (node, setSelectedNode) => {
  const properties = [];

  // Common properties for all nodes
  properties.push(
    <div key="name">
      <label>Name: </label>
      <input
        type="text"
        value={node.data.label || ""}
        onChange={(e) =>
          setSelectedNode({
            ...node,
            data: { ...node.data, label: e.target.value },
          })
        }
      />
    </div>
  );

  // Properties specific to node types
  if (node.type === "factory") {
    properties.push(
      <div key="description">
        <label>Description: </label>
        <input
          type="text"
          value={node.data.description || ""}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, description: e.target.value },
            })
          }
        />
      </div>,
      <div key="latlon">
        <label>LatLon: </label>
        <input
          type="text"
          value={node.data.latlon || ""}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, latlon: e.target.value },
            })
          }
        />
      </div>,
      <div key="productionCost">
        <label>Production Cost: </label>
        <input
          type="number"
          value={node.data.productionCost || 0}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, productionCost: parseFloat(e.target.value) || 0 },
            })
          }
        />
      </div>,
      <div key="startingInventory">
        <label>Starting Inventory: </label>
        <input
          type="number"
          value={node.data.startingInventory || 0}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, startingInventory: parseFloat(e.target.value) || 0 },
            })
          }
        />
      </div>,
      <div key="productionCapacity">
        <label>Production Capacity: </label>
        <input
          type="number"
          value={node.data.productionCapacity || 0}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, productionCapacity: parseFloat(e.target.value) || 0 },
            })
          }
        />
      </div>
    );
  } else if (node.type === "warehouse" || node.type === "customer") {
    properties.push(
      <div key="description">
        <label>Description: </label>
        <input
          type="text"
          value={node.data.description || ""}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, description: e.target.value },
            })
          }
        />
      </div>,
      <div key="latlon">
        <label>LatLon: </label>
        <input
          type="text"
          value={node.data.latlon || ""}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, latlon: e.target.value },
            })
          }
        />
      </div>,
      <div key="handlingCost">
        <label>Handling Cost: </label>
        <input
          type="number"
          value={node.data.handlingCost || 0}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, handlingCost: parseFloat(e.target.value) || 0 },
            })
          }
        />
      </div>,
      <div key="startingInventory">
        <label>Starting Inventory: </label>
        <input
          type="number"
          value={node.data.startingInventory || 0}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, startingInventory: parseFloat(e.target.value) || 0 },
            })
          }
        />
      </div>,
      <div key="storageCapacity">
        <label>Storage Capacity: </label>
        <input
          type="number"
          value={node.data.storageCapacity || 0}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, storageCapacity: parseFloat(e.target.value) || 0 },
            })
          }
        />
      </div>
    );
  } else if (node.type === "product") {
    properties.push(
      <div key="properties">
        <label>Properties: </label>
        <input
          type="text"
          value={node.data.properties || ""}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, properties: e.target.value },
            })
          }
        />
      </div>,
      <div key="weight">
        <label>Weight: </label>
        <input
          type="number"
          value={node.data.weight || 0}
          onChange={(e) =>
            setSelectedNode({
              ...node,
              data: { ...node.data, weight: parseFloat(e.target.value) || 0 },
            })
          }
        />
      </div>
    );
  }

  return properties;
};
