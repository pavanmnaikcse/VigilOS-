import os

filepath = r"C:\Users\pn466\OneDrive\Documents\VigilOS\frontend\src\components\NetworkGraph.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the satellites positioning logic
old_logic = """      // Position them radially around the center (cx, cy)
      const radius = 130;
      satellites.forEach((sat, idx) => {
        const angle = (2 * Math.PI * idx) / satellites.length - Math.PI / 2; // start at top
        const sx = cx + radius * Math.cos(angle) - 45; // -45 to center property node horizontally
        const sy = cy + radius * Math.sin(angle) - 20;

        const pNodeId = `${node.id}-prop-${idx}`;
        finalNodes.push({
          id: pNodeId,
          type: 'property',
          data: sat,
          position: { x: sx, y: sy },
          draggable: true
        });"""

new_logic = """      // Position them radially, relative to the parent node's center
      const radius = 130;
      satellites.forEach((sat, idx) => {
        const angle = (2 * Math.PI * idx) / satellites.length - Math.PI / 2; // start at top
        // Parent node is ~95x95, so its center is around (47, 47)
        const rx = 47 + radius * Math.cos(angle) - 40; // -40 to offset property node's own half-width
        const ry = 47 + radius * Math.sin(angle) - 15; // -15 to offset property node's own half-height

        const pNodeId = `${node.id}-prop-${idx}`;
        finalNodes.push({
          id: pNodeId,
          type: 'property',
          data: sat,
          parentId: node.id,
          position: { x: rx, y: ry },
          draggable: true,
          expandParent: true // Optional but helps with bounding box
        });"""

content = content.replace(old_logic, new_logic)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
