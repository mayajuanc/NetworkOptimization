
export const calculateNewNodePositions = (type, nodes, numberOfNodes) => {
  const nodesOfSameType = nodes.filter((node) => node.type === type);
  const positions = [];
  const horizontalSpacing = 300;

  if (nodesOfSameType.length > 0) {
    const lastSameTypeNode = nodesOfSameType[nodesOfSameType.length - 1];
    const basePosition = { x: lastSameTypeNode.position.x, y: lastSameTypeNode.position.y + 100 };
    for (let i = 0; i < numberOfNodes; i++) {
      positions.push({ x: basePosition.x, y: basePosition.y + i * 100 });
    }
  } else {
    const lastNode = nodes[nodes.length - 1];
    const basePosition = lastNode ? { x: lastNode.position.x + horizontalSpacing, y: 50 } : { x: 50, y: 50 };
    for (let i = 0; i < numberOfNodes; i++) {
      positions.push({ x: basePosition.x, y: basePosition.y + i * 100 });
    }
  }

  return positions;
};
