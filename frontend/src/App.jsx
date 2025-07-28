import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import GraphVisualizer from './components/GraphVisualizer';
import Controls from './components/Controls';
import OutputPanel from './components/OutputPanel';
import SaveGraphModal from './components/SaveGraphModal';
import GraphLibrary from './components/GraphLibrary';
import ResultHistory from './components/ResultHistory';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { runAlgorithm } from './api';

function AppContent() {
  const { user, logout } = useAuth();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [source, setSource] = useState(0);
  const [output, setOutput] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentGraphName, setCurrentGraphName] = useState('');
  const [currentGraphId, setCurrentGraphId] = useState(null);
  
  // Authentication state
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // ✅ UPDATED: Enhanced handleRun with anonymous user prompt
  const handleRun = async (src = source, edg = edges, algo = algorithm)=>{
    if (nodes.length === 0) {
      alert('Please add some nodes first!');
      return;
    }
    
    if (edg.length === 0) {
      alert('Please add some edges first!');
      return;
    }
    
    const requestBody = {
      nodes: nodes.map((_, idx) => idx),
      edges: edg.map(({ from, to, weight }) => ({
        from: from,
        to: to,
        weight: Number(weight)
      })),
      source: src,
      algorithm: algo
    };
    
    try {
      setOutput({ loading: true });
      const startTime = Date.now();
      const result = await runAlgorithm(requestBody);
      const executionTime = Date.now() - startTime;
      
      result.executionTime = executionTime;
      setOutput(result);
      
      // ✅ ADDED: Prompt anonymous users after successful algorithm run
      if (!user && result && !result.error) {
        setTimeout(() => {
          if (window.confirm("🎉 Love these results? Sign up to save and organize your work! It's free and takes just a minute.")) {
            setAuthMode('signup');
            setShowAuth(true);
          }
        }, 2500); // 2.5-second delay to let user see results
      }
      
      // // Save results only if user is authenticated  
      // if (user) {
      //   await saveAlgorithmResult(result, executionTime, src, algo);
      // }
    } catch (error) {
      console.error("Algorithm failed:", error);
      setOutput({ error: `Algorithm failed: ${error.message}` });
    }
  };

//   const saveAlgorithmResult = async (result, executionTime, source, algorithm) => {
//   // Only save if user is authenticated
//   if (!user) {
//     console.log('User not authenticated, skipping result save');
//     return;
//   }

//   try {
//     const resultData = {
//       graphName: currentGraphName || 'Untitled Graph',
//       algorithm,
//       source,
//       result,
//       executionTime,
//       nodeCount: nodes.length,
//       edgeCount: edges.length
//       // Remove createdBy - backend will use authenticated user
//     };

//     const token = localStorage.getItem('token');
//     const response = await fetch('http://localhost:5000/api/graphs/algorithms/results', {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}` // ✅ Added missing auth token
//       },
//       body: JSON.stringify(resultData)
//     });

//     if (response.ok) {
//       const data = await response.json();
//       console.log('Result saved successfully:', data);
//     } else {
//       const errorData = await response.json();
//       console.error('Failed to save result:', errorData);
//     }
//   } catch (error) {
//     console.error('Error saving algorithm result:', error);
//   }
// };


  const handleSaveGraph = (savedGraph) => {
    setCurrentGraphName(savedGraph.name);
    setCurrentGraphId(savedGraph._id);
    alert(`Graph "${savedGraph.name}" saved successfully!`);
  };

  const handleLoadGraph = (graphData) => {
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
    setCurrentGraphName(graphData.name);
    setCurrentGraphId(graphData._id);
    setOutput(null);
    alert(`Graph "${graphData.name}" loaded successfully!`);
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setOutput(null);
    setCurrentGraphName('');
    setCurrentGraphId(null);
  };

  // ✅ ADDED: Enhanced save graph handler with anonymous user prompt
  const handleSaveGraphClick = () => {
    if (!user) {
      if (window.confirm("💾 Sign up to save your graphs and track your algorithm history! Create a free account now?")) {
        setAuthMode('signup');
        setShowAuth(true);
      }
      return;
    }
    setShowSaveModal(true);
  };

  // ✅ ADDED: Enhanced library handler with anonymous user prompt
  const handleLibraryClick = () => {
    if (!user) {
      if (window.confirm("📚 Sign up to access your personal graph library! Create a free account to save and organize your work?")) {
        setAuthMode('signup');
        setShowAuth(true);
      }
      return;
    }
    setShowLibrary(true);
  };

  // ✅ ADDED: Enhanced history handler with anonymous user prompt
  const handleHistoryClick = () => {
    if (!user) {
      if (window.confirm("📈 Sign up to track your algorithm execution history! See your progress and performance over time?")) {
        setAuthMode('signup');
        setShowAuth(true);
      }
      return;
    }
    setShowHistory(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans">
      {/* Header */}
      <header className="text-center py-4 sm:py-6 lg:py-8 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide">
          Shortest Distance Path Visualizer
        </h1>
        {user && currentGraphName && (
          <div className="mt-2 sm:mt-3">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm sm:text-base font-medium">
              Current Graph: {currentGraphName}
            </span>
          </div>
        )}
      </header>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 px-4 mb-6 sm:mb-8">
        {user ? (
          <>
            {/* Authenticated user buttons */}
            <button
              onClick={handleSaveGraphClick}
              disabled={nodes.length === 0}
              className={`
                px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
                rounded-lg font-semibold text-sm sm:text-base
                transition-all duration-200 transform hover:scale-105
                ${nodes.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              <span className="inline sm:hidden">💾 Save</span>
              <span className="hidden sm:inline">💾 Save Graph</span>
            </button>
            
            <button
              onClick={handleLibraryClick}
              className="
                px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
                bg-indigo-500 hover:bg-indigo-600 text-white
                rounded-lg font-semibold text-sm sm:text-base
                transition-all duration-200 transform hover:scale-105
                shadow-lg hover:shadow-xl
              "
            >
              <span className="inline sm:hidden">📚 Load</span>
              <span className="hidden sm:inline">📚 Load Graph</span>
            </button>

            <button
              onClick={handleHistoryClick}
              className="
                px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
                bg-purple-500 hover:bg-purple-600 text-white
                rounded-lg font-semibold text-sm sm:text-base
                transition-all duration-200 transform hover:scale-105
                shadow-lg hover:shadow-xl
              "
            >
              <span className="inline sm:hidden">📈 History</span>
              <span className="hidden sm:inline">📈 View History</span>
            </button>
            
            <button
              onClick={clearGraph}
              disabled={nodes.length === 0}
              className={`
                px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
                rounded-lg font-semibold text-sm sm:text-base
                transition-all duration-200 transform hover:scale-105
                ${nodes.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              <span className="inline sm:hidden">🗑️ Clear</span>
              <span className="hidden sm:inline">🗑️ Clear Graph</span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 ml-4">
              <div className="hidden sm:flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-full">
                <span className="text-sm font-medium">
                  👋 {user.firstName || user.username}
                </span>
              </div>
              <button
                onClick={logout}
                className="
                  px-3 py-2 sm:px-4 sm:py-2.5
                  bg-gray-500 hover:bg-gray-600 text-white
                  rounded-lg font-semibold text-sm sm:text-base
                  transition-all duration-200
                "
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ✅ UPDATED: Enhanced anonymous user buttons with better UX */}
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuth(true);
              }}
              className="
                px-4 py-2 sm:px-6 sm:py-3
                bg-blue-600 hover:bg-blue-700 text-white
                rounded-lg font-semibold text-sm sm:text-base
                transition-all duration-200 transform hover:scale-105
                shadow-lg hover:shadow-xl
              "
            >
              🔐 Login
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuth(true);
              }}
              className="
                px-4 py-2 sm:px-6 sm:py-3
                border-2 border-blue-600 text-blue-600 hover:bg-blue-50
                rounded-lg font-semibold text-sm sm:text-base
                transition-all duration-200 transform hover:scale-105
              "
            >
              ✨ Sign Up Free
            </button>

            {/* ✅ ADDED: Visual cues for anonymous users */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleSaveGraphClick}
                className="
                  px-3 py-2 sm:px-4 sm:py-2.5
                  bg-orange-100 text-orange-700 border border-orange-300
                  rounded-lg font-semibold text-sm sm:text-base
                  transition-all duration-200 hover:bg-orange-200
                "
                title="Sign up to unlock save functionality"
              >
                <span className="inline sm:hidden">🔒 Save</span>
                <span className="hidden sm:inline">🔒 Sign Up to Save</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content - Show different content based on authentication */}
      {user ? (
        <main className="
          flex flex-col lg:flex-row 
          justify-center items-start 
          gap-4 sm:gap-6 lg:gap-8 
          max-w-7xl mx-auto 
          px-4 sm:px-6 lg:px-8
          mb-8
        ">
          {/* Graph Visualizer Section */}
          <section className="
            w-full lg:w-2/3 xl:w-3/5
            bg-white rounded-xl sm:rounded-2xl 
            shadow-lg hover:shadow-xl 
            transition-shadow duration-300
            p-4 sm:p-6 lg:p-8
            min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]
          ">
            <GraphVisualizer nodes={nodes} edges={edges} output={output} />
          </section>
          
          {/* Controls and Output Sidebar */}
          <aside className="
            w-full lg:w-1/3 xl:w-2/5
            flex flex-col gap-4 sm:gap-6
          ">
            {/* Controls Panel */}
            <div className="
              bg-white rounded-xl sm:rounded-2xl 
              shadow-md hover:shadow-lg 
              transition-shadow duration-300
              p-4 sm:p-6
            ">
              <Controls
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
                algorithm={algorithm}
                setAlgorithm={setAlgorithm}
                source={source}
                setSource={setSource}
                onRun={handleRun}
              />
            </div>
            
            {/* Output Panel */}
            <div className="
              bg-gray-50 rounded-xl sm:rounded-2xl 
              shadow-md hover:shadow-lg 
              transition-shadow duration-300
              p-4 sm:p-6
            ">
              <OutputPanel output={output} />
            </div>
          </aside>
        </main>
      ) : (
        /* ✅ UPDATED: Enhanced welcome screen with better messaging */
        <main className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
          <div className="text-center max-w-4xl">
            <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-6 bg-blue-100 rounded-full 
                            flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
              Welcome to Path Visualizer
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              <strong>Try it now!</strong> Create graphs and run algorithms instantly. 
              Sign up to save your work and unlock advanced features - it's completely free!
            </p>
            
            {/* Features Grid (unchanged) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div className="text-2xl sm:text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">Interactive Creation</h3>
                <p className="text-sm text-gray-600">Build graphs with point-and-click interface</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div className="text-2xl sm:text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-800 mb-2">Algorithm Visualization</h3>
                <p className="text-sm text-gray-600">See Dijkstra, Prim's, and more in action</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div className="text-2xl sm:text-3xl mb-3">💾</div>
                <h3 className="font-semibold text-gray-800 mb-2">Private Storage</h3>
                <p className="text-sm text-gray-600">Save and organize your graphs securely</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div className="text-2xl sm:text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-800 mb-2">Execution History</h3>
                <p className="text-sm text-gray-600">Track your algorithm performance</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div className="text-2xl sm:text-3xl mb-3">📱</div>
                <h3 className="font-semibold text-gray-800 mb-2">Responsive Design</h3>
                <p className="text-sm text-gray-600">Works perfectly on all devices</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div className="text-2xl sm:text-3xl mb-3">🔐</div>
                <h3 className="font-semibold text-gray-800 mb-2">Secure & Private</h3>
                <p className="text-sm text-gray-600">Your data stays safe and personal</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuth(true);
                }}
                className="
                  px-6 sm:px-8 py-3 sm:py-4
                  bg-blue-600 hover:bg-blue-700 text-white
                  rounded-lg font-bold text-base sm:text-lg
                  transition-all duration-200 transform hover:scale-105
                  shadow-lg hover:shadow-xl
                "
              >
                🚀 Get Started - Sign Up Free
              </button>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuth(true);
                }}
                className="
                  px-6 sm:px-8 py-3 sm:py-4
                  border-2 border-blue-600 text-blue-600 hover:bg-blue-50
                  rounded-lg font-bold text-base sm:text-lg
                  transition-all duration-200 transform hover:scale-105
                "
              >
                Already have an account?
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Authentication Modals */}
      {showAuth && (
        <>
          {authMode === 'login' ? (
            <Login 
              onClose={() => setShowAuth(false)}
              switchToSignup={() => setAuthMode('signup')}
            />
          ) : (
            <Signup 
              onClose={() => setShowAuth(false)}
              switchToLogin={() => setAuthMode('login')}
            />
          )}
        </>
      )}

      {/* Existing Modals - Only show when authenticated */}
      {user && showSaveModal && (
        <SaveGraphModal
          nodes={nodes}
          edges={edges}
          onSave={handleSaveGraph}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {user && showLibrary && (
        <GraphLibrary
          onLoadGraph={handleLoadGraph}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {user && showHistory && (
        <ResultHistory
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Footer */}
      <footer className="
        bg-white/90 backdrop-blur-sm border-t border-gray-200
        py-6 sm:py-8 text-center
        text-sm sm:text-base text-gray-600 mt-12
      ">
        Made with ❤️ by{' '}
        <a
          href="https://github.com/Lalit-Kumar-Yadav-DTU"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors"
        >
          Lalit Kumar Yadav
        </a>
      </footer>
    </div>
  );
}

// Main App component with AuthProvider wrapper
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;


























// import React, { useState, useEffect } from 'react';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import GraphVisualizer from './components/GraphVisualizer';
// import Controls from './components/Controls';
// import OutputPanel from './components/OutputPanel';
// import SaveGraphModal from './components/SaveGraphModal';
// import GraphLibrary from './components/GraphLibrary';
// import ResultHistory from './components/ResultHistory';
// import Login from './components/Auth/Login';
// import Signup from './components/Auth/Signup';
// import { runAlgorithm } from './api';

// function AppContent() {
//   const { user, logout } = useAuth();
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [algorithm, setAlgorithm] = useState('dijkstra');
//   const [source, setSource] = useState(0);
//   const [output, setOutput] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [showLibrary, setShowLibrary] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [currentGraphName, setCurrentGraphName] = useState('');
//   const [currentGraphId, setCurrentGraphId] = useState(null);
  
//   // Authentication state
//   const [showAuth, setShowAuth] = useState(false);
//   const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

//   const handleRun = async (src = source, edg = edges, algo = algorithm) => {
//     if (nodes.length === 0) {
//       alert('Please add some nodes first!');
//       return;
//     }
    
//     if (edg.length === 0) {
//       alert('Please add some edges first!');
//       return;
//     }
    
//     const requestBody = {
//       nodes: nodes.map((_, idx) => idx),
//       edges: edg.map(({ from, to, weight }) => ({
//         from: from,
//         to: to,
//         weight: Number(weight)
//       })),
//       source: src,
//       algorithm: algo
//     };
    
//     try {
//       setOutput({ loading: true });
//       const startTime = Date.now();
//       const result = await runAlgorithm(requestBody);
//       const executionTime = Date.now() - startTime;
      
//       result.executionTime = executionTime;
//       setOutput(result);
      
//       await saveAlgorithmResult(result, executionTime, src, algo);
//     } catch (error) {
//       console.error("Algorithm failed:", error);
//       setOutput({ error: `Algorithm failed: ${error.message}` });
//     }
//   };

//   const saveAlgorithmResult = async (result, executionTime, source, algorithm) => {
//     try {
//       const resultData = {
//         graphName: currentGraphName || 'Untitled Graph',
//         algorithm,
//         source,
//         result,
//         executionTime,
//         nodeCount: nodes.length,
//         edgeCount: edges.length,
//         createdBy: user ? user.username : 'Guest'
//       };

//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:5000/api/db/graphs/results', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           ...(token && { 'Authorization': `Bearer ${token}` })
//         },
//         body: JSON.stringify(resultData)
//       });

//       if (response.ok) {
//         console.log('Result saved successfully!');
//       } else {
//         console.error('Failed to save result:', response.status);
//       }
//     } catch (error) {
//       console.error('Error saving algorithm result:', error);
//     }
//   };

//   const handleSaveGraph = (savedGraph) => {
//     setCurrentGraphName(savedGraph.name);
//     setCurrentGraphId(savedGraph._id);
//     alert(`Graph "${savedGraph.name}" saved successfully!`);
//   };

//   const handleLoadGraph = (graphData) => {
//     setNodes(graphData.nodes);
//     setEdges(graphData.edges);
//     setCurrentGraphName(graphData.name);
//     setCurrentGraphId(graphData._id);
//     setOutput(null);
//     alert(`Graph "${graphData.name}" loaded successfully!`);
//   };

//   const clearGraph = () => {
//     setNodes([]);
//     setEdges([]);
//     setOutput(null);
//     setCurrentGraphName('');
//     setCurrentGraphId(null);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans">
//       {/* Header */}
//       <header className="text-center py-4 sm:py-6 lg:py-8 px-4">
//         <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide">
//           Shortest Distance Path Visualizer
//         </h1>
//         {user && currentGraphName && (
//           <div className="mt-2 sm:mt-3">
//             <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm sm:text-base font-medium">
//               Current Graph: {currentGraphName}
//             </span>
//           </div>
//         )}
//       </header>

//       {/* Action Buttons */}
//       <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 px-4 mb-6 sm:mb-8">
//         {user ? (
//           <>
//             {/* Existing buttons - only show when authenticated */}
//             <button
//               onClick={() => setShowSaveModal(true)}
//               disabled={nodes.length === 0}
//               className={`
//                 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//                 rounded-lg font-semibold text-sm sm:text-base
//                 transition-all duration-200 transform hover:scale-105
//                 ${nodes.length === 0 
//                   ? 'bg-gray-400 cursor-not-allowed text-white' 
//                   : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
//                 }
//               `}
//             >
//               <span className="inline sm:hidden">💾 Save</span>
//               <span className="hidden sm:inline">💾 Save Graph</span>
//             </button>
            
//             <button
//               onClick={() => setShowLibrary(true)}
//               className="
//                 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//                 bg-indigo-500 hover:bg-indigo-600 text-white
//                 rounded-lg font-semibold text-sm sm:text-base
//                 transition-all duration-200 transform hover:scale-105
//                 shadow-lg hover:shadow-xl
//               "
//             >
//               <span className="inline sm:hidden">📚 Load</span>
//               <span className="hidden sm:inline">📚 Load Graph</span>
//             </button>

//             <button
//               onClick={() => setShowHistory(true)}
//               className="
//                 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//                 bg-purple-500 hover:bg-purple-600 text-white
//                 rounded-lg font-semibold text-sm sm:text-base
//                 transition-all duration-200 transform hover:scale-105
//                 shadow-lg hover:shadow-xl
//               "
//             >
//               <span className="inline sm:hidden">📈 History</span>
//               <span className="hidden sm:inline">📈 View History</span>
//             </button>
            
//             <button
//               onClick={clearGraph}
//               disabled={nodes.length === 0}
//               className={`
//                 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//                 rounded-lg font-semibold text-sm sm:text-base
//                 transition-all duration-200 transform hover:scale-105
//                 ${nodes.length === 0 
//                   ? 'bg-gray-400 cursor-not-allowed text-white' 
//                   : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
//                 }
//               `}
//             >
//               <span className="inline sm:hidden">🗑️ Clear</span>
//               <span className="hidden sm:inline">🗑️ Clear Graph</span>
//             </button>

//             {/* User Menu */}
//             <div className="flex items-center gap-2 ml-4">
//               <div className="hidden sm:flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-full">
//                 <span className="text-sm font-medium">
//                   👋 {user.firstName || user.username}
//                 </span>
//               </div>
//               <button
//                 onClick={logout}
//                 className="
//                   px-3 py-2 sm:px-4 sm:py-2.5
//                   bg-gray-500 hover:bg-gray-600 text-white
//                   rounded-lg font-semibold text-sm sm:text-base
//                   transition-all duration-200
//                 "
//               >
//                 Logout
//               </button>
//             </div>
//           </>
//         ) : (
//           <>
//             {/* Authentication buttons when not logged in */}
//             <button
//               onClick={() => {
//                 setAuthMode('login');
//                 setShowAuth(true);
//               }}
//               className="
//                 px-4 py-2 sm:px-6 sm:py-3
//                 bg-blue-600 hover:bg-blue-700 text-white
//                 rounded-lg font-semibold text-sm sm:text-base
//                 transition-all duration-200 transform hover:scale-105
//                 shadow-lg hover:shadow-xl
//               "
//             >
//               🔐 Login
//             </button>
//             <button
//               onClick={() => {
//                 setAuthMode('signup');
//                 setShowAuth(true);
//               }}
//               className="
//                 px-4 py-2 sm:px-6 sm:py-3
//                 border-2 border-blue-600 text-blue-600 hover:bg-blue-50
//                 rounded-lg font-semibold text-sm sm:text-base
//                 transition-all duration-200 transform hover:scale-105
//               "
//             >
//               ✨ Sign Up
//             </button>
//           </>
//         )}
//       </div>

//       {/* Main Content - Show different content based on authentication */}
//       {user ? (
//         <main className="
//           flex flex-col lg:flex-row 
//           justify-center items-start 
//           gap-4 sm:gap-6 lg:gap-8 
//           max-w-7xl mx-auto 
//           px-4 sm:px-6 lg:px-8
//           mb-8
//         ">
//           {/* Graph Visualizer Section */}
//           <section className="
//             w-full lg:w-2/3 xl:w-3/5
//             bg-white rounded-xl sm:rounded-2xl 
//             shadow-lg hover:shadow-xl 
//             transition-shadow duration-300
//             p-4 sm:p-6 lg:p-8
//             min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]
//           ">
//             <GraphVisualizer nodes={nodes} edges={edges} output={output} />
//           </section>
          
//           {/* Controls and Output Sidebar */}
//           <aside className="
//             w-full lg:w-1/3 xl:w-2/5
//             flex flex-col gap-4 sm:gap-6
//           ">
//             {/* Controls Panel */}
//             <div className="
//               bg-white rounded-xl sm:rounded-2xl 
//               shadow-md hover:shadow-lg 
//               transition-shadow duration-300
//               p-4 sm:p-6
//             ">
//               <Controls
//                 nodes={nodes}
//                 setNodes={setNodes}
//                 edges={edges}
//                 setEdges={setEdges}
//                 algorithm={algorithm}
//                 setAlgorithm={setAlgorithm}
//                 source={source}
//                 setSource={setSource}
//                 onRun={handleRun}
//               />
//             </div>
            
//             {/* Output Panel */}
//             <div className="
//               bg-gray-50 rounded-xl sm:rounded-2xl 
//               shadow-md hover:shadow-lg 
//               transition-shadow duration-300
//               p-4 sm:p-6
//             ">
//               <OutputPanel output={output} />
//             </div>
//           </aside>
//         </main>
//       ) : (
//         /* Welcome screen for unauthenticated users */
//         <main className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
//           <div className="text-center max-w-4xl">
//             <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-6 bg-blue-100 rounded-full 
//                             flex items-center justify-center">
//               <span className="text-3xl sm:text-4xl">🎯</span>
//             </div>
//             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
//               Welcome to Path Visualizer
//             </h2>
//             <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
//               Create an account to start visualizing graph algorithms, save your work privately, 
//               and track your progress. Your graphs and results will be secure and personal to you.
//             </p>
            
//             {/* Features Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
//               <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
//                 <div className="text-2xl sm:text-3xl mb-3">🎯</div>
//                 <h3 className="font-semibold text-gray-800 mb-2">Interactive Creation</h3>
//                 <p className="text-sm text-gray-600">Build graphs with point-and-click interface</p>
//               </div>
//               <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
//                 <div className="text-2xl sm:text-3xl mb-3">⚡</div>
//                 <h3 className="font-semibold text-gray-800 mb-2">Algorithm Visualization</h3>
//                 <p className="text-sm text-gray-600">See Dijkstra, Prim's, and more in action</p>
//               </div>
//               <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
//                 <div className="text-2xl sm:text-3xl mb-3">💾</div>
//                 <h3 className="font-semibold text-gray-800 mb-2">Private Storage</h3>
//                 <p className="text-sm text-gray-600">Save and organize your graphs securely</p>
//               </div>
//               <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
//                 <div className="text-2xl sm:text-3xl mb-3">📊</div>
//                 <h3 className="font-semibold text-gray-800 mb-2">Execution History</h3>
//                 <p className="text-sm text-gray-600">Track your algorithm performance</p>
//               </div>
//               <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
//                 <div className="text-2xl sm:text-3xl mb-3">📱</div>
//                 <h3 className="font-semibold text-gray-800 mb-2">Responsive Design</h3>
//                 <p className="text-sm text-gray-600">Works perfectly on all devices</p>
//               </div>
//               <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
//                 <div className="text-2xl sm:text-3xl mb-3">🔐</div>
//                 <h3 className="font-semibold text-gray-800 mb-2">Secure & Private</h3>
//                 <p className="text-sm text-gray-600">Your data stays safe and personal</p>
//               </div>
//             </div>

//             {/* Call to Action */}
//             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
//               <button
//                 onClick={() => {
//                   setAuthMode('signup');
//                   setShowAuth(true);
//                 }}
//                 className="
//                   px-6 sm:px-8 py-3 sm:py-4
//                   bg-blue-600 hover:bg-blue-700 text-white
//                   rounded-lg font-bold text-base sm:text-lg
//                   transition-all duration-200 transform hover:scale-105
//                   shadow-lg hover:shadow-xl
//                 "
//               >
//                 🚀 Get Started - Sign Up Free
//               </button>
//               <button
//                 onClick={() => {
//                   setAuthMode('login');
//                   setShowAuth(true);
//                 }}
//                 className="
//                   px-6 sm:px-8 py-3 sm:py-4
//                   border-2 border-blue-600 text-blue-600 hover:bg-blue-50
//                   rounded-lg font-bold text-base sm:text-lg
//                   transition-all duration-200 transform hover:scale-105
//                 "
//               >
//                 Already have an account?
//               </button>
//             </div>
//           </div>
//         </main>
//       )}

//       {/* Authentication Modals */}
//       {showAuth && (
//         <>
//           {authMode === 'login' ? (
//             <Login 
//               onClose={() => setShowAuth(false)}
//               switchToSignup={() => setAuthMode('signup')}
//             />
//           ) : (
//             <Signup 
//               onClose={() => setShowAuth(false)}
//               switchToLogin={() => setAuthMode('login')}
//             />
//           )}
//         </>
//       )}

//       {/* Existing Modals - Only show when authenticated */}
//       {user && showSaveModal && (
//         <SaveGraphModal
//           nodes={nodes}
//           edges={edges}
//           onSave={handleSaveGraph}
//           onClose={() => setShowSaveModal(false)}
//         />
//       )}

//       {user && showLibrary && (
//         <GraphLibrary
//           onLoadGraph={handleLoadGraph}
//           onClose={() => setShowLibrary(false)}
//         />
//       )}

//       {user && showHistory && (
//         <ResultHistory
//           onClose={() => setShowHistory(false)}
//         />
//       )}

//       {/* Footer */}
//       <footer className="
//         bg-white/90 backdrop-blur-sm border-t border-gray-200
//         py-6 sm:py-8 text-center
//         text-sm sm:text-base text-gray-600 mt-12
//       ">
//         Made with ❤️ by{' '}
//         <a
//           href="https://github.com/Lalit-Kumar-Yadav-DTU"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors"
//         >
//           Lalit Kumar Yadav
//         </a>
//       </footer>
//     </div>
//   );
// }

// // Main App component with AuthProvider wrapper
// function App() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   );
// }

// export default App;













// import React, { useState, useEffect } from 'react';
// import GraphVisualizer from './components/GraphVisualizer';
// import Controls from './components/Controls';
// import OutputPanel from './components/OutputPanel';
// import SaveGraphModal from './components/SaveGraphModal';
// import GraphLibrary from './components/GraphLibrary';
// import ResultHistory from './components/ResultHistory';
// import { runAlgorithm } from './api';

// function App() {
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [algorithm, setAlgorithm] = useState('dijkstra');
//   const [source, setSource] = useState(0);
//   const [output, setOutput] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [showLibrary, setShowLibrary] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [currentGraphName, setCurrentGraphName] = useState('');
//   const [currentGraphId, setCurrentGraphId] = useState(null);

//   const handleRun = async (src = source, edg = edges, algo = algorithm) => {
//     if (nodes.length === 0) {
//       alert('Please add some nodes first!');
//       return;
//     }
    
//     if (edg.length === 0) {
//       alert('Please add some edges first!');
//       return;
//     }
    
//     const requestBody = {
//       nodes: nodes.map((_, idx) => idx),
//       edges: edg.map(({ from, to, weight }) => ({
//         from: from,
//         to: to,
//         weight: Number(weight)
//       })),
//       source: src,
//       algorithm: algo
//     };
    
//     try {
//       setOutput({ loading: true });
//       const startTime = Date.now();
//       const result = await runAlgorithm(requestBody);
//       const executionTime = Date.now() - startTime;
      
//       result.executionTime = executionTime;
//       setOutput(result);
      
//       await saveAlgorithmResult(result, executionTime, src, algo);
//     } catch (error) {
//       console.error("Algorithm failed:", error);
//       setOutput({ error: `Algorithm failed: ${error.message}` });
//     }
//   };

//   const saveAlgorithmResult = async (result, executionTime, source, algorithm) => {
//     try {
//       const resultData = {
//         graphName: currentGraphName || 'Untitled Graph',
//         algorithm,
//         source,
//         result,
//         executionTime,
//         nodeCount: nodes.length,
//         edgeCount: edges.length,
//         createdBy: 'Lalit Kumar Yadav'
//       };

//       const response = await fetch('http://localhost:5000/api/db/graphs/results', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(resultData)
//       });

//       if (response.ok) {
//         console.log('Result saved successfully!');
//       } else {
//         console.error('Failed to save result:', response.status);
//       }
//     } catch (error) {
//       console.error('Error saving algorithm result:', error);
//     }
//   };

//   const handleSaveGraph = (savedGraph) => {
//     setCurrentGraphName(savedGraph.name);
//     setCurrentGraphId(savedGraph._id);
//     alert(`Graph "${savedGraph.name}" saved successfully!`);
//   };

//   const handleLoadGraph = (graphData) => {
//     setNodes(graphData.nodes);
//     setEdges(graphData.edges);
//     setCurrentGraphName(graphData.name);
//     setCurrentGraphId(graphData._id);
//     setOutput(null);
//     alert(`Graph "${graphData.name}" loaded successfully!`);
//   };

//   const clearGraph = () => {
//     setNodes([]);
//     setEdges([]);
//     setOutput(null);
//     setCurrentGraphName('');
//     setCurrentGraphId(null);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans">
//       {/* Header */}
//       <header className="text-center py-4 sm:py-6 lg:py-8 px-4">
//         <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide">
//           Shortest Distance Path Visualizer
//         </h1>
//         {currentGraphName && (
//           <div className="mt-2 sm:mt-3">
//             <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm sm:text-base font-medium">
//               Current Graph: {currentGraphName}
//             </span>
//           </div>
//         )}
//       </header>

//       {/* Action Buttons */}
//       <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 px-4 mb-6 sm:mb-8">
//         <button
//           onClick={() => setShowSaveModal(true)}
//           disabled={nodes.length === 0}
//           className={`
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             ${nodes.length === 0 
//               ? 'bg-gray-400 cursor-not-allowed text-white' 
//               : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
//             }
//           `}
//         >
//           <span className="inline sm:hidden">💾 Save</span>
//           <span className="hidden sm:inline">💾 Save Graph</span>
//         </button>
        
//         <button
//           onClick={() => setShowLibrary(true)}
//           className="
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             bg-indigo-500 hover:bg-indigo-600 text-white
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             shadow-lg hover:shadow-xl
//           "
//         >
//           <span className="inline sm:hidden">📚 Load</span>
//           <span className="hidden sm:inline">📚 Load Graph</span>
//         </button>

//         <button
//           onClick={() => setShowHistory(true)}
//           className="
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             bg-purple-500 hover:bg-purple-600 text-white
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             shadow-lg hover:shadow-xl
//           "
//         >
//           <span className="inline sm:hidden">📈 History</span>
//           <span className="hidden sm:inline">📈 View History</span>
//         </button>
        
//         <button
//           onClick={clearGraph}
//           disabled={nodes.length === 0}
//           className={`
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             ${nodes.length === 0 
//               ? 'bg-gray-400 cursor-not-allowed text-white' 
//               : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
//             }
//           `}
//         >
//           <span className="inline sm:hidden">🗑️ Clear</span>
//           <span className="hidden sm:inline">🗑️ Clear Graph</span>
//         </button>
//       </div>

//       {/* Main Content - Removed excessive bottom padding since footer is not fixed */}
//       <main className="
//         flex flex-col lg:flex-row 
//         justify-center items-start 
//         gap-4 sm:gap-6 lg:gap-8 
//         max-w-7xl mx-auto 
//         px-4 sm:px-6 lg:px-8
//         mb-8
//       ">
//         {/* Graph Visualizer Section */}
//         <section className="
//           w-full lg:w-2/3 xl:w-3/5
//           bg-white rounded-xl sm:rounded-2xl 
//           shadow-lg hover:shadow-xl 
//           transition-shadow duration-300
//           p-4 sm:p-6 lg:p-8
//           min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]
//         ">
//           <GraphVisualizer nodes={nodes} edges={edges} output={output} />
//         </section>
        
//         {/* Controls and Output Sidebar */}
//         <aside className="
//           w-full lg:w-1/3 xl:w-2/5
//           flex flex-col gap-4 sm:gap-6
//         ">
//           {/* Controls Panel */}
//           <div className="
//             bg-white rounded-xl sm:rounded-2xl 
//             shadow-md hover:shadow-lg 
//             transition-shadow duration-300
//             p-4 sm:p-6
//           ">
//             <Controls
//               nodes={nodes}
//               setNodes={setNodes}
//               edges={edges}
//               setEdges={setEdges}
//               algorithm={algorithm}
//               setAlgorithm={setAlgorithm}
//               source={source}
//               setSource={setSource}
//               onRun={handleRun}
//             />
//           </div>
          
//           {/* Output Panel */}
//           <div className="
//             bg-gray-50 rounded-xl sm:rounded-2xl 
//             shadow-md hover:shadow-lg 
//             transition-shadow duration-300
//             p-4 sm:p-6
//           ">
//             <OutputPanel output={output} />
//           </div>
//         </aside>
//       </main>

//       {/* Modals */}
//       {showSaveModal && (
//         <SaveGraphModal
//           nodes={nodes}
//           edges={edges}
//           onSave={handleSaveGraph}
//           onClose={() => setShowSaveModal(false)}
//         />
//       )}

//       {showLibrary && (
//         <GraphLibrary
//           onLoadGraph={handleLoadGraph}
//           onClose={() => setShowLibrary(false)}
//         />
//       )}

//       {showHistory && (
//         <ResultHistory
//           onClose={() => setShowHistory(false)}
//         />
//       )}

//       {/* Footer - Now in normal document flow */}
//       <footer className="
//         bg-white/90 backdrop-blur-sm border-t border-gray-200
//         py-6 sm:py-8 text-center
//         text-sm sm:text-base text-gray-600 mt-12
//       ">
//         Made with ❤️ by{' '}
//         <a
//           href="https://github.com/Lalit-Kumar-Yadav-DTU"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors"
//         >
//           Lalit Kumar Yadav
//         </a>
//       </footer>
//     </div>
//   );
// }

// export default App;





















// import React, { useState, useEffect } from 'react';
// import GraphVisualizer from './components/GraphVisualizer';
// import Controls from './components/Controls';
// import OutputPanel from './components/OutputPanel';
// import SaveGraphModal from './components/SaveGraphModal';
// import GraphLibrary from './components/GraphLibrary';
// import ResultHistory from './components/ResultHistory';
// import { runAlgorithm } from './api';

// function App() {
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [algorithm, setAlgorithm] = useState('dijkstra');
//   const [source, setSource] = useState(0);
//   const [output, setOutput] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [showLibrary, setShowLibrary] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [currentGraphName, setCurrentGraphName] = useState('');
//   const [currentGraphId, setCurrentGraphId] = useState(null);

//   const handleRun = async (src = source, edg = edges, algo = algorithm) => {
//     if (nodes.length === 0) {
//       alert('Please add some nodes first!');
//       return;
//     }
    
//     if (edg.length === 0) {
//       alert('Please add some edges first!');
//       return;
//     }
    
//     const requestBody = {
//       nodes: nodes.map((_, idx) => idx),
//       edges: edg.map(({ from, to, weight }) => ({
//         from: from,
//         to: to,
//         weight: Number(weight)
//       })),
//       source: src,
//       algorithm: algo
//     };
    
//     try {
//       setOutput({ loading: true });
//       const startTime = Date.now();
//       const result = await runAlgorithm(requestBody);
//       const executionTime = Date.now() - startTime;
      
//       result.executionTime = executionTime;
//       setOutput(result);
      
//       await saveAlgorithmResult(result, executionTime, src, algo);
//     } catch (error) {
//       console.error("Algorithm failed:", error);
//       setOutput({ error: `Algorithm failed: ${error.message}` });
//     }
//   };

//   const saveAlgorithmResult = async (result, executionTime, source, algorithm) => {
//     try {
//       const resultData = {
//         graphName: currentGraphName || 'Untitled Graph',
//         algorithm,
//         source,
//         result,
//         executionTime,
//         nodeCount: nodes.length,
//         edgeCount: edges.length,
//         createdBy: 'Lalit Kumar Yadav'
//       };

//       const response = await fetch('http://localhost:5000/api/db/graphs/results', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(resultData)
//       });

//       if (response.ok) {
//         console.log('Result saved successfully!');
//       } else {
//         console.error('Failed to save result:', response.status);
//       }
//     } catch (error) {
//       console.error('Error saving algorithm result:', error);
//     }
//   };

//   const handleSaveGraph = (savedGraph) => {
//     setCurrentGraphName(savedGraph.name);
//     setCurrentGraphId(savedGraph._id);
//     alert(`Graph "${savedGraph.name}" saved successfully!`);
//   };

//   const handleLoadGraph = (graphData) => {
//     setNodes(graphData.nodes);
//     setEdges(graphData.edges);
//     setCurrentGraphName(graphData.name);
//     setCurrentGraphId(graphData._id);
//     setOutput(null);
//     alert(`Graph "${graphData.name}" loaded successfully!`);
//   };

//   const clearGraph = () => {
//     setNodes([]);
//     setEdges([]);
//     setOutput(null);
//     setCurrentGraphName('');
//     setCurrentGraphId(null);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans">
//       {/* Header */}
//       <header className="text-center py-4 sm:py-6 lg:py-8 px-4">
//         <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide">
//           Shortest Distance Path Visualizer
//         </h1>
//         {currentGraphName && (
//           <div className="mt-2 sm:mt-3">
//             <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm sm:text-base font-medium">
//               Current Graph: {currentGraphName}
//             </span>
//           </div>
//         )}
//       </header>

//       {/* Action Buttons */}
//       <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 px-4 mb-6 sm:mb-8">
//         <button
//           onClick={() => setShowSaveModal(true)}
//           disabled={nodes.length === 0}
//           className={`
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             ${nodes.length === 0 
//               ? 'bg-gray-400 cursor-not-allowed text-white' 
//               : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
//             }
//           `}
//         >
//           <span className="inline sm:hidden">💾 Save</span>
//           <span className="hidden sm:inline">💾 Save Graph</span>
//         </button>
        
//         <button
//           onClick={() => setShowLibrary(true)}
//           className="
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             bg-indigo-500 hover:bg-indigo-600 text-white
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             shadow-lg hover:shadow-xl
//           "
//         >
//           <span className="inline sm:hidden">📚 Load</span>
//           <span className="hidden sm:inline">📚 Load Graph</span>
//         </button>

//         <button
//           onClick={() => setShowHistory(true)}
//           className="
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             bg-purple-500 hover:bg-purple-600 text-white
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             shadow-lg hover:shadow-xl
//           "
//         >
//           <span className="inline sm:hidden">📈 History</span>
//           <span className="hidden sm:inline">📈 View History</span>
//         </button>
        
//         <button
//           onClick={clearGraph}
//           disabled={nodes.length === 0}
//           className={`
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             ${nodes.length === 0 
//               ? 'bg-gray-400 cursor-not-allowed text-white' 
//               : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
//             }
//           `}
//         >
//           <span className="inline sm:hidden">🗑️ Clear</span>
//           <span className="hidden sm:inline">🗑️ Clear Graph</span>
//         </button>
//       </div>

//       {/* Main Content - FIXED: Increased bottom padding for mobile */}
//       <main className="
//         flex flex-col lg:flex-row 
//         justify-center items-start 
//         gap-4 sm:gap-6 lg:gap-8 
//         max-w-7xl mx-auto 
//         px-4 sm:px-6 lg:px-8
//         pb-28 sm:pb-24 lg:pb-20
//       ">
//         {/* Graph Visualizer Section */}
//         <section className="
//           w-full lg:w-2/3 xl:w-3/5
//           bg-white rounded-xl sm:rounded-2xl 
//           shadow-lg hover:shadow-xl 
//           transition-shadow duration-300
//           p-4 sm:p-6 lg:p-8
//           min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]
//         ">
//           <GraphVisualizer nodes={nodes} edges={edges} output={output} />
//         </section>
        
//         {/* Controls and Output Sidebar */}
//         <aside className="
//           w-full lg:w-1/3 xl:w-2/5
//           flex flex-col gap-4 sm:gap-6
//         ">
//           {/* Controls Panel */}
//           <div className="
//             bg-white rounded-xl sm:rounded-2xl 
//             shadow-md hover:shadow-lg 
//             transition-shadow duration-300
//             p-4 sm:p-6
//           ">
//             <Controls
//               nodes={nodes}
//               setNodes={setNodes}
//               edges={edges}
//               setEdges={setEdges}
//               algorithm={algorithm}
//               setAlgorithm={setAlgorithm}
//               source={source}
//               setSource={setSource}
//               onRun={handleRun}
//             />
//           </div>
          
//           {/* Output Panel */}
//           <div className="
//             bg-gray-50 rounded-xl sm:rounded-2xl 
//             shadow-md hover:shadow-lg 
//             transition-shadow duration-300
//             p-4 sm:p-6
//           ">
//             <OutputPanel output={output} />
//           </div>
//         </aside>
//       </main>

//       {/* Modals */}
//       {showSaveModal && (
//         <SaveGraphModal
//           nodes={nodes}
//           edges={edges}
//           onSave={handleSaveGraph}
//           onClose={() => setShowSaveModal(false)}
//         />
//       )}

//       {showLibrary && (
//         <GraphLibrary
//           onLoadGraph={handleLoadGraph}
//           onClose={() => setShowLibrary(false)}
//         />
//       )}

//       {showHistory && (
//         <ResultHistory
//           onClose={() => setShowHistory(false)}
//         />
//       )}

//       {/* Footer - FIXED: Added safe area support and better mobile handling */}
//       <footer className="
//         fixed bottom-0 left-0 right-0 z-50
//         bg-white/90 backdrop-blur-sm border-t border-gray-200
//         py-2 sm:py-3 text-center
//         text-xs sm:text-sm lg:text-base text-gray-600
//         pb-safe-area-inset-bottom
//         min-h-[60px] sm:min-h-[56px]
//       ">
//         <div className="flex items-center justify-center h-full">
//           Made with ❤️ by{' '}
//           <a
//             href="https://github.com/Lalit-Kumar-Yadav-DTU"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors ml-1"
//           >
//             Lalit Kumar Yadav
//           </a>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default App;

















// import React, { useState, useEffect } from 'react';
// import GraphVisualizer from './components/GraphVisualizer';
// import Controls from './components/Controls';
// import OutputPanel from './components/OutputPanel';
// import SaveGraphModal from './components/SaveGraphModal';
// import GraphLibrary from './components/GraphLibrary';
// import ResultHistory from './components/ResultHistory';
// import { runAlgorithm } from './api';

// function App() {
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [algorithm, setAlgorithm] = useState('dijkstra');
//   const [source, setSource] = useState(0);
//   const [output, setOutput] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [showLibrary, setShowLibrary] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [currentGraphName, setCurrentGraphName] = useState('');
//   const [currentGraphId, setCurrentGraphId] = useState(null);

//   const handleRun = async (src = source, edg = edges, algo = algorithm) => {
//     if (nodes.length === 0) {
//       alert('Please add some nodes first!');
//       return;
//     }
    
//     if (edg.length === 0) {
//       alert('Please add some edges first!');
//       return;
//     }
    
//     const requestBody = {
//       nodes: nodes.map((_, idx) => idx),
//       edges: edg.map(({ from, to, weight }) => ({
//         from: from,
//         to: to,
//         weight: Number(weight)
//       })),
//       source: src,
//       algorithm: algo
//     };
    
//     try {
//       setOutput({ loading: true });
//       const startTime = Date.now();
//       const result = await runAlgorithm(requestBody);
//       const executionTime = Date.now() - startTime;
      
//       result.executionTime = executionTime;
//       setOutput(result);
      
//       await saveAlgorithmResult(result, executionTime, src, algo);
//     } catch (error) {
//       console.error("Algorithm failed:", error);
//       setOutput({ error: `Algorithm failed: ${error.message}` });
//     }
//   };

//   const saveAlgorithmResult = async (result, executionTime, source, algorithm) => {
//     try {
//       const resultData = {
//         graphName: currentGraphName || 'Untitled Graph',
//         algorithm,
//         source,
//         result,
//         executionTime,
//         nodeCount: nodes.length,
//         edgeCount: edges.length,
//         createdBy: 'Lalit Kumar Yadav'
//       };

//       const response = await fetch('http://localhost:5000/api/db/graphs/results', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(resultData)
//       });

//       if (response.ok) {
//         console.log('Result saved successfully!');
//       } else {
//         console.error('Failed to save result:', response.status);
//       }
//     } catch (error) {
//       console.error('Error saving algorithm result:', error);
//     }
//   };

//   const handleSaveGraph = (savedGraph) => {
//     setCurrentGraphName(savedGraph.name);
//     setCurrentGraphId(savedGraph._id);
//     alert(`Graph "${savedGraph.name}" saved successfully!`);
//   };

//   const handleLoadGraph = (graphData) => {
//     setNodes(graphData.nodes);
//     setEdges(graphData.edges);
//     setCurrentGraphName(graphData.name);
//     setCurrentGraphId(graphData._id);
//     setOutput(null);
//     alert(`Graph "${graphData.name}" loaded successfully!`);
//   };

//   const clearGraph = () => {
//     setNodes([]);
//     setEdges([]);
//     setOutput(null);
//     setCurrentGraphName('');
//     setCurrentGraphId(null);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans">
//       {/* Header */}
//       <header className="text-center py-4 sm:py-6 lg:py-8 px-4">
//         <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide">
//           Shortest Distance Path Visualizer
//         </h1>
//         {currentGraphName && (
//           <div className="mt-2 sm:mt-3">
//             <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm sm:text-base font-medium">
//               Current Graph: {currentGraphName}
//             </span>
//           </div>
//         )}
//       </header>

//       {/* Action Buttons */}
//       <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 px-4 mb-6 sm:mb-8">
//         <button
//           onClick={() => setShowSaveModal(true)}
//           disabled={nodes.length === 0}
//           className={`
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             ${nodes.length === 0 
//               ? 'bg-gray-400 cursor-not-allowed text-white' 
//               : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
//             }
//           `}
//         >
//           <span className="inline sm:hidden">💾 Save</span>
//           <span className="hidden sm:inline">💾 Save Graph</span>
//         </button>
        
//         <button
//           onClick={() => setShowLibrary(true)}
//           className="
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             bg-indigo-500 hover:bg-indigo-600 text-white
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             shadow-lg hover:shadow-xl
//           "
//         >
//           <span className="inline sm:hidden">📚 Load</span>
//           <span className="hidden sm:inline">📚 Load Graph</span>
//         </button>

//         <button
//           onClick={() => setShowHistory(true)}
//           className="
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             bg-purple-500 hover:bg-purple-600 text-white
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             shadow-lg hover:shadow-xl
//           "
//         >
//           <span className="inline sm:hidden">📈 History</span>
//           <span className="hidden sm:inline">📈 View History</span>
//         </button>
        
//         <button
//           onClick={clearGraph}
//           disabled={nodes.length === 0}
//           className={`
//             px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3
//             rounded-lg font-semibold text-sm sm:text-base
//             transition-all duration-200 transform hover:scale-105
//             ${nodes.length === 0 
//               ? 'bg-gray-400 cursor-not-allowed text-white' 
//               : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
//             }
//           `}
//         >
//           <span className="inline sm:hidden">🗑️ Clear</span>
//           <span className="hidden sm:inline">🗑️ Clear Graph</span>
//         </button>
//       </div>

//       {/* Main Content */}
//       <main className="
//         flex flex-col lg:flex-row 
//         justify-center items-start 
//         gap-4 sm:gap-6 lg:gap-8 
//         max-w-7xl mx-auto 
//         px-4 sm:px-6 lg:px-8
//         pb-20
//       ">
//         {/* Graph Visualizer Section */}
//         <section className="
//           w-full lg:w-2/3 xl:w-3/5
//           bg-white rounded-xl sm:rounded-2xl 
//           shadow-lg hover:shadow-xl 
//           transition-shadow duration-300
//           p-4 sm:p-6 lg:p-8
//           min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]
//         ">
//           <GraphVisualizer nodes={nodes} edges={edges} output={output} />
//         </section>
        
//         {/* Controls and Output Sidebar */}
//         <aside className="
//           w-full lg:w-1/3 xl:w-2/5
//           flex flex-col gap-4 sm:gap-6
//         ">
//           {/* Controls Panel */}
//           <div className="
//             bg-white rounded-xl sm:rounded-2xl 
//             shadow-md hover:shadow-lg 
//             transition-shadow duration-300
//             p-4 sm:p-6
//           ">
//             <Controls
//               nodes={nodes}
//               setNodes={setNodes}
//               edges={edges}
//               setEdges={setEdges}
//               algorithm={algorithm}
//               setAlgorithm={setAlgorithm}
//               source={source}
//               setSource={setSource}
//               onRun={handleRun}
//             />
//           </div>
          
//           {/* Output Panel */}
//           <div className="
//             bg-gray-50 rounded-xl sm:rounded-2xl 
//             shadow-md hover:shadow-lg 
//             transition-shadow duration-300
//             p-4 sm:p-6
//           ">
//             <OutputPanel output={output} />
//           </div>
//         </aside>
//       </main>

//       {/* Modals */}
//       {showSaveModal && (
//         <SaveGraphModal
//           nodes={nodes}
//           edges={edges}
//           onSave={handleSaveGraph}
//           onClose={() => setShowSaveModal(false)}
//         />
//       )}

//       {showLibrary && (
//         <GraphLibrary
//           onLoadGraph={handleLoadGraph}
//           onClose={() => setShowLibrary(false)}
//         />
//       )}

//       {showHistory && (
//         <ResultHistory
//           onClose={() => setShowHistory(false)}
//         />
//       )}

//       {/* Footer */}
//       <footer className="
//         fixed bottom-0 left-0 right-0 z-50
//         bg-white/80 backdrop-blur-sm border-t border-gray-200
//         py-2 sm:py-3 text-center
//         text-sm sm:text-base text-gray-600
//       ">
//         Made with ❤️ by{' '}
//         <a
//           href="https://github.com/Lalit-Kumar-Yadav-DTU"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors"
//         >
//           Lalit Kumar Yadav
//         </a>
//       </footer>
//     </div>
//   );
// }

// export default App;















// import React, { useState, useEffect } from 'react';
// import GraphVisualizer from './components/GraphVisualizer';
// import Controls from './components/Controls';
// import OutputPanel from './components/OutputPanel';
// import SaveGraphModal from './components/SaveGraphModal';
// import GraphLibrary from './components/GraphLibrary';
// import ResultHistory from './components/ResultHistory';
// import { runAlgorithm } from './api';


// function App() {
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [algorithm, setAlgorithm] = useState('dijkstra');
//   const [source, setSource] = useState(0);
//   const [output, setOutput] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [showLibrary, setShowLibrary] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [currentGraphName, setCurrentGraphName] = useState('');
//   const [currentGraphId, setCurrentGraphId] = useState(null);
 
//   // Responsive state management
//   const [isMobile, setIsMobile] = useState(false);


//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };


//     checkScreenSize();
//     window.addEventListener('resize', checkScreenSize);
//     return () => window.removeEventListener('resize', checkScreenSize);
//   }, []);


//   const handleRun = async (src = source, edg = edges, algo = algorithm) => {
//     if (nodes.length === 0) {
//       alert('Please add some nodes first!');
//       return;
//     }
   
//     if (edg.length === 0) {
//       alert('Please add some edges first!');
//       return;
//     }
   
//     const requestBody = {
//       nodes: nodes.map((_, idx) => idx),
//       edges: edg.map(({ from, to, weight }) => ({
//         from: from,
//         to: to,
//         weight: Number(weight)
//       })),
//       source: src,
//       algorithm: algo
//     };
   
//     try {
//       setOutput({ loading: true });
//       const startTime = Date.now();
//       const result = await runAlgorithm(requestBody);
//       const executionTime = Date.now() - startTime;
     
//       result.executionTime = executionTime;
//       setOutput(result);
     
//       // Auto-save result to history
//       await saveAlgorithmResult(result, executionTime, src, algo);
//     } catch (error) {
//       console.error("Algorithm failed:", error);
//       setOutput({ error: `Algorithm failed: ${error.message}` });
//     }
//   };


//   const saveAlgorithmResult = async (result, executionTime, source, algorithm) => {
//     try {
//       const resultData = {
//         graphName: currentGraphName || 'Untitled Graph',
//         algorithm,
//         source,
//         result,
//         executionTime,
//         nodeCount: nodes.length,
//         edgeCount: edges.length,
//         createdBy: 'Lalit Kumar Yadav'
//       };


//       console.log('Saving result:', resultData);


//       const response = await fetch('http://localhost:5000/api/db/graphs/results', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(resultData)
//       });


//       if (response.ok) {
//         console.log('Result saved successfully!');
//       } else {
//         console.error('Failed to save result:', response.status);
//       }
//     } catch (error) {
//       console.error('Error saving algorithm result:', error);
//     }
//   };


//   const handleSaveGraph = (savedGraph) => {
//     setCurrentGraphName(savedGraph.name);
//     setCurrentGraphId(savedGraph._id);
//     alert(`Graph "${savedGraph.name}" saved successfully!`);
//   };


//   const handleLoadGraph = (graphData) => {
//     setNodes(graphData.nodes);
//     setEdges(graphData.edges);
//     setCurrentGraphName(graphData.name);
//     setCurrentGraphId(graphData._id);
//     setOutput(null);
//     alert(`Graph "${graphData.name}" loaded successfully!`);
//   };


//   const clearGraph = () => {
//     setNodes([]);
//     setEdges([]);
//     setOutput(null);
//     setCurrentGraphName('');
//     setCurrentGraphId(null);
//   };


//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
//       fontFamily: 'Segoe UI, sans-serif',
//       padding: '0',
//       margin: '0'
//     }}>
//       <header style={{
//         textAlign: 'center',
//         padding: isMobile ? '1rem 0' : '2rem 0 1rem 0',
//         fontSize: isMobile ? '1.8rem' : '2.5rem',
//         fontWeight: 'bold',
//         color: '#3a3a3a',
//         letterSpacing: '1px'
//       }}>
//         Shortest Distance Path Visualizer
//         {currentGraphName && (
//           <div style={{
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             color: '#2563eb',
//             fontWeight: 'normal',
//             marginTop: '0.5rem'
//           }}>
//             Current Graph: {currentGraphName}
//           </div>
//         )}
//       </header>


//       {/* Action Buttons */}
//       <div style={{
//         textAlign: 'center',
//         marginBottom: '1.5rem',
//         display: 'flex',
//         justifyContent: 'center',
//         gap: isMobile ? '0.5rem' : '1rem',
//         flexWrap: 'wrap',
//         padding: '0 1rem'
//       }}>
//         <button
//           onClick={() => setShowSaveModal(true)}
//           disabled={nodes.length === 0}
//           style={{
//             background: nodes.length === 0 ? '#9ca3af' : '#10b981',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
//             fontWeight: 'bold',
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             cursor: nodes.length === 0 ? 'not-allowed' : 'pointer'
//           }}
//         >
//           💾 {isMobile ? 'Save' : 'Save Graph'}
//         </button>
       
//         <button
//           onClick={() => setShowLibrary(true)}
//           style={{
//             background: '#6366f1',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
//             fontWeight: 'bold',
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             cursor: 'pointer'
//           }}
//         >
//           📚 {isMobile ? 'Load' : 'Load Graph'}
//         </button>


//         <button
//           onClick={() => setShowHistory(true)}
//           style={{
//             background: '#8b5cf6',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
//             fontWeight: 'bold',
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             cursor: 'pointer'
//           }}
//         >
//           📈 {isMobile ? 'History' : 'View History'}
//         </button>
       
//         <button
//           onClick={clearGraph}
//           disabled={nodes.length === 0}
//           style={{
//             background: nodes.length === 0 ? '#9ca3af' : '#ef4444',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
//             fontWeight: 'bold',
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             cursor: nodes.length === 0 ? 'not-allowed' : 'pointer'
//           }}
//         >
//           🗑️ {isMobile ? 'Clear' : 'Clear Graph'}
//         </button>
//       </div>


//       <main style={{
//         display: 'flex',
//         flexDirection: isMobile ? 'column' : 'row',
//         justifyContent: 'center',
//         alignItems: 'flex-start',
//         gap: isMobile ? '1rem' : '2rem',
//         margin: '0 auto',
//         maxWidth: '1400px',
//         padding: '0 1rem'
//       }}>
//         <section style={{
//           flex: isMobile ? '1' : '2',
//           width: isMobile ? '100%' : 'auto',
//           minWidth: isMobile ? '100%' : '400px',
//           background: '#fff',
//           borderRadius: '20px',
//           boxShadow: '0 6px 24px rgba(80,120,180,0.10)',
//           padding: isMobile ? '1rem' : '2rem',
//           marginBottom: '2rem'
//         }}>
//           <GraphVisualizer nodes={nodes} edges={edges} output={output} />
//         </section>
       
//         <aside style={{
//           flex: '1',
//           width: isMobile ? '100%' : 'auto',
//           minWidth: isMobile ? '100%' : '300px',
//           display: 'flex',
//           flexDirection: 'column',
//           gap: isMobile ? '1rem' : '2rem'
//         }}>
//           <div style={{
//             background: '#fff',
//             borderRadius: '16px',
//             boxShadow: '0 4px 16px rgba(120,120,120,0.10)',
//             padding: '1.5rem'
//           }}>
//             <Controls
//               nodes={nodes}
//               setNodes={setNodes}
//               edges={edges}
//               setEdges={setEdges}
//               algorithm={algorithm}
//               setAlgorithm={setAlgorithm}
//               source={source}
//               setSource={setSource}
//               onRun={handleRun}
//             />
//           </div>
         
//           <div style={{
//             background: '#f9fafb',
//             borderRadius: '16px',
//             boxShadow: '0 2px 8px rgba(120,120,120,0.07)',
//             padding: '1.5rem'
//           }}>
//             <OutputPanel output={output} />
//           </div>
//         </aside>
//       </main>


//       {/* Modals */}
//       {showSaveModal && (
//         <SaveGraphModal
//           nodes={nodes}
//           edges={edges}
//           onSave={handleSaveGraph}
//           onClose={() => setShowSaveModal(false)}
//         />
//       )}


//       {showLibrary && (
//         <GraphLibrary
//           onLoadGraph={handleLoadGraph}
//           onClose={() => setShowLibrary(false)}
//         />
//       )}


//       {showHistory && (
//         <ResultHistory
//           onClose={() => setShowHistory(false)}
//         />
//       )}


//       <footer style={{
//         width: '100%',
//         textAlign: 'center',
//         padding: '1rem 0',
//         background: 'transparent',
//         fontSize: '1.1rem',
//         color: '#555',
//         position: 'fixed',
//         left: 0,
//         bottom: 0,
//         zIndex: 100
//       }}>
//         Made with ❤️ by <a
//           href="https://github.com/Lalit-Kumar-Yadav-DTU"
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 'bold' }}
//         >
//           Lalit Kumar Yadav
//         </a>
//       </footer>
//     </div>
//   );
// }


// export default App;









// import React, { useState, useEffect } from 'react';
// import GraphVisualizer from './components/GraphVisualizer';
// import Controls from './components/Controls';
// import OutputPanel from './components/OutputPanel';
// import SaveGraphModal from './components/SaveGraphModal';
// import GraphLibrary from './components/GraphLibrary';
// import ResultHistory from './components/ResultHistory';
// import { runAlgorithm } from './api';

// function App() {
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [algorithm, setAlgorithm] = useState('dijkstra');
//   const [source, setSource] = useState(0);
//   const [output, setOutput] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [showLibrary, setShowLibrary] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [currentGraphName, setCurrentGraphName] = useState('');
//   const [currentGraphId, setCurrentGraphId] = useState(null);
  
//   // Responsive state management
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     checkScreenSize();
//     window.addEventListener('resize', checkScreenSize);
//     return () => window.removeEventListener('resize', checkScreenSize);
//   }, []);

//   const handleRun = async (src = source, edg = edges, algo = algorithm) => {
//     if (nodes.length === 0) {
//       alert('Please add some nodes first!');
//       return;
//     }
    
//     if (edg.length === 0) {
//       alert('Please add some edges first!');
//       return;
//     }
    
//     const requestBody = {
//       nodes: nodes.map((_, idx) => idx),
//       edges: edg.map(({ from, to, weight }) => ({
//         from: from,
//         to: to,
//         weight: Number(weight)
//       })),
//       source: src,
//       algorithm: algo
//     };
    
//     try {
//       setOutput({ loading: true });
//       const startTime = Date.now();
//       const result = await runAlgorithm(requestBody);
//       const executionTime = Date.now() - startTime;
      
//       result.executionTime = executionTime;
//       setOutput(result);
      
//       // Auto-save result to history
//       await saveAlgorithmResult(result, executionTime, src, algo);
//     } catch (error) {
//       console.error("Algorithm failed:", error);
//       setOutput({ error: `Algorithm failed: ${error.message}` });
//     }
//   };

//   const saveAlgorithmResult = async (result, executionTime, source, algorithm) => {
//     try {
//       const resultData = {
//         graphName: currentGraphName || 'Untitled Graph',
//         algorithm,
//         source,
//         result,
//         executionTime,
//         nodeCount: nodes.length,
//         edgeCount: edges.length,
//         createdBy: 'Lalit Kumar Yadav'
//       };

//       console.log('Saving result:', resultData);

//       const response = await fetch('http://localhost:5000/api/db/graphs/results', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(resultData)
//       });

//       if (response.ok) {
//         console.log('Result saved successfully!');
//       } else {
//         console.error('Failed to save result:', response.status);
//       }
//     } catch (error) {
//       console.error('Error saving algorithm result:', error);
//     }
//   };

//   const handleSaveGraph = (savedGraph) => {
//     setCurrentGraphName(savedGraph.name);
//     setCurrentGraphId(savedGraph._id);
//     alert(`Graph "${savedGraph.name}" saved successfully!`);
//   };

//   const handleLoadGraph = (graphData) => {
//     setNodes(graphData.nodes);
//     setEdges(graphData.edges);
//     setCurrentGraphName(graphData.name);
//     setCurrentGraphId(graphData._id);
//     setOutput(null);
//     alert(`Graph "${graphData.name}" loaded successfully!`);
//   };

//   const clearGraph = () => {
//     setNodes([]);
//     setEdges([]);
//     setOutput(null);
//     setCurrentGraphName('');
//     setCurrentGraphId(null);
//   };

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
//       fontFamily: 'Segoe UI, sans-serif',
//       padding: '0',
//       margin: '0'
//     }}>
//       <header style={{
//         textAlign: 'center',
//         padding: isMobile ? '1rem 0' : '2rem 0 1rem 0',
//         fontSize: isMobile ? '1.8rem' : '2.5rem',
//         fontWeight: 'bold',
//         color: '#3a3a3a',
//         letterSpacing: '1px'
//       }}>
//         Shortest Distance Path Visualizer
//         {currentGraphName && (
//           <div style={{
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             color: '#2563eb',
//             fontWeight: 'normal',
//             marginTop: '0.5rem'
//           }}>
//             Current Graph: {currentGraphName}
//           </div>
//         )}
//       </header>

//       {/* Action Buttons */}
//       <div style={{
//         textAlign: 'center',
//         marginBottom: '1.5rem',
//         display: 'flex',
//         justifyContent: 'center',
//         gap: isMobile ? '0.5rem' : '1rem',
//         flexWrap: 'wrap',
//         padding: '0 1rem'
//       }}>
//         <button
//           onClick={() => setShowSaveModal(true)}
//           disabled={nodes.length === 0}
//           style={{
//             background: nodes.length === 0 ? '#9ca3af' : '#10b981',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
//             fontWeight: 'bold',
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             cursor: nodes.length === 0 ? 'not-allowed' : 'pointer'
//           }}
//         >
//           💾 {isMobile ? 'Save' : 'Save Graph'}
//         </button>
        
//         <button
//           onClick={() => setShowLibrary(true)}
//           style={{
//             background: '#6366f1',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
//             fontWeight: 'bold',
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             cursor: 'pointer'
//           }}
//         >
//           📚 {isMobile ? 'Load' : 'Load Graph'}
//         </button>

//         <button
//           onClick={() => setShowHistory(true)}
//           style={{
//             background: '#8b5cf6',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
//             fontWeight: 'bold',
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             cursor: 'pointer'
//           }}
//         >
//           📈 {isMobile ? 'History' : 'View History'}
//         </button>
        
//         <button
//           onClick={clearGraph}
//           disabled={nodes.length === 0}
//           style={{
//             background: nodes.length === 0 ? '#9ca3af' : '#ef4444',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
//             fontWeight: 'bold',
//             fontSize: isMobile ? '0.9rem' : '1rem',
//             cursor: nodes.length === 0 ? 'not-allowed' : 'pointer'
//           }}
//         >
//           🗑️ {isMobile ? 'Clear' : 'Clear Graph'}
//         </button>
//       </div>

//       <main style={{
//         display: 'flex',
//         flexDirection: isMobile ? 'column' : 'row',
//         justifyContent: 'center',
//         alignItems: 'flex-start',
//         gap: isMobile ? '1rem' : '2rem',
//         margin: '0 auto',
//         maxWidth: '1400px',
//         padding: '0 1rem'
//       }}>
//         <section style={{
//           flex: isMobile ? '1' : '2',
//           width: isMobile ? '100%' : 'auto',
//           minWidth: isMobile ? '100%' : '400px',
//           background: '#fff',
//           borderRadius: '20px',
//           boxShadow: '0 6px 24px rgba(80,120,180,0.10)',
//           padding: isMobile ? '1rem' : '2rem',
//           marginBottom: '2rem'
//         }}>
//           <GraphVisualizer nodes={nodes} edges={edges} output={output} />
//         </section>
        
//         <aside style={{
//           flex: '1',
//           width: isMobile ? '100%' : 'auto',
//           minWidth: isMobile ? '100%' : '300px',
//           display: 'flex',
//           flexDirection: 'column',
//           gap: isMobile ? '1rem' : '2rem'
//         }}>
//           <div style={{
//             background: '#fff',
//             borderRadius: '16px',
//             boxShadow: '0 4px 16px rgba(120,120,120,0.10)',
//             padding: '1.5rem'
//           }}>
//             <Controls
//               nodes={nodes}
//               setNodes={setNodes}
//               edges={edges}
//               setEdges={setEdges}
//               algorithm={algorithm}
//               setAlgorithm={setAlgorithm}
//               source={source}
//               setSource={setSource}
//               onRun={handleRun}
//             />
//           </div>
          
//           <div style={{
//             background: '#f9fafb',
//             borderRadius: '16px',
//             boxShadow: '0 2px 8px rgba(120,120,120,0.07)',
//             padding: '1.5rem'
//           }}>
//             <OutputPanel output={output} />
//           </div>
//         </aside>
//       </main>

//       {/* Modals */}
//       {showSaveModal && (
//         <SaveGraphModal
//           nodes={nodes}
//           edges={edges}
//           onSave={handleSaveGraph}
//           onClose={() => setShowSaveModal(false)}
//         />
//       )}

//       {showLibrary && (
//         <GraphLibrary
//           onLoadGraph={handleLoadGraph}
//           onClose={() => setShowLibrary(false)}
//         />
//       )}

//       {showHistory && (
//         <ResultHistory
//           onClose={() => setShowHistory(false)}
//         />
//       )}

//       <footer style={{
//         width: '100%',
//         textAlign: 'center',
//         padding: '1rem 0',
//         background: 'transparent',
//         fontSize: '1.1rem',
//         color: '#555',
//         position: 'fixed',
//         left: 0,
//         bottom: 0,
//         zIndex: 100
//       }}>
//         Made with ❤️ by <a
//           href="https://github.com/Lalit-Kumar-Yadav-DTU"
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 'bold' }}
//         >
//           Lalit Kumar Yadav
//         </a>
//       </footer>
//     </div>
//   );
// }

// export default App;




