import React, { useState, useEffect } from 'react';

function ResultHistory({ onClose, onLoadResult }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ FIXED: Use environment variable instead of hardcoded localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchHistory();
  }, [filter, page]);

  // Fetch algorithm execution history
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      // 🔧 FIXED: Use environment variable instead of hardcoded localhost
      const response = await fetch(
        `${API_BASE_URL}/api/graphs/algorithms/results?algorithm=${filter}&limit=10&page=${page}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        } 
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setHistory(data.data || []);
        setTotalPages(data.totalPages || 1);
      } else {
        setError(data.error || 'Failed to load history');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete algorithm result
  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      // 🔧 FIXED: Use environment variable instead of hardcoded localhost
      const response = await fetch(
        `${API_BASE_URL}/api/graphs/algorithms/results/${resultId}`,
        { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to delete result: ${response.status}`);
      }

      // Remove from local state immediately for better UX
      setHistory(history.filter(h => h._id !== resultId));
      
      // Optionally refetch to ensure consistency
      // fetchHistory();
    } catch (error) {
      console.error('Error deleting result:', error);
      setError('Failed to delete result. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatExecutionTime = (time) => {
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 
                      w-full sm:w-[95%] md:w-[90%] lg:w-[85%] max-w-5xl
                      max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 pb-2 border-b border-gray-200">
          <h2 className="text-blue-600 text-xl sm:text-2xl lg:text-3xl font-bold flex items-center">
            <span className="mr-2">📈</span>
            Algorithm Execution History
          </h2>
          <button 
            onClick={onClose} 
            className="text-xl sm:text-2xl text-gray-600 hover:text-gray-800 
                       p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Error message display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <p className="text-red-800 text-sm sm:text-base">{error}</p>
            </div>
            <button
              onClick={fetchHistory}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm
                         hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <label className="font-semibold text-gray-700 text-sm sm:text-base">
            Filter by Algorithm:
          </label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg 
                       text-sm sm:text-base focus:ring-2 focus:ring-blue-300
                       hover:border-gray-400 transition-colors"
          >
            <option value="all">All Algorithms</option>
            <option value="dijkstra">Dijkstra</option>
            <option value="bellman_ford">Bellman-Ford</option>
            <option value="floyd_warshall">Floyd-Warshall</option>
            <option value="prims">Prim's</option>
            <option value="kruskal">Kruskal's</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="w-6 sm:w-8 h-6 sm:h-8 mb-3 sm:mb-4 border-2 sm:border-4 
                            border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading your algorithm history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">📊</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              No Algorithm History Yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-md mb-2">
              {filter !== 'all' 
                ? `No ${filter} algorithm results found.`
                : 'No algorithm execution history found.'
              }
            </p>
            <p className="text-gray-500 text-sm">
              Run some algorithms to see them here!
            </p>
          </div>
        ) : (
          <div>
            {/* Results Count */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-blue-800 text-sm sm:text-base font-medium flex items-center">
                <span className="mr-2">🔍</span>
                Found {history.length} result{history.length !== 1 ? 's' : ''}
                {filter !== 'all' && ` for ${filter.replace('_', '-').toUpperCase()}`}
                {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
              </p>
            </div>

            {/* Results Grid */}
            <div className="space-y-3 sm:space-y-4">
              {history.map((result) => (
                <div key={result._id} 
                     className="border border-gray-200 rounded-lg sm:rounded-xl 
                                p-3 sm:p-4 lg:p-5 bg-gray-50 hover:bg-gray-100
                                transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Algorithm Title */}
                      <h3 className="text-gray-800 text-base sm:text-lg font-semibold mb-2 sm:mb-3 truncate">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm font-bold mr-2">
                          {result.algorithm.replace('_', '-').toUpperCase()}
                        </span>
                        {result.graphName}
                      </h3>

                      {/* Statistics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-2 sm:mb-3">
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="text-sm sm:text-base font-bold text-gray-900">
                            {result.source || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">Source</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="text-sm sm:text-base font-bold text-gray-900">
                            {result.nodeCount || 0}
                          </div>
                          <div className="text-xs text-gray-500">Nodes</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="text-sm sm:text-base font-bold text-gray-900">
                            {result.edgeCount || 0}
                          </div>
                          <div className="text-xs text-gray-500">Edges</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="text-sm sm:text-base font-bold text-blue-600">
                            {formatExecutionTime(result.executionTime || 0)}
                          </div>
                          <div className="text-xs text-gray-500">Time</div>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs sm:text-sm text-gray-400">
                        Executed: {formatDate(result.createdAt)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onLoadResult && onLoadResult(result)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white 
                                   rounded-lg text-sm font-medium hover:bg-blue-700
                                   transition-colors duration-200"
                      >
                        📋 View
                      </button>
                      <button
                        onClick={() => handleDeleteResult(result._id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white 
                                   rounded-lg text-sm font-medium hover:bg-red-600
                                   transition-colors duration-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg 
                             text-sm sm:text-base font-medium transition-colors
                             ${page === 1 
                               ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                               : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  ← Previous
                </button>

                <span className="text-gray-500 text-sm sm:text-base">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className={`w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg 
                             text-sm sm:text-base font-medium transition-colors
                             ${page === totalPages 
                               ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                               : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultHistory;














// import React, { useState, useEffect } from 'react';

// function ResultHistory({ onClose, onLoadResult }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     fetchHistory();
//   }, [filter, page]);

//   // Fetch algorithm execution history
//   const fetchHistory = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         setError('Authentication required. Please login again.');
//         setLoading(false);
//         return;
//       }

//       const response = await fetch(
//         `http://localhost:5000/api/graphs/algorithms/results?algorithm=${filter}&limit=10&page=${page}`,
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           }
//         } 
//       );

//       if (!response.ok) {
//         if (response.status === 401) {
//           localStorage.removeItem('token');
//           setError('Session expired. Please login again.');
//           return;
//         }
//         throw new Error(`Failed to fetch history: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         setHistory(data.data || []);
//         setTotalPages(data.totalPages || 1);
//       } else {
//         setError(data.error || 'Failed to load history');
//       }
//     } catch (error) {
//       console.error('Error fetching history:', error);
//       setError('Failed to load history. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete algorithm result
//   const handleDeleteResult = async (resultId) => {
//     if (!window.confirm('Are you sure you want to delete this result?')) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         setError('Authentication required. Please login again.');
//         return;
//       }

//       // 🔧 FIXED: Updated URL to match single controller approach
//       const response = await fetch(
//         `http://localhost:5000/api/graphs/algorithms/results/${resultId}`,
//         { 
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       if (!response.ok) {
//         if (response.status === 401) {
//           localStorage.removeItem('token');
//           setError('Session expired. Please login again.');
//           return;
//         }
//         throw new Error(`Failed to delete result: ${response.status}`);
//       }

//       // Remove from local state immediately for better UX
//       setHistory(history.filter(h => h._id !== resultId));
      
//       // Optionally refetch to ensure consistency
//       // fetchHistory();
//     } catch (error) {
//       console.error('Error deleting result:', error);
//       setError('Failed to delete result. Please try again.');
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatExecutionTime = (time) => {
//     return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`;
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
//       <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 
//                       w-full sm:w-[95%] md:w-[90%] lg:w-[85%] max-w-5xl
//                       max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">

//         {/* Header */}
//         <div className="flex justify-between items-center mb-4 sm:mb-6 pb-2 border-b border-gray-200">
//           <h2 className="text-blue-600 text-xl sm:text-2xl lg:text-3xl font-bold flex items-center">
//             <span className="mr-2">📈</span>
//             Algorithm Execution History
//           </h2>
//           <button 
//             onClick={onClose} 
//             className="text-xl sm:text-2xl text-gray-600 hover:text-gray-800 
//                        p-1 rounded-full hover:bg-gray-100 transition-colors"
//           >
//             ×
//           </button>
//         </div>

//         {/* Error message display */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
//             <div className="flex items-center">
//               <span className="text-red-600 mr-2">⚠️</span>
//               <p className="text-red-800 text-sm sm:text-base">{error}</p>
//             </div>
//             <button
//               onClick={fetchHistory}
//               className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm
//                          hover:bg-red-700 transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         )}

//         {/* Filter Controls */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
//           <label className="font-semibold text-gray-700 text-sm sm:text-base">
//             Filter by Algorithm:
//           </label>
//           <select
//             value={filter}
//             onChange={(e) => {
//               setFilter(e.target.value);
//               setPage(1);
//             }}
//             className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg 
//                        text-sm sm:text-base focus:ring-2 focus:ring-blue-300
//                        hover:border-gray-400 transition-colors"
//           >
//             <option value="all">All Algorithms</option>
//             <option value="dijkstra">Dijkstra</option>
//             <option value="bellman_ford">Bellman-Ford</option>
//             <option value="floyd_warshall">Floyd-Warshall</option>
//             <option value="prims">Prim's</option>
//             <option value="kruskal">Kruskal's</option>
//           </select>
//         </div>

//         {/* Content */}
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-12 sm:py-16">
//             <div className="w-6 sm:w-8 h-6 sm:h-8 mb-3 sm:mb-4 border-2 sm:border-4 
//                             border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-gray-600 text-sm sm:text-base">Loading your algorithm history...</p>
//           </div>
//         ) : history.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
//             <div className="w-16 sm:w-20 h-16 sm:h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
//               <span className="text-2xl sm:text-3xl">📊</span>
//             </div>
//             <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
//               No Algorithm History Yet
//             </h3>
//             <p className="text-gray-600 text-sm sm:text-base max-w-md mb-2">
//               {filter !== 'all' 
//                 ? `No ${filter} algorithm results found.`
//                 : 'No algorithm execution history found.'
//               }
//             </p>
//             <p className="text-gray-500 text-sm">
//               Run some algorithms to see them here!
//             </p>
//           </div>
//         ) : (
//           <div>
//             {/* Results Count */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
//               <p className="text-blue-800 text-sm sm:text-base font-medium flex items-center">
//                 <span className="mr-2">🔍</span>
//                 Found {history.length} result{history.length !== 1 ? 's' : ''}
//                 {filter !== 'all' && ` for ${filter.replace('_', '-').toUpperCase()}`}
//                 {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
//               </p>
//             </div>

//             {/* Results Grid */}
//             <div className="space-y-3 sm:space-y-4">
//               {history.map((result) => (
//                 <div key={result._id} 
//                      className="border border-gray-200 rounded-lg sm:rounded-xl 
//                                 p-3 sm:p-4 lg:p-5 bg-gray-50 hover:bg-gray-100
//                                 transition-colors duration-200">
//                   <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
//                     <div className="flex-1 min-w-0">
//                       {/* Algorithm Title */}
//                       <h3 className="text-gray-800 text-base sm:text-lg font-semibold mb-2 sm:mb-3 truncate">
//                         <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm font-bold mr-2">
//                           {result.algorithm.replace('_', '-').toUpperCase()}
//                         </span>
//                         {result.graphName}
//                       </h3>

//                       {/* Statistics Grid */}
//                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-2 sm:mb-3">
//                         <div className="bg-white rounded-lg p-2 text-center">
//                           <div className="text-sm sm:text-base font-bold text-gray-900">
//                             {result.source || 'N/A'}
//                           </div>
//                           <div className="text-xs text-gray-500">Source</div>
//                         </div>
//                         <div className="bg-white rounded-lg p-2 text-center">
//                           <div className="text-sm sm:text-base font-bold text-gray-900">
//                             {result.nodeCount || 0}
//                           </div>
//                           <div className="text-xs text-gray-500">Nodes</div>
//                         </div>
//                         <div className="bg-white rounded-lg p-2 text-center">
//                           <div className="text-sm sm:text-base font-bold text-gray-900">
//                             {result.edgeCount || 0}
//                           </div>
//                           <div className="text-xs text-gray-500">Edges</div>
//                         </div>
//                         <div className="bg-white rounded-lg p-2 text-center">
//                           <div className="text-sm sm:text-base font-bold text-blue-600">
//                             {formatExecutionTime(result.executionTime || 0)}
//                           </div>
//                           <div className="text-xs text-gray-500">Time</div>
//                         </div>
//                       </div>

//                       {/* Timestamp */}
//                       <div className="text-xs sm:text-sm text-gray-400">
//                         Executed: {formatDate(result.createdAt)}
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex gap-2 w-full sm:w-auto">
//                       <button
//                         onClick={() => onLoadResult && onLoadResult(result)}
//                         className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white 
//                                    rounded-lg text-sm font-medium hover:bg-blue-700
//                                    transition-colors duration-200"
//                       >
//                         📋 View
//                       </button>
//                       <button
//                         onClick={() => handleDeleteResult(result._id)}
//                         className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white 
//                                    rounded-lg text-sm font-medium hover:bg-red-600
//                                    transition-colors duration-200"
//                       >
//                         🗑️ Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
//                 <button
//                   onClick={() => setPage(page - 1)}
//                   disabled={page === 1}
//                   className={`w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg 
//                              text-sm sm:text-base font-medium transition-colors
//                              ${page === 1 
//                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
//                                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
//                 >
//                   ← Previous
//                 </button>

//                 <span className="text-gray-500 text-sm sm:text-base">
//                   Page {page} of {totalPages}
//                 </span>

//                 <button
//                   onClick={() => setPage(page + 1)}
//                   disabled={page === totalPages}
//                   className={`w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg 
//                              text-sm sm:text-base font-medium transition-colors
//                              ${page === totalPages 
//                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
//                                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
//                 >
//                   Next →
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ResultHistory;






















// import React, { useState, useEffect } from 'react';

// function ResultHistory({ onClose }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all');

//   useEffect(() => {
//     fetchHistory();
//   }, [filter]);

//   const fetchHistory = async () => {
//     try {
//       setLoading(true);
//       console.log('Fetching history...');
//       const url = filter === 'all' 
//         ? 'http://localhost:5000/api/db/graphs/results/history'
//         : `http://localhost:5000/api/db/graphs/results/history?algorithm=${filter}`;
      
//       const response = await fetch(url);
//       console.log('Response status:', response.status);
      
//       const data = await response.json();
//       console.log('History data:', data);
      
//       if (data.success) {
//         setHistory(data.data);
//         setError(null);
//       } else {
//         setError(data.error || 'Failed to fetch history');
//       }
//     } catch (error) {
//       console.error('Error fetching history:', error);
//       setError('Network error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getAlgorithmColor = (algorithm) => {
//     const colors = {
//       dijkstra: 'bg-blue-100 text-blue-800 border-blue-200',
//       bellman_ford: 'bg-green-100 text-green-800 border-green-200',
//       floyd_warshall: 'bg-purple-100 text-purple-800 border-purple-200',
//       prims: 'bg-emerald-100 text-emerald-800 border-emerald-200',
//       kruskal: 'bg-orange-100 text-orange-800 border-orange-200'
//     };
//     return colors[algorithm] || 'bg-gray-100 text-gray-800 border-gray-200';
//   };

//   const formatExecutionTime = (time) => {
//     if (time < 1000) return `${time}ms`;
//     return `${(time / 1000).toFixed(2)}s`;
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-2 sm:p-4">
//       <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 
//                       w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] max-w-5xl
//                       max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] lg:max-h-[80vh] 
//                       overflow-y-auto shadow-modal">
        
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center 
//                         mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
//           <h2 className="text-primary-600 text-lg sm:text-xl lg:text-2xl xl:text-3xl 
//                          font-bold mb-2 sm:mb-0 flex items-center">
//             <span className="mr-2 text-base sm:text-lg lg:text-xl">📈</span>
//             <span className="hidden sm:inline">Algorithm Execution History</span>
//             <span className="sm:hidden">Execution History</span>
//           </h2>
//           <button
//             onClick={onClose}
//             className="self-end sm:self-auto bg-transparent border-0 text-xl sm:text-2xl 
//                        cursor-pointer text-gray-600 hover:text-gray-800 p-1 rounded-full 
//                        hover:bg-gray-100 transition-colors duration-200"
//           >
//             ×
//           </button>
//         </div>

//         {/* Filter Section */}
//         <div className="mb-4 sm:mb-6">
//           <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
//             <label className="text-sm sm:text-base font-medium text-gray-700">
//               Filter by Algorithm:
//             </label>
//             <select
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base
//                          focus:ring-2 focus:ring-primary-300 focus:border-primary-500
//                          bg-white hover:border-gray-400 transition-colors"
//             >
//               <option value="all">All Algorithms</option>
//               <option value="dijkstra">Dijkstra</option>
//               <option value="bellman_ford">Bellman-Ford</option>
//               <option value="floyd_warshall">Floyd-Warshall</option>
//               <option value="prims">Prim's</option>
//               <option value="kruskal">Kruskal's</option>
//             </select>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="flex flex-col items-center justify-center py-12 sm:py-16">
//             <div className="w-6 sm:w-8 h-6 sm:h-8 mb-3 sm:mb-4 border-2 sm:border-4 
//                             border-primary-600 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-gray-600 text-sm sm:text-base">Loading history...</p>
//           </div>
//         )}

//         {/* Error State */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
//             <div className="flex items-start space-x-2 sm:space-x-3">
//               <span className="text-red-500 text-lg sm:text-xl flex-shrink-0">❌</span>
//               <div className="flex-1 min-w-0">
//                 <p className="text-red-800 text-sm sm:text-base">
//                   <strong>Error:</strong> {error}
//                 </p>
//                 <button 
//                   onClick={fetchHistory}
//                   className="mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 hover:bg-primary-700 
//                              text-white text-sm sm:text-base border-0 rounded-lg cursor-pointer
//                              transition-colors duration-200"
//                 >
//                   Retry
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {!loading && !error && history.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
//             <div className="w-16 sm:w-20 h-16 sm:h-20 mb-4 rounded-full bg-gray-100 
//                             flex items-center justify-center">
//               <span className="text-2xl sm:text-3xl">📊</span>
//             </div>
//             <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
//               No execution history found
//             </h3>
//             <p className="text-sm sm:text-base text-gray-500 max-w-md">
//               {filter === 'all' 
//                 ? 'Run some algorithms to see their execution history here!'
//                 : `No ${filter} algorithm executions found. Try a different filter or run some algorithms.`}
//             </p>
//           </div>
//         )}

//         {/* History Results */}
//         {!loading && !error && history.length > 0 && (
//           <div className="space-y-4 sm:space-y-6">
//             {/* Results Count */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
//               <p className="text-blue-800 text-sm sm:text-base font-medium flex items-center">
//                 <span className="mr-2">🔍</span>
//                 Found {history.length} result{history.length !== 1 ? 's' : ''}
//                 {filter !== 'all' && (
//                   <span className="ml-1">for {filter.replace('_', '-')} algorithm</span>
//                 )}
//               </p>
//             </div>
            
//             {/* History Cards */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
//               {history.map((result) => (
//                 <div
//                   key={result._id}
//                   className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 
//                              bg-gray-50 hover:bg-white hover:border-primary-300 
//                              transition-all duration-200 hover:shadow-lg"
//                 >
//                   <div className="space-y-3 sm:space-y-4">
//                     {/* Algorithm Header */}
//                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
//                       <div className="flex-1 min-w-0">
//                         <div className="flex flex-wrap items-center gap-2 mb-1">
//                           <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium border
//                                           ${getAlgorithmColor(result.algorithm)}`}>
//                             {result.algorithm.replace('_', '-').toUpperCase()}
//                           </span>
//                         </div>
//                         <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
//                           {result.graphName}
//                         </h3>
//                       </div>
//                     </div>

//                     {/* Execution Details */}
//                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-center">
//                       <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-100">
//                         <div className="text-sm sm:text-base font-bold text-gray-900">
//                           Node {result.source + 1}
//                         </div>
//                         <div className="text-xs text-gray-500 font-medium">
//                           Source
//                         </div>
//                       </div>
//                       <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-100">
//                         <div className="text-sm sm:text-base font-bold text-gray-900">
//                           {formatExecutionTime(result.executionTime)}
//                         </div>
//                         <div className="text-xs text-gray-500 font-medium">
//                           Runtime
//                         </div>
//                       </div>
//                       <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-100 col-span-2 sm:col-span-1">
//                         <div className="text-xs sm:text-sm font-bold text-gray-900">
//                           {formatDate(result.createdAt)}
//                         </div>
//                         <div className="text-xs text-gray-500 font-medium">
//                           Executed
//                         </div>
//                       </div>
//                     </div>

//                     {/* Graph Stats */}
//                     {(result.nodeCount || result.edgeCount) && (
//                       <div className="flex justify-center space-x-4 pt-2 border-t border-gray-200">
//                         {result.nodeCount && (
//                           <div className="text-xs sm:text-sm text-gray-600">
//                             <span className="font-medium">{result.nodeCount}</span> nodes
//                           </div>
//                         )}
//                         {result.edgeCount && (
//                           <div className="text-xs sm:text-sm text-gray-600">
//                             <span className="font-medium">{result.edgeCount}</span> edges
//                           </div>
//                         )}
//                       </div>
//                     )}
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

// export default ResultHistory;










// import React, { useState, useEffect } from 'react';

// function ResultHistory({ onClose }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const fetchHistory = async () => {
//     try {
//       console.log('Fetching history...');
//       const response = await fetch('http://localhost:5000/api/db/graphs/results/history');
//       console.log('Response status:', response.status);
      
//       const data = await response.json();
//       console.log('History data:', data);
      
//       if (data.success) {
//         setHistory(data.data);
//       } else {
//         setError(data.error || 'Failed to fetch history');
//       }
//     } catch (error) {
//       console.error('Error fetching history:', error);
//       setError('Network error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
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
//         width: '90%',
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
//           <h2 style={{ color: '#2563eb', margin: 0 }}>Algorithm Execution History</h2>
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

//         {loading && (
//           <div style={{ textAlign: 'center', padding: '2rem' }}>
//             <p>Loading history...</p>
//           </div>
//         )}

//         {error && (
//           <div style={{ 
//             textAlign: 'center', 
//             padding: '2rem',
//             color: 'red',
//             backgroundColor: '#fee2e2',
//             borderRadius: '8px',
//             marginBottom: '1rem'
//           }}>
//             <p><strong>Error:</strong> {error}</p>
//             <button onClick={fetchHistory} style={{
//               padding: '0.5rem 1rem',
//               backgroundColor: '#2563eb',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               marginTop: '0.5rem'
//             }}>
//               Retry
//             </button>
//           </div>
//         )}

//         {!loading && !error && history.length === 0 && (
//           <div style={{ textAlign: 'center', padding: '2rem' }}>
//             <p>No algorithm execution history found.</p>
//             <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
//               Run some algorithms to see them here!
//             </p>
//           </div>
//         )}

//         {!loading && !error && history.length > 0 && (
//           <div>
//             <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
//               Found {history.length} result{history.length !== 1 ? 's' : ''}
//             </p>
            
//             <div style={{ display: 'grid', gap: '1rem' }}>
//               {history.map((result) => (
//                 <div
//                   key={result._id}
//                   style={{
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     padding: '1rem',
//                     backgroundColor: '#f9fafb'
//                   }}
//                 >
//                   <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
//                     {result.algorithm.toUpperCase()} - {result.graphName}
//                   </h3>
//                   <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
//                     <p>Source: Node {result.source}</p>
//                     <p>Execution Time: {result.executionTime}ms</p>
//                     <p>Created: {formatDate(result.createdAt)}</p>
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

// export default ResultHistory;



















// import React, { useState, useEffect } from 'react';

// function ResultHistory({ onClose, onLoadResult }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     fetchHistory();
//   }, [filter, page]);

//   const fetchHistory = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(
//         `http://localhost:5000/api/db/graphs/results/history?algorithm=${filter}&page=${page}&limit=10`
//       );
//       const data = await response.json();
      
//       if (data.success) {
//         setHistory(data.data);
//         setTotalPages(data.totalPages);
//       }
//     } catch (error) {
//       console.error('Error fetching history:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteResult = async (resultId) => {
//     if (window.confirm('Are you sure you want to delete this result?')) {
//       try {
//         const response = await fetch(
//           `http://localhost:5000/api/db/graphs/results/${resultId}`,
//           { method: 'DELETE' }
//         );
        
//         if (response.ok) {
//           fetchHistory(); // Refresh the list
//         }
//       } catch (error) {
//         console.error('Error deleting result:', error);
//       }
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatExecutionTime = (time) => {
//     if (time < 1000) {
//       return `${time}ms`;
//     }
//     return `${(time / 1000).toFixed(2)}s`;
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
//         maxWidth: '900px',
//         width: '95%',
//         maxHeight: '90vh',
//         overflowY: 'auto',
//         boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
//       }}>
//         {/* Header */}
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: '1.5rem'
//         }}>
//           <h2 style={{ color: '#2563eb', margin: 0 }}>Algorithm Execution History</h2>
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

//         {/* Filter Controls */}
//         <div style={{
//           display: 'flex',
//           gap: '1rem',
//           marginBottom: '1.5rem',
//           alignItems: 'center'
//         }}>
//           <label style={{ fontWeight: 'bold', color: '#374151' }}>
//             Filter by Algorithm:
//           </label>
//           <select
//             value={filter}
//             onChange={(e) => {
//               setFilter(e.target.value);
//               setPage(1);
//             }}
//             style={{
//               padding: '0.5rem',
//               border: '1px solid #d1d5db',
//               borderRadius: '8px',
//               fontSize: '1rem'
//             }}
//           >
//             <option value="all">All Algorithms</option>
//             <option value="dijkstra">Dijkstra</option>
//             <option value="bellman_ford">Bellman-Ford</option>
//             <option value="floyd_warshall">Floyd-Warshall</option>
//             <option value="prims">Prim's</option>
//             <option value="kruskal">Kruskal's</option>
//           </select>
//         </div>

//         {/* History List */}
//         {loading ? (
//           <div style={{ textAlign: 'center', padding: '2rem' }}>
//             <p>Loading history...</p>
//           </div>
//         ) : history.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '2rem' }}>
//             <p>No algorithm execution history found.</p>
//             <p style={{ color: '#6b7280' }}>Run some algorithms to see them here!</p>
//           </div>
//         ) : (
//           <div>
//             <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
//               Found {history.length} result{history.length !== 1 ? 's' : ''} 
//               {filter !== 'all' && ` for ${filter}`}
//             </p>
            
//             <div style={{ display: 'grid', gap: '1rem' }}>
//               {history.map((result) => (
//                 <div
//                   key={result._id}
//                   style={{
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     padding: '1rem',
//                     backgroundColor: '#f9fafb'
//                   }}
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
//                         {result.algorithm.replace('_', '-').toUpperCase()} - {result.graphName}
//                       </h3>
                      
//                       <div style={{
//                         display: 'grid',
//                         gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
//                         gap: '0.5rem',
//                         marginBottom: '0.5rem'
//                       }}>
//                         <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
//                           <strong>Source:</strong> Node {result.source}
//                         </div>
//                         <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
//                           <strong>Nodes:</strong> {result.nodeCount}
//                         </div>
//                         <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
//                           <strong>Edges:</strong> {result.edgeCount}
//                         </div>
//                         <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
//                           <strong>Time:</strong> {formatExecutionTime(result.executionTime)}
//                         </div>
//                       </div>
                      
//                       <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
//                         Executed: {formatDate(result.createdAt)}
//                       </div>
//                     </div>
                    
//                     <div style={{ display: 'flex', gap: '0.5rem' }}>
//                       <button
//                         onClick={() => onLoadResult(result)}
//                         style={{
//                           padding: '0.5rem 1rem',
//                           backgroundColor: '#2563eb',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '6px',
//                           cursor: 'pointer',
//                           fontSize: '0.9rem'
//                         }}
//                       >
//                         View
//                       </button>
//                       <button
//                         onClick={() => handleDeleteResult(result._id)}
//                         style={{
//                           padding: '0.5rem 1rem',
//                           backgroundColor: '#ef4444',
//                           color: 'white',
//                           border: 'none',
//                           borderRadius: '6px',
//                           cursor: 'pointer',
//                           fontSize: '0.9rem'
//                         }}
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 gap: '1rem',
//                 marginTop: '2rem'
//               }}>
//                 <button
//                   onClick={() => setPage(page - 1)}
//                   disabled={page === 1}
//                   style={{
//                     padding: '0.5rem 1rem',
//                     border: '1px solid #d1d5db',
//                     borderRadius: '6px',
//                     backgroundColor: page === 1 ? '#f3f4f6' : 'white',
//                     cursor: page === 1 ? 'not-allowed' : 'pointer'
//                   }}
//                 >
//                   Previous
//                 </button>
                
//                 <span style={{ color: '#6b7280' }}>
//                   Page {page} of {totalPages}
//                 </span>
                
//                 <button
//                   onClick={() => setPage(page + 1)}
//                   disabled={page === totalPages}
//                   style={{
//                     padding: '0.5rem 1rem',
//                     border: '1px solid #d1d5db',
//                     borderRadius: '6px',
//                     backgroundColor: page === totalPages ? '#f3f4f6' : 'white',
//                     cursor: page === totalPages ? 'not-allowed' : 'pointer'
//                   }}
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ResultHistory;

