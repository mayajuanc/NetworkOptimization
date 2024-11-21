
import ReactFlow, { MiniMap, Controls, Background } from "react-flow-renderer";

const defaultEdgeOptions = {
  style: {
    strokeWidth: 60, // Default larger thickness for all edges
    cursor: "pointer",
    pointerEvents: "stroke",
  },
};

const ReactFlowWrapper = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick, onEdgeClick, nodeTypes }) => (
  <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    onConnect={onConnect}
    onNodeClick={onNodeClick}
    onEdgeClick={onEdgeClick}
    fitView
    nodeTypes={nodeTypes}
  >
    <MiniMap />
    <Controls />
    <Background />
  </ReactFlow>
);



export default ReactFlowWrapper;
