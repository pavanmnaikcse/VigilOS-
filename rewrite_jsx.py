import os

jsx_content = """import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Handle,
  Position,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import './NetworkGraph.css';
import { 
  UserRound, Landmark, ShoppingCart, WalletCards, Smartphone, Computer,
  Network, Menu, CircleDollarSign, Users, ShieldCheck,
} from 'lucide-react';

const riskLabel = { low: "Low Risk", medium: "Medium Risk", high: "High Risk", unknown: "Unknown" };

// SVG Hexagon component for the user nodes
const HexagonShape = ({ isHighRisk }) => (
  <svg className="hex-svg" viewBox="0 0 100 115.47" preserveAspectRatio="none">
    {/* Outer subtle glow/ring */}
    <polygon 
      points="50 0, 100 28.87, 100 86.6, 50 115.47, 0 86.6, 0 28.87" 
      fill="none" 
      stroke={isHighRisk ? "rgba(255, 30, 86, 0.2)" : "rgba(0, 243, 255, 0.2)"} 
      strokeWidth="2" 
      transform="scale(0.95) translate(2.5, 3)"
    />
    {/* Inner bright rim */}
    <polygon 
      points="50 0, 100 28.87, 100 86.6, 50 115.47, 0 86.6, 0 28.87" 
      fill={isHighRisk ? "rgba(255, 30, 86, 0.05)" : "rgba(0, 243, 255, 0.02)"} 
      stroke={isHighRisk ? "#ff1e56" : "#00f3ff"} 
      strokeWidth="1.5" 
      transform="scale(0.85) translate(8.8, 10)"
    />
    {/* Drop shadow / core glow */}
    <filter id={`glow-${isHighRisk ? 'red' : 'blue'}`}>
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </svg>
);

function AccountNode({ data, selected }) {
  const isHighRisk = data.risk === 'high';
  const color = isHighRisk ? "#ff1e56" : "#00f3ff";
  return (
    <div className={`hex-wrapper ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} style={{opacity: 0}} />
      <Handle type="source" position={Position.Right} style={{opacity: 0}} />
      <HexagonShape isHighRisk={isHighRisk} />
      <div className="hex-content">
        <div style={{
          background: isHighRisk ? "rgba(255, 30, 86, 0.15)" : "rgba(0, 243, 255, 0.1)",
          borderRadius: "50%",
          padding: "10px",
          border: `1px solid ${color}`,
          boxShadow: `0 0 15px ${color}40`
        }}>
          <UserRound size={26} color={color} />
        </div>
        <div className="hex-title">{data.id}</div>
        <div className="hex-subtitle" style={{ color }}>{data.subject ? "Suspicious User" : "User"}</div>
      </div>
    </div>
  );
}

function PropertyNode({ data }) {
  return (
    <div className="hud-property-node">
      <Handle type="target" position={Position.Top} style={{opacity: 0}} />
      <Handle type="source" position={Position.Bottom} style={{opacity: 0}} />
      <div className="hud-property-label">{data.label}</div>
      <div className="hud-property-value">{data.value}</div>
    </div>
  );
}

function TransactionEdge(props) {
  const { id, sourceX, sourceY, targetX, targetY, markerEnd, style, selected, data } = props;
  // Use Bezier for smooth curved lines like the reference
  const [path, x, y] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{...style, animation: "dashdraw 2s linear infinite"}} />
      {/* Tiny pulse circle moving along path */}
      <circle r="3" fill={style.stroke}>
        <animateMotion dur="2s" repeatCount="indefinite" path={path} />
      </circle>
      
      {data && (data.amount || data.relation) && (
        <EdgeLabelRenderer>
          <div className={`hud-edge-label ${selected ? "selected" : ""}`} style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y - 30}px)` }}>
            {data.relation ? (
              <div className="hud-edge-val">{data.relation}</div>
            ) : (
              <>
                <div className="hud-edge-title">TXN ID<br/><span className="hud-edge-val">{data.amount}</span></div>
                <div className="hud-edge-title mt-1">{data.type} TO ACCOUNT</div>
                {data.time && <div className="hud-edge-title mt-1" style={{textTransform: 'none'}}>{data.time}</div>}
              </>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

function Panel({ title, children }) { 
  return <section className="side-panel"><h3>{title}</h3>{children}</section>; 
}
function Pair({ label, value, tone }) { 
  return <div className="pair"><span>{label}</span><b className={tone}>{value}</b></div>; 
}

const nodeTypes = { account: AccountNode, property: PropertyNode };
const edgeTypes = { transaction: TransactionEdge };

export default function NetworkGraph({ data }) {
  const { nodes: initialNodes, edges: initialEdges, summaryData } = useMemo(() => {
    const mainNodes = [];
    const mainEdges = [];
    const addedNodes = new Set();
    let edgeId = 1;
    let totalVol = 0;
    let highRiskCount = 0;

    const addMainNode = (acc, extraData = {}) => {
      if (!addedNodes.has(acc)) {
        addedNodes.add(acc);
        const rsk = data?.fraud_score?.risk_level?.toLowerCase() || 'high';
        if(rsk === 'high') highRiskCount++;
        mainNodes.push({
          id: acc,
          type: 'account',
          data: {
            id: acc,
            country: extraData.location || "Unknown",
            ip: extraData.ip || "",
            old: extraData.old ? `$${extraData.old.toLocaleString()}` : "",
            balance: extraData.balance ? `$${extraData.balance.toLocaleString()}` : "",
            risk: rsk,
            kind: "person",
            subject: data?.transaction?.nameOrig === acc,
            fraud_score: data?.fraud_score?.risk_score || '0.99'
          }
        });
      }
    };

    if (data?.hops && data.hops.length > 0) {
      data.hops.forEach((hop) => {
        addMainNode(hop.nameOrig, {
            location: hop.locationOrig,
            ip: hop.ipOrig,
            old: hop.oldbalanceOrg,
            balance: hop.newbalanceOrig
        });
        addMainNode(hop.nameDest, {
            location: hop.locationDest,
            old: hop.oldbalanceDest,
            balance: hop.newbalanceDest
        });
        
        totalVol += hop.amount || 0;
        const isFraud = hop.isFraud == 1 || hop.isFlaggedFraud == 1;
        const color = isFraud ? "#ff1e56" : "#00f3ff";

        mainEdges.push({
          id: `hop-${edgeId++}`,
          source: hop.nameOrig,
          target: hop.nameDest,
          type: 'transaction',
          data: {
            amount: hop.amount ? `$${hop.amount.toLocaleString()}` : "",
            type: hop.type || "TRANSFER",
            step: hop.step,
            fraud: hop.isFraud ? "1" : "0",
            time: "14 May 2025 10:31 AM" // Mocked to match design
          },
          animated: false,
          style: { stroke: color, strokeWidth: 2.5, strokeDasharray: undefined, filter: `drop-shadow(0 0 6px ${color}80)` },
          markerEnd: { type: "arrowclosed", color, width: 15, height: 15 }
        });
      });
    } else if (data?.ring_detection?.accounts_involved?.length > 0) {
      data.ring_detection.accounts_involved.forEach((acc, i, arr) => {
        addMainNode(acc);
        if (i < arr.length - 1) {
          mainEdges.push({
            id: `ring-${edgeId++}`,
            source: acc,
            target: arr[i + 1],
            type: 'transaction',
            data: { relation: 'TRANSFER' },
            style: { stroke: '#ff1e56', strokeWidth: 2.5, filter: `drop-shadow(0 0 6px #ff1e5680)` },
            markerEnd: { type: 'arrowclosed', color: '#ff1e56', width: 15, height: 15 }
          });
        }
      });
    } else if (data?.transaction) {
      addMainNode(data.transaction.nameOrig);
      addMainNode(data.transaction.nameDest);
      mainEdges.push({
        id: 'tx-1',
        source: data.transaction.nameOrig,
        target: data.transaction.nameDest,
        type: 'transaction',
        data: {
          amount: `$${data.transaction.amount?.toLocaleString()}`,
          type: data.transaction.type,
          time: "14 May 2025 10:31 AM"
        },
        style: { stroke: '#ff1e56', strokeWidth: 2.5, filter: `drop-shadow(0 0 6px #ff1e5680)` },
        markerEnd: { type: 'arrowclosed', color: '#ff1e56', width: 15, height: 15 }
      });
    }

    // DAGRE Layout for Main Nodes
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', nodesep: 150, ranksep: 350 }); 

    mainNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 130, height: 150 });
    });
    mainEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
    dagre.layout(dagreGraph);

    const finalNodes = [];
    const finalEdges = [...mainEdges];

    mainNodes.forEach((node, i) => {
      const pos = dagreGraph.node(node.id);
      
      // Shift nodes slightly up/down alternatively for the snake pattern
      const yOffset = i % 2 === 0 ? 0 : 100;

      const cx = pos.x;
      const cy = pos.y + yOffset;
      
      finalNodes.push({
        ...node,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        position: { x: cx - 65, y: cy - 75 }
      });

      // Generate Satellite Property Nodes
      const satellites = [];
      if (node.data.ip) satellites.push({ label: 'Source IP', value: node.data.ip });
      if (node.data.balance) satellites.push({ label: 'On Account', value: node.data.balance });
      if (node.data.kind) satellites.push({ label: 'Account Type', value: node.data.kind === 'person' ? 'Personal' : node.data.kind });

      // Position top-left, bottom-right etc relative to parent
      satellites.forEach((sat, idx) => {
        let rx = 65, ry = 75;
        if (idx === 0) { rx = -80; ry = -50; } // Top left
        if (idx === 1) { rx = 90; ry = -20; }  // Top right
        if (idx === 2) { rx = -50; ry = 140; } // Bottom left

        const pNodeId = `${node.id}-prop-${idx}`;
        finalNodes.push({
          id: pNodeId,
          type: 'property',
          data: sat,
          parentId: node.id,
          position: { x: rx, y: ry },
          draggable: true,
          expandParent: true 
        });

        finalEdges.push({
          id: `edge-${pNodeId}`,
          source: node.id,
          target: pNodeId,
          type: 'straight',
          style: { stroke: 'rgba(0, 243, 255, 0.3)', strokeWidth: 1, strokeDasharray: '4 4' },
          animated: false
        });
      });
    });

    return { 
      nodes: finalNodes, 
      edges: finalEdges,
      summaryData: {
        totalAccounts: mainNodes.length,
        totalTx: mainEdges.length,
        totalVol: totalVol,
        highRisk: highRiskCount
      }
    };
  }, [data]);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  useEffect(() => {
    if(initialNodes.length > 0 && !selectedAccount) {
      const firstAcc = initialNodes.find(n => n.type === 'account');
      if (firstAcc) setSelectedAccount(firstAcc.data);
    }
    if(initialEdges.length > 0 && !selectedTx) setSelectedTx(initialEdges[0].data);
  }, [initialNodes, initialEdges, selectedAccount, selectedTx]);

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'account') setSelectedAccount(node.data);
  }, []);
  const onEdgeClick = useCallback((_, edge) => { 
    if(edge.data && edge.type === 'transaction') setSelectedTx(edge.data); 
  }, []);

  return (
    <div className="dashboard-body">
      <section className="graph-panel">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          fitView
          fitViewOptions={{ padding: .2 }}
          minZoom={.2}
          maxZoom={1.75}
          proOptions={{ hideAttribution: true }}
        >
          {/* Extremely faint tech grid */}
          <Background gap={20} size={1} color="rgba(0, 243, 255, 0.05)" />
          <Controls showInteractive={false} />
        </ReactFlow>
        <div className="graph-legend relationship-legend">
          <span><i className="line red" />High Risk Flow</span>
          <span><i className="line dotted" />Account Info</span>
        </div>
      </section>
      
      <aside className="details-column">
        {selectedAccount && (
          <Panel title="Entity Overview">
            <div className="account-title">
              <UserRound />
              <b>{selectedAccount.id} {selectedAccount.subject && "(Subject)"}</b>
              <span>{selectedAccount.country}</span>
            </div>
            <Pair label="IP Address" value={selectedAccount.ip || "—"} />
            <Pair label="Location" value={selectedAccount.country || "—"} />
            <Pair label="Account Type" value={selectedAccount.kind === "person" ? "Personal" : selectedAccount.kind} />
            <Pair label="Old Balance" value={selectedAccount.old || "—"} />
            <Pair label="New Balance" value={selectedAccount.balance || "—"} />
            <Pair label="Risk Level" value={`? ${riskLabel[selectedAccount.risk]}`} tone={`tone-${selectedAccount.risk}`} />
          </Panel>
        )}
        
        {selectedTx && (
          <Panel title="Transfer Detail">
            <Pair label="Amount" value={selectedTx.amount || "—"} tone="high" />
            <Pair label="Type" value={selectedTx.type || "TRANSFER"} />
            <Pair label="Step" value={selectedTx.step || "—"} />
            <Pair label="Time" value={selectedTx.time || "—"} />
            <Pair label="isFraud" value={selectedTx.fraud || "1"} tone="danger" />
          </Panel>
        )}
        
        <Panel title="Network Telemetry">
          <div className="metrics">
            <div><Network /><span>Nodes<b>{summaryData.totalAccounts}</b></span></div>
            <div><Menu /><span>Links<b>{summaryData.totalTx}</b></span></div>
            <div><CircleDollarSign /><span>Volume<b>${summaryData.totalVol.toLocaleString()}</b></span></div>
            <div><ShieldCheck /><span>High Risk<b>{summaryData.highRisk}</b></span></div>
          </div>
        </Panel>
      </aside>
    </div>
  );
}
"""

with open(r"C:\Users\pn466\OneDrive\Documents\VigilOS\frontend\src\components\NetworkGraph.jsx", "w", encoding="utf-8") as f:
    f.write(jsx_content)
