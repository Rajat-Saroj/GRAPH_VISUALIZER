import React, { useState } from 'react';

function SaveGraphModal({ nodes, edges, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ✅ FIXED: Use environment variable instead of hardcoded localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Graph name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // ✅ ADD AUTH TOKEN HERE
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setSaving(false);
        return;
      }

      const graphData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        nodes: nodes.map((_, index) => ({ id: index })),
        edges: edges,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPublic: false // Add privacy control
      };

      // 🔧 FIXED: Use environment variable instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/graphs/save_graph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ AUTH TOKEN REQUIRED
        },
        body: JSON.stringify(graphData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to save graph: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        onSave(result.data);
        onClose();
      } else {
        setError(result.error || 'Failed to save graph');
      }
    } catch (error) {
      console.error('Error saving graph:', error);
      setError('Failed to save graph. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 
                      w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-2xl
                      max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] lg:max-h-[80vh] 
                      overflow-y-auto shadow-modal">
        
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-primary-600 text-xl sm:text-2xl font-bold m-0">
            Save Graph
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

        {/* ✅ ADDED: Error message display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Graph Name */}
          <div>
            <label className="block mb-1 sm:mb-2 font-bold text-gray-700 text-sm sm:text-base">
              Graph Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg 
                         text-sm sm:text-base box-border
                         focus:ring-2 focus:ring-primary-300 focus:border-primary-500
                         hover:border-gray-400 transition-colors duration-200"
              placeholder="e.g., Campus Navigation Map"
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 sm:mb-2 font-bold text-gray-700 text-sm sm:text-base">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg 
                         text-sm sm:text-base min-h-[60px] sm:min-h-[80px] resize-y box-border
                         focus:ring-2 focus:ring-primary-300 focus:border-primary-500
                         hover:border-gray-400 transition-colors duration-200"
              placeholder="Describe your graph and its purpose..."
              disabled={saving}
            />
          </div>

          {/* ✅ REMOVED: Creator Name field - now uses authenticated user */}
          {/* The backend will automatically use req.user from the JWT token */}

          {/* Tags */}
          <div>
            <label className="block mb-1 sm:mb-2 font-bold text-gray-700 text-sm sm:text-base">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg 
                         text-sm sm:text-base box-border
                         focus:ring-2 focus:ring-primary-300 focus:border-primary-500
                         hover:border-gray-400 transition-colors duration-200"
              placeholder="e.g., dijkstra, navigation, campus"
              disabled={saving}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Help organize your graphs with relevant keywords
            </p>
          </div>

          {/* ✅ ADDED: Graph Statistics */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Graph Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg sm:text-xl font-bold text-primary-600">{nodes.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Nodes</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-primary-600">{edges.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Edges</div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 
                         border border-gray-300 rounded-lg bg-white text-gray-700 
                         text-sm sm:text-base cursor-pointer hover:bg-gray-50
                         transition-colors duration-200 order-2 sm:order-1
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 
                         border-0 rounded-lg text-white text-sm sm:text-base
                         transition-all duration-200 order-1 sm:order-2
                         ${
                           saving || !formData.name.trim()
                             ? 'bg-gray-400 cursor-not-allowed' 
                             : 'bg-primary-600 cursor-pointer hover:bg-primary-700 transform hover:scale-105 active:scale-95'
                         }`}
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Saving...
                </span>
              ) : (
                'Save Graph'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaveGraphModal;



















// import React, { useState } from 'react';

// function SaveGraphModal({ nodes, edges, onSave, onClose }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     tags: ''
//   });
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!formData.name.trim()) {
//       setError('Graph name is required');
//       return;
//     }

//     setSaving(true);
//     setError(null);

//     try {
//       // ✅ ADD AUTH TOKEN HERE
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         setError('Authentication required. Please login again.');
//         setSaving(false);
//         return;
//       }

//       const graphData = {
//         name: formData.name.trim(),
//         description: formData.description.trim(),
//         nodes: nodes.map((_, index) => ({ id: index })),
//         edges: edges,
//         tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
//         isPublic: false // Add privacy control
//       };

//       const response = await fetch('http://localhost:5000/api/graphs/save_graph', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}` // ✅ AUTH TOKEN REQUIRED
//         },
//         body: JSON.stringify(graphData),
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           localStorage.removeItem('token');
//           setError('Session expired. Please login again.');
//           return;
//         }
//         throw new Error(`Failed to save graph: ${response.status}`);
//       }

//       const result = await response.json();
      
//       if (result.success) {
//         onSave(result.data);
//         onClose();
//       } else {
//         setError(result.error || 'Failed to save graph');
//       }
//     } catch (error) {
//       console.error('Error saving graph:', error);
//       setError('Failed to save graph. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-2 sm:p-4">
//       <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 
//                       w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-2xl
//                       max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] lg:max-h-[80vh] 
//                       overflow-y-auto shadow-modal">
        
//         <div className="flex justify-between items-center mb-4 sm:mb-6">
//           <h2 className="text-primary-600 text-xl sm:text-2xl font-bold m-0">
//             Save Graph
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

//         {/* ✅ ADDED: Error message display */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
//             <div className="flex items-center">
//               <span className="text-red-600 mr-2">⚠️</span>
//               <p className="text-red-800 text-sm">{error}</p>
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
//           {/* Graph Name */}
//           <div>
//             <label className="block mb-1 sm:mb-2 font-bold text-gray-700 text-sm sm:text-base">
//               Graph Name *
//             </label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({...formData, name: e.target.value})}
//               required
//               className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg 
//                          text-sm sm:text-base box-border
//                          focus:ring-2 focus:ring-primary-300 focus:border-primary-500
//                          hover:border-gray-400 transition-colors duration-200"
//               placeholder="e.g., Campus Navigation Map"
//               disabled={saving}
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block mb-1 sm:mb-2 font-bold text-gray-700 text-sm sm:text-base">
//               Description
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({...formData, description: e.target.value})}
//               className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg 
//                          text-sm sm:text-base min-h-[60px] sm:min-h-[80px] resize-y box-border
//                          focus:ring-2 focus:ring-primary-300 focus:border-primary-500
//                          hover:border-gray-400 transition-colors duration-200"
//               placeholder="Describe your graph and its purpose..."
//               disabled={saving}
//             />
//           </div>

//           {/* ✅ REMOVED: Creator Name field - now uses authenticated user */}
//           {/* The backend will automatically use req.user from the JWT token */}

//           {/* Tags */}
//           <div>
//             <label className="block mb-1 sm:mb-2 font-bold text-gray-700 text-sm sm:text-base">
//               Tags (comma-separated)
//             </label>
//             <input
//               type="text"
//               value={formData.tags}
//               onChange={(e) => setFormData({...formData, tags: e.target.value})}
//               className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg 
//                          text-sm sm:text-base box-border
//                          focus:ring-2 focus:ring-primary-300 focus:border-primary-500
//                          hover:border-gray-400 transition-colors duration-200"
//               placeholder="e.g., dijkstra, navigation, campus"
//               disabled={saving}
//             />
//             <p className="text-xs sm:text-sm text-gray-500 mt-1">
//               Help organize your graphs with relevant keywords
//             </p>
//           </div>

//           {/* ✅ ADDED: Graph Statistics */}
//           <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
//             <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Graph Summary</h3>
//             <div className="grid grid-cols-2 gap-4 text-center">
//               <div>
//                 <div className="text-lg sm:text-xl font-bold text-primary-600">{nodes.length}</div>
//                 <div className="text-xs sm:text-sm text-gray-500">Nodes</div>
//               </div>
//               <div>
//                 <div className="text-lg sm:text-xl font-bold text-primary-600">{edges.length}</div>
//                 <div className="text-xs sm:text-sm text-gray-500">Edges</div>
//               </div>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end pt-2 sm:pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={saving}
//               className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 
//                          border border-gray-300 rounded-lg bg-white text-gray-700 
//                          text-sm sm:text-base cursor-pointer hover:bg-gray-50
//                          transition-colors duration-200 order-2 sm:order-1
//                          disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={saving || !formData.name.trim()}
//               className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 
//                          border-0 rounded-lg text-white text-sm sm:text-base
//                          transition-all duration-200 order-1 sm:order-2
//                          ${
//                            saving || !formData.name.trim()
//                              ? 'bg-gray-400 cursor-not-allowed' 
//                              : 'bg-primary-600 cursor-pointer hover:bg-primary-700 transform hover:scale-105 active:scale-95'
//                          }`}
//             >
//               {saving ? (
//                 <span className="flex items-center justify-center">
//                   <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
//                   Saving...
//                 </span>
//               ) : (
//                 'Save Graph'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SaveGraphModal;













// import React, { useState } from 'react';

// function SaveGraphModal({ nodes, edges, onSave, onClose }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     createdBy: 'Lalit Kumar Yadav',
//     tags: ''
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);

//     try {
//       const graphData = {
//         name: formData.name,
//         description: formData.description,
//         nodes: nodes.map((_, index) => ({ id: index })),
//         edges: edges,
//         createdBy: formData.createdBy,
//         tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
//       };

//       const response = await fetch('http://localhost:5000/api/db/graphs', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(graphData),
//       });

//       const result = await response.json();
      
//       if (result.success) {
//         onSave(result.data);
//         onClose();
//       } else {
//         alert('Failed to save graph: ' + result.error);
//       }
//     } catch (error) {
//       console.error('Error saving graph:', error);
//       alert('Failed to save graph. Please try again.');
//     } finally {
//       setSaving(false);
//     }
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
//         maxWidth: '500px',
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
//           <h2 style={{ color: '#2563eb', margin: 0 }}>Save Graph</h2>
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

//         <form onSubmit={handleSubmit}>
//           <div style={{ marginBottom: '1rem' }}>
//             <label style={{
//               display: 'block',
//               marginBottom: '0.5rem',
//               fontWeight: 'bold',
//               color: '#374151'
//             }}>
//               Graph Name *
//             </label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({...formData, name: e.target.value})}
//               required
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 border: '1px solid #d1d5db',
//                 borderRadius: '8px',
//                 fontSize: '1rem',
//                 boxSizing: 'border-box'
//               }}
//               placeholder="e.g., Campus Navigation Map"
//             />
//           </div>

//           <div style={{ marginBottom: '1rem' }}>
//             <label style={{
//               display: 'block',
//               marginBottom: '0.5rem',
//               fontWeight: 'bold',
//               color: '#374151'
//             }}>
//               Description
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({...formData, description: e.target.value})}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 border: '1px solid #d1d5db',
//                 borderRadius: '8px',
//                 fontSize: '1rem',
//                 minHeight: '80px',
//                 resize: 'vertical',
//                 boxSizing: 'border-box'
//               }}
//               placeholder="Describe your graph and its purpose..."
//             />
//           </div>

//           <div style={{ marginBottom: '1rem' }}>
//             <label style={{
//               display: 'block',
//               marginBottom: '0.5rem',
//               fontWeight: 'bold',
//               color: '#374151'
//             }}>
//               Creator Name
//             </label>
//             <input
//               type="text"
//               value={formData.createdBy}
//               onChange={(e) => setFormData({...formData, createdBy: e.target.value})}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 border: '1px solid #d1d5db',
//                 borderRadius: '8px',
//                 fontSize: '1rem',
//                 boxSizing: 'border-box'
//               }}
//             />
//           </div>

//           <div style={{ marginBottom: '1.5rem' }}>
//             <label style={{
//               display: 'block',
//               marginBottom: '0.5rem',
//               fontWeight: 'bold',
//               color: '#374151'
//             }}>
//               Tags (comma-separated)
//             </label>
//             <input
//               type="text"
//               value={formData.tags}
//               onChange={(e) => setFormData({...formData, tags: e.target.value})}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 border: '1px solid #d1d5db',
//                 borderRadius: '8px',
//                 fontSize: '1rem',
//                 boxSizing: 'border-box'
//               }}
//               placeholder="e.g., dijkstra, navigation, campus"
//             />
//           </div>

//           <div style={{
//             display: 'flex',
//             gap: '1rem',
//             justifyContent: 'flex-end'
//           }}>
//             <button
//               type="button"
//               onClick={onClose}
//               style={{
//                 padding: '0.75rem 1.5rem',
//                 border: '1px solid #d1d5db',
//                 borderRadius: '8px',
//                 backgroundColor: 'white',
//                 color: '#374151',
//                 fontSize: '1rem',
//                 cursor: 'pointer'
//               }}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={saving || !formData.name}
//               style={{
//                 padding: '0.75rem 1.5rem',
//                 border: 'none',
//                 borderRadius: '8px',
//                 backgroundColor: saving ? '#9ca3af' : '#2563eb',
//                 color: 'white',
//                 fontSize: '1rem',
//                 cursor: saving ? 'not-allowed' : 'pointer'
//               }}
//             >
//               {saving ? 'Saving...' : 'Save Graph'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SaveGraphModal;
