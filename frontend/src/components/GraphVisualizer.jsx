import React, { useEffect, useRef } from 'react';
import { Network } from "vis-network"; 

function GraphVisualizer({ nodes, edges, output }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    const visNodes = nodes.map((node, idx) => ({
      id: idx,
      label: `Node ${idx + 1}`,
      color: output && output.distances && output.distances[idx] === 0 ? '#ffe066' : '#a3c9f9',
      font: { color: '#333', size: 22, face: 'Segoe UI' }
    }));
    
    const visEdges = edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      label: edge.weight.toString(),
      color: output && output.mst && output.mst.find(
        ([u, v]) => (u === edge.from && v === edge.to) || (u === edge.to && v === edge.from)
      ) ? '#34d399' : '#b0b0b0',
      width: output && output.mst && output.mst.find(
        ([u, v]) => (u === edge.from && v === edge.to) || (u === edge.to && v === edge.from)
      ) ? 5 : 2,
      font: { size: 18, color: '#444' }
    }));
    
    const data = { nodes: visNodes, edges: visEdges };
    const options = {
      edges: { arrows: { to: false } },
      physics: { enabled: true, stabilization: false },
      nodes: { shape: 'ellipse', size: 40 }
    };
    
    const network = new Network(containerRef.current, data, options);
    return () => network.destroy();
  }, [nodes, edges, output]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '600px',
        width: '100%',
        maxWidth: '900px',
        border: '2px solid #e0eafc',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(80,120,180,0.10)',
        background: '#f7fbff',
        margin: '0 auto'
      }}
    />
  );
}

export default GraphVisualizer;









// import React, { useEffect, useRef } from 'react';
// import { Network } from 'vis-network/standalone';

// function GraphVisualizer({ nodes, edges, output }) {
//   const containerRef = useRef();

//   useEffect(() => {
//     const visNodes = nodes.map((node, idx) => ({
//       id: idx,
//       label: `Node ${idx + 1}`,
//       color: output && output.distances && output.distances[idx] === 0 ? '#ffe066' : '#a3c9f9',
//       font: { color: '#333', size: 22, face: 'Segoe UI' }
//     }));
    
//     const visEdges = edges.map((edge) => ({
//       from: edge.from,
//       to: edge.to,
//       label: edge.weight.toString(),
//       color: output && output.mst && output.mst.find(
//         ([u, v]) => (u === edge.from && v === edge.to) || (u === edge.to && v === edge.from)
//       ) ? '#34d399' : '#b0b0b0',
//       width: output && output.mst && output.mst.find(
//         ([u, v]) => (u === edge.from && v === edge.to) || (u === edge.to && v === edge.from)
//       ) ? 5 : 2,
//       font: { size: 18, color: '#444' }
//     }));
    
//     const data = { nodes: visNodes, edges: visEdges };
//     const options = {
//       edges: { arrows: { to: false } },
//       physics: { enabled: true, stabilization: false },
//       nodes: { shape: 'ellipse', size: 40 }
//     };
    
//     const network = new Network(containerRef.current, data, options);
//     return () => network.destroy();
//   }, [nodes, edges, output]);

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         height: '600px',
//         width: '900px',
//         border: '2px solid #e0eafc',
//         borderRadius: '16px',
//         boxShadow: '0 8px 32px rgba(80,120,180,0.10)',
//         background: '#f7fbff',
//         margin: '0 auto'
//       }}
//     />
//   );
// }

// export default GraphVisualizer;
