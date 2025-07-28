import React, { useState, useEffect } from 'react';

function GraphLibrary({ onLoadGraph, onClose }) {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState(null);

  // ✅ FIXED: Use environment variable instead of hardcoded localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchGraphs();
  }, []);

  // ✅ FIXED: Use environment variable for API URL
  const fetchGraphs = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      // 🔧 FIXED: Use environment variable instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/graphs/user_graphs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to fetch graphs: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setGraphs(data.data || []);
      } else {
        setError(data.error || 'Failed to load graphs');
      }
    } catch (error) {
      console.error('Error fetching graphs:', error);
      setError('Failed to load graphs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGraph = (graph) => {
    const formattedNodes = graph.nodes.map((_, index) => index);
    const formattedEdges = graph.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      weight: edge.weight
    }));
    
    onLoadGraph({
      nodes: formattedNodes,
      edges: formattedEdges,
      name: graph.name,
      description: graph.description,
      _id: graph._id
    });
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ FIXED: Use environment variable for delete functionality
  const handleDeleteGraph = async (graphId, graphName, event) => {
    event.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${graphName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // 🔧 FIXED: Use environment variable instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/graphs/${graphId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGraphs(graphs.filter(g => g._id !== graphId));
        alert(`Graph "${graphName}" deleted successfully!`);
      } else {
        throw new Error('Failed to delete graph');
      }
    } catch (error) {
      console.error('Error deleting graph:', error);
      alert('Failed to delete graph. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 
                      w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] max-w-4xl
                      max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] lg:max-h-[80vh] 
                      overflow-y-auto shadow-modal">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 pb-2 border-b border-gray-200">
          <h2 className="text-primary-600 text-xl sm:text-2xl lg:text-3xl font-bold m-0 flex items-center">
            <span className="mr-2 text-lg sm:text-xl lg:text-2xl">📚</span>
            My Graph Library
          </h2>
          <button
            onClick={onClose}
            className="bg-transparent border-0 text-xl sm:text-2xl cursor-pointer 
                       text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100
                       transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <p className="text-red-800 text-sm sm:text-base">{error}</p>
            </div>
            <button
              onClick={fetchGraphs}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm
                         hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="w-6 sm:w-8 h-6 sm:h-8 mb-3 sm:mb-4 border-2 sm:border-4 
                            border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading your graphs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && graphs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">📊</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              No Saved Graphs Yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-md mb-4">
              Create and save your first graph to see it here! Build a graph, run some algorithms, 
              then click the "Save Graph" button.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                         transition-colors text-sm sm:text-base"
            >
              Start Creating Graphs
            </button>
          </div>
        )}

        {/* Graphs List */}
        {!loading && !error && graphs.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {/* Graph Count */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <p className="text-blue-800 text-sm sm:text-base font-medium flex items-center">
                <span className="mr-2">📈</span>
                Found {graphs.length} saved graph{graphs.length !== 1 ? 's' : ''} in your library
              </p>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {graphs.map((graph) => (
                <div
                  key={graph._id}
                  onClick={() => handleLoadGraph(graph)}
                  className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 
                             cursor-pointer transition-all duration-200 
                             hover:border-primary-500 hover:bg-blue-50 hover:shadow-lg 
                             transform hover:scale-[1.02] active:scale-[0.98]
                             bg-white relative group"
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteGraph(graph._id, graph.name, e)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                               bg-red-500 hover:bg-red-600 text-white p-1 rounded-full
                               transition-all duration-200 text-xs z-10"
                    title={`Delete "${graph.name}"`}
                  >
                    🗑️
                  </button>

                  <div className="space-y-3 sm:space-y-4">
                    {/* Graph Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-8">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 
                                       truncate">
                          {graph.name}
                        </h3>
                        {graph.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 
                                        leading-relaxed">
                            {graph.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-primary-600 font-bold text-sm sm:text-base
                                      bg-primary-100 px-2 py-1 rounded-full">
                        Load →
                      </div>
                    </div>

                    {/* Graph Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                          {graph.nodes.length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          Nodes
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                          {graph.edges.length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          Edges
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {formatDate(graph.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          Created
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {graph.tags && graph.tags.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs sm:text-sm font-medium text-gray-700">Tags:</div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {graph.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-primary-100 text-primary-800 px-2 py-1 
                                         rounded-full text-xs font-medium
                                         border border-primary-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Creator Info */}
                    <div className="text-xs sm:text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <span className="font-medium">Your Graph</span> • Created {formatDate(graph.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GraphLibrary;












// import React, { useState, useEffect } from 'react';

// function GraphLibrary({ onLoadGraph, onClose }) {
//   const [graphs, setGraphs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedGraph, setSelectedGraph] = useState(null);

//   useEffect(() => {
//     fetchGraphs();
//   }, []);

//   // ✅ FIXED: Changed URL to correct endpoint
//   const fetchGraphs = async () => {
//     try {
//       setError(null);
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         setError('Authentication required. Please login again.');
//         setLoading(false);
//         return;
//       }

//       // 🔧 FIXED: Changed from /save_graph to /user_graphs
//       const response = await fetch('http://localhost:5000/api/graphs/user_graphs', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           localStorage.removeItem('token');
//           setError('Session expired. Please login again.');
//           return;
//         }
//         throw new Error(`Failed to fetch graphs: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data.success) {
//         setGraphs(data.data || []);
//       } else {
//         setError(data.error || 'Failed to load graphs');
//       }
//     } catch (error) {
//       console.error('Error fetching graphs:', error);
//       setError('Failed to load graphs. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLoadGraph = (graph) => {
//     const formattedNodes = graph.nodes.map((_, index) => index);
//     const formattedEdges = graph.edges.map(edge => ({
//       from: edge.from,
//       to: edge.to,
//       weight: edge.weight
//     }));
    
//     onLoadGraph({
//       nodes: formattedNodes,
//       edges: formattedEdges,
//       name: graph.name,
//       description: graph.description,
//       _id: graph._id
//     });
//     onClose();
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   // Delete graph functionality
//   const handleDeleteGraph = async (graphId, graphName, event) => {
//     event.stopPropagation();
    
//     if (!window.confirm(`Are you sure you want to delete "${graphName}"? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:5000/api/graphs/${graphId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.ok) {
//         setGraphs(graphs.filter(g => g._id !== graphId));
//         alert(`Graph "${graphName}" deleted successfully!`);
//       } else {
//         throw new Error('Failed to delete graph');
//       }
//     } catch (error) {
//       console.error('Error deleting graph:', error);
//       alert('Failed to delete graph. Please try again.');
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-2 sm:p-4">
//       <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 
//                       w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] max-w-4xl
//                       max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] lg:max-h-[80vh] 
//                       overflow-y-auto shadow-modal">
        
//         {/* Header */}
//         <div className="flex justify-between items-center mb-4 sm:mb-6 pb-2 border-b border-gray-200">
//           <h2 className="text-primary-600 text-xl sm:text-2xl lg:text-3xl font-bold m-0 flex items-center">
//             <span className="mr-2 text-lg sm:text-xl lg:text-2xl">📚</span>
//             My Graph Library
//           </h2>
//           <button
//             onClick={onClose}
//             className="bg-transparent border-0 text-xl sm:text-2xl cursor-pointer 
//                        text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100
//                        transition-colors duration-200"
//           >
//             ×
//           </button>
//         </div>

//         {/* Error State */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//             <div className="flex items-center">
//               <span className="text-red-600 mr-2">⚠️</span>
//               <p className="text-red-800 text-sm sm:text-base">{error}</p>
//             </div>
//             <button
//               onClick={fetchGraphs}
//               className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm
//                          hover:bg-red-700 transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         )}

//         {/* Loading State */}
//         {loading && (
//           <div className="flex flex-col items-center justify-center py-12 sm:py-16">
//             <div className="w-6 sm:w-8 h-6 sm:h-8 mb-3 sm:mb-4 border-2 sm:border-4 
//                             border-primary-600 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-gray-600 text-sm sm:text-base">Loading your graphs...</p>
//           </div>
//         )}

//         {/* Empty State */}
//         {!loading && !error && graphs.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
//             <div className="w-16 sm:w-20 h-16 sm:h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
//               <span className="text-2xl sm:text-3xl">📊</span>
//             </div>
//             <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
//               No Saved Graphs Yet
//             </h3>
//             <p className="text-gray-600 text-sm sm:text-base max-w-md mb-4">
//               Create and save your first graph to see it here! Build a graph, run some algorithms, 
//               then click the "Save Graph" button.
//             </p>
//             <button
//               onClick={onClose}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
//                          transition-colors text-sm sm:text-base"
//             >
//               Start Creating Graphs
//             </button>
//           </div>
//         )}

//         {/* Graphs List */}
//         {!loading && !error && graphs.length > 0 && (
//           <div className="space-y-4 sm:space-y-6">
//             {/* Graph Count */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
//               <p className="text-blue-800 text-sm sm:text-base font-medium flex items-center">
//                 <span className="mr-2">📈</span>
//                 Found {graphs.length} saved graph{graphs.length !== 1 ? 's' : ''} in your library
//               </p>
//             </div>

//             {/* Graphs Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
//               {graphs.map((graph) => (
//                 <div
//                   key={graph._id}
//                   onClick={() => handleLoadGraph(graph)}
//                   className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 
//                              cursor-pointer transition-all duration-200 
//                              hover:border-primary-500 hover:bg-blue-50 hover:shadow-lg 
//                              transform hover:scale-[1.02] active:scale-[0.98]
//                              bg-white relative group"
//                 >
//                   {/* Delete button */}
//                   <button
//                     onClick={(e) => handleDeleteGraph(graph._id, graph.name, e)}
//                     className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
//                                bg-red-500 hover:bg-red-600 text-white p-1 rounded-full
//                                transition-all duration-200 text-xs z-10"
//                     title={`Delete "${graph.name}"`}
//                   >
//                     🗑️
//                   </button>

//                   <div className="space-y-3 sm:space-y-4">
//                     {/* Graph Header */}
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1 min-w-0 pr-8">
//                         <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 
//                                        truncate">
//                           {graph.name}
//                         </h3>
//                         {graph.description && (
//                           <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 
//                                         leading-relaxed">
//                             {graph.description}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex-shrink-0 text-primary-600 font-bold text-sm sm:text-base
//                                       bg-primary-100 px-2 py-1 rounded-full">
//                         Load →
//                       </div>
//                     </div>

//                     {/* Graph Stats */}
//                     <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
//                       <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
//                         <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
//                           {graph.nodes.length}
//                         </div>
//                         <div className="text-xs sm:text-sm text-gray-500 font-medium">
//                           Nodes
//                         </div>
//                       </div>
//                       <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
//                         <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
//                           {graph.edges.length}
//                         </div>
//                         <div className="text-xs sm:text-sm text-gray-500 font-medium">
//                           Edges
//                         </div>
//                       </div>
//                       <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
//                         <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
//                           {formatDate(graph.createdAt)}
//                         </div>
//                         <div className="text-xs text-gray-500 font-medium">
//                           Created
//                         </div>
//                       </div>
//                     </div>

//                     {/* Tags */}
//                     {graph.tags && graph.tags.length > 0 && (
//                       <div className="space-y-2">
//                         <div className="text-xs sm:text-sm font-medium text-gray-700">Tags:</div>
//                         <div className="flex flex-wrap gap-1 sm:gap-2">
//                           {graph.tags.map((tag, index) => (
//                             <span
//                               key={index}
//                               className="bg-primary-100 text-primary-800 px-2 py-1 
//                                          rounded-full text-xs font-medium
//                                          border border-primary-200"
//                             >
//                               {tag}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Creator Info */}
//                     <div className="text-xs sm:text-sm text-gray-500 pt-2 border-t border-gray-100">
//                       <span className="font-medium">Your Graph</span> • Created {formatDate(graph.createdAt)}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default GraphLibrary;



























// import React, { useState, useEffect } from 'react';

// function GraphLibrary({ onLoadGraph, onClose }) {
//   const [graphs, setGraphs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedGraph, setSelectedGraph] = useState(null);

//   useEffect(() => {
//     fetchGraphs();
//   }, []);

//   const fetchGraphs = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/db/graphs');
//       const data = await response.json();
//       if (data.success) {
//         setGraphs(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching graphs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLoadGraph = (graph) => {
//     const formattedNodes = graph.nodes.map((_, index) => index);
//     const formattedEdges = graph.edges.map(edge => ({
//       from: edge.from,
//       to: edge.to,
//       weight: edge.weight
//     }));
    
//     onLoadGraph({
//       nodes: formattedNodes,
//       edges: formattedEdges,
//       name: graph.name,
//       description: graph.description
//     });
//     onClose();
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.5)',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       zIndex: 1000
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         borderRadius: '16px',
//         padding: '2rem',
//         maxWidth: '800px',
//         maxHeight: '80vh',
//         overflowY: 'auto',
//         boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
//       }}>
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: '1.5rem'
//         }}>
//           <h2 style={{ color: '#2563eb', margin: 0 }}>Graph Library</h2>
//           <button
//             onClick={onClose}
//             style={{
//               background: 'none',
//               border: 'none',
//               fontSize: '1.5rem',
//               cursor: 'pointer',
//               color: '#666'
//             }}
//           >
//             ×
//           </button>
//         </div>

//         {loading ? (
//           <div style={{ textAlign: 'center', padding: '2rem' }}>
//             <p>Loading graphs...</p>
//           </div>
//         ) : graphs.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '2rem' }}>
//             <p>No saved graphs found. Create and save your first graph!</p>
//           </div>
//         ) : (
//           <div>
//             <p style={{ marginBottom: '1rem' }}>
//               Found {graphs.length} saved graph{graphs.length !== 1 ? 's' : ''}
//             </p>
//             <div style={{ display: 'grid', gap: '1rem' }}>
//               {graphs.map((graph) => (
//                 <div
//                   key={graph._id}
//                   style={{
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     padding: '1rem',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s',
//                     ':hover': {
//                       borderColor: '#2563eb',
//                       backgroundColor: '#f8fafc'
//                     }
//                   }}
//                   onClick={() => handleLoadGraph(graph)}
//                 >
//                   <div style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'flex-start'
//                   }}>
//                     <div style={{ flex: 1 }}>
//                       <h3 style={{
//                         margin: '0 0 0.5rem 0',
//                         color: '#1f2937',
//                         fontSize: '1.1rem'
//                       }}>
//                         {graph.name}
//                       </h3>
//                       {graph.description && (
//                         <p style={{
//                           margin: '0 0 0.5rem 0',
//                           color: '#6b7280',
//                           fontSize: '0.9rem'
//                         }}>
//                           {graph.description}
//                         </p>
//                       )}
//                       <div style={{
//                         display: 'flex',
//                         gap: '1rem',
//                         fontSize: '0.8rem',
//                         color: '#9ca3af'
//                       }}>
//                         <span>{graph.nodes.length} nodes</span>
//                         <span>{graph.edges.length} edges</span>
//                         <span>Created: {formatDate(graph.createdAt)}</span>
//                       </div>
//                       {graph.tags && graph.tags.length > 0 && (
//                         <div style={{ marginTop: '0.5rem' }}>
//                           {graph.tags.map((tag, index) => (
//                             <span
//                               key={index}
//                               style={{
//                                 backgroundColor: '#e0eafc',
//                                 color: '#2563eb',
//                                 padding: '0.2rem 0.5rem',
//                                 borderRadius: '4px',
//                                 fontSize: '0.7rem',
//                                 marginRight: '0.5rem'
//                               }}
//                             >
//                               {tag}
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                     <div style={{
//                       color: '#2563eb',
//                       fontSize: '0.9rem',
//                       fontWeight: 'bold'
//                     }}>
//                       Load →
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default GraphLibrary;
