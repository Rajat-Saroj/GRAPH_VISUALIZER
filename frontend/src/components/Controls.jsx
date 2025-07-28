import React, { useState } from 'react';

function Controls({
  nodes,
  setNodes,
  edges,
  setEdges,
  algorithm,
  setAlgorithm,
  source,
  setSource,
  onRun,
}) {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const [weight, setWeight] = useState(1);

  const addNode = () => setNodes([...nodes, nodes.length]);
  
  const addEdge = () => {
    if (from !== to && !edges.find(e => e.from === from && e.to === to)) {
      setEdges([...edges, { from, to, weight }]);
    }
  };

  return (
    <div>
      <h3 className="text-primary-600 mb-4 text-lg font-semibold">Controls</h3>
      
      <button
        onClick={addNode}
        className="bg-primary-600 hover:bg-primary-700 text-white border-none 
                 rounded-lg px-6 py-2 mb-4 font-bold text-base cursor-pointer
                 transition-colors duration-200"
      >
        Add Node
      </button>
      
      {/* Edge Creation Section */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 min-w-[45px]">From:</label>
            <select 
              value={from} 
              onChange={e => setFrom(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary-300 
                       focus:border-primary-500 bg-white"
            >
              {nodes.map((_, idx) => (
                <option key={idx} value={idx}>{idx + 1}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 min-w-[25px]">To:</label>
            <select 
              value={to} 
              onChange={e => setTo(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary-300 
                       focus:border-primary-500 bg-white"
            >
              {nodes.map((_, idx) => (
                <option key={idx} value={idx}>{idx + 1}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 min-w-[50px]">Weight:</label>
            <input
              type="number"
              value={weight}
              min="1"
              onChange={e => setWeight(Number(e.target.value))}
              className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary-300 
                       focus:border-primary-500"
            />
          </div>
        </div>
        
        <button
          onClick={addEdge}
          className="bg-emerald-500 hover:bg-emerald-600 text-white border-none 
                   rounded-lg px-5 py-2 font-bold text-base cursor-pointer
                   transition-colors duration-200"
        >
          Add Edge
        </button>
      </div>
      
      {/* Algorithm Selection */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium text-gray-700 min-w-[70px]">Algorithm:</label>
          <select 
            value={algorithm} 
            onChange={e => setAlgorithm(e.target.value)}
            className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-primary-300 
                     focus:border-primary-500 bg-white"
          >
            <option value="dijkstra">Dijkstra</option>
            <option value="bellman_ford">Bellman-Ford</option>
            <option value="floyd_warshall">Floyd-Warshall</option>
            <option value="prims">Prim's</option>
            <option value="kruskal">Kruskal's</option>
          </select>
        </div>
      </div>
      
      {/* Source Node Selection */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium text-gray-700 min-w-[85px]">Source Node:</label>
          <select 
            value={source} 
            onChange={e => setSource(Number(e.target.value))}
            className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-primary-300 
                     focus:border-primary-500 bg-white"
          >
            {nodes.map((_, idx) => (
              <option key={idx} value={idx}>{idx + 1}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Run Algorithm Button */}
      <button
        onClick={() => onRun(source, edges, algorithm)}
        className="bg-orange-400 hover:bg-orange-500 text-white border-none 
                 rounded-lg px-8 py-3 font-bold text-lg cursor-pointer mt-2
                 transition-colors duration-200 w-full sm:w-auto"
      >
        Run Algorithm
      </button>
    </div>
  );
}

export default Controls;













// import React, { useState } from 'react';

// function Controls({
//   nodes,
//   setNodes,
//   edges,
//   setEdges,
//   algorithm,
//   setAlgorithm,
//   source,
//   setSource,
//   onRun,
// }) {
//   const [from, setFrom] = useState(0);
//   const [to, setTo] = useState(1);
//   const [weight, setWeight] = useState(1);

//   const addNode = () => setNodes([...nodes, nodes.length]);
//   const addEdge = () => {
//     if (from !== to && !edges.find(e => e.from === from && e.to === to)) {
//       setEdges([...edges, { from, to, weight }]);
//     }
//   };

//   return (
//     <div>
//       <h3 style={{ color: '#2563eb', marginBottom: '1rem' }}>Controls</h3>
//       <button
//         onClick={addNode}
//         style={{
//           background: '#2563eb',
//           color: '#fff',
//           border: 'none',
//           borderRadius: '8px',
//           padding: '0.5rem 1.5rem',
//           marginBottom: '1rem',
//           fontWeight: 'bold',
//           fontSize: '1rem',
//           cursor: 'pointer'
//         }}
//       >
//         Add Node
//       </button>
//       <div style={{ marginBottom: '1rem' }}>
//         <label style={{ marginRight: 8 }}>From:</label>
//         <select value={from} onChange={e => setFrom(Number(e.target.value))} style={{ marginRight: 8 }}>
//           {nodes.map((_, idx) => <option key={idx} value={idx}>{idx + 1}</option>)}
//         </select>
//         <label style={{ marginRight: 8 }}>To:</label>
//         <select value={to} onChange={e => setTo(Number(e.target.value))} style={{ marginRight: 8 }}>
//           {nodes.map((_, idx) => <option key={idx} value={idx}>{idx + 1}</option>)}
//         </select>
//         <label style={{ marginRight: 8 }}>Weight:</label>
//         <input
//           type="number"
//           value={weight}
//           min="1"
//           onChange={e => setWeight(Number(e.target.value))}
//           style={{ width: 60, marginRight: 8 }}
//         />
//         <button
//           onClick={addEdge}
//           style={{
//             background: '#10b981',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             padding: '0.4rem 1.2rem',
//             fontWeight: 'bold',
//             fontSize: '1rem',
//             cursor: 'pointer'
//           }}
//         >
//           Add Edge
//         </button>
//       </div>
//       <div style={{ marginBottom: '1rem' }}>
//         <label style={{ marginRight: 8 }}>Algorithm:</label>
//         <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
//           <option value="dijkstra">Dijkstra</option>
//           <option value="bellman_ford">Bellman-Ford</option>
//           <option value="floyd_warshall">Floyd-Warshall</option>
//           <option value="prims">Prim's</option>
//           <option value="kruskal">Kruskal's</option>
//         </select>
//       </div>
//       <div style={{ marginBottom: '1rem' }}>
//         <label style={{ marginRight: 8 }}>Source Node:</label>
//         <select value={source} onChange={e => setSource(Number(e.target.value))}>
//           {nodes.map((_, idx) => <option key={idx} value={idx}>{idx + 1}</option>)}
//         </select>
//       </div>
//       <button
//   onClick={() => onRun(source, edges, algorithm)}
//   style={{
//     background: '#f59e42',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '8px',
//     padding: '0.6rem 2rem',
//     fontWeight: 'bold',
//     fontSize: '1.1rem',
//     cursor: 'pointer',
//     marginTop: '0.5rem'
//   }}
// >
//   Run Algorithm
// </button>

//     </div>
//   );
// }

// export default Controls;
