
// Helper functions for node and edge management

/**
 * Finds a node by its ID and returns its label.
 * @param {Array} nodes - The list of nodes.
 * @param {string} id - The node ID.
 * @returns {string} - The label of the node or "Unknown".
 */
export const findNodeLabel = (nodes, id) => {
  const node = nodes.find((n) => n.id === id);
  return node?.data?.label || "Unknown";
};
