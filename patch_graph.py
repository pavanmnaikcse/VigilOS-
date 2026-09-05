
with open(r"C:\Users\pn466\OneDrive\Documents\VigilOS\frontend\src\components\NetworkGraph.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
if "useNodesState" not in content:
    content = content.replace(
        "Position,\n} from '@xyflow/react';",
        "Position,\n  useNodesState,\n  useEdgesState\n} from '@xyflow/react';"
    )

# Replace the useState section
if "const [nodes, setNodes, onNodesChange] =" not in content:
    old_state = "const [selectedAccount, setSelectedAccount] = useState(null);\n  const [selectedTx, setSelectedTx] = useState(null);"
    new_state = """const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);"""
    content = content.replace(old_state, new_state)

# Replace ReactFlow props
content = content.replace("nodes={initialNodes}", "nodes={nodes}")
content = content.replace("edges={initialEdges}", "edges={edges}")
if "onNodesChange={onNodesChange}" not in content:
    content = content.replace(
        "edgeTypes={edgeTypes}",
        "edgeTypes={edgeTypes}\n          onNodesChange={onNodesChange}\n          onEdgesChange={onEdgesChange}"
    )

# Remove nodesDraggable={false}
content = content.replace("nodesDraggable={false}\n", "")
content = content.replace("nodesDraggable={false}", "")

with open(r"C:\Users\pn466\OneDrive\Documents\VigilOS\frontend\src\components\NetworkGraph.jsx", "w", encoding="utf-8") as f:
    f.write(content)

