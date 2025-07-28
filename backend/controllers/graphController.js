const runPythonScript = require("../utils/runPython");
const Graph = require("../models/Graph");
const Result = require("../models/Result");
const mongoose = require('mongoose');

// Dijkstra algorithm controller
// In each algorithm function (runDijkstra, runBellmanFord, etc.)
exports.runDijkstra = async (req, res) => {
  console.log('=== DIJKSTRA CONTROLLER START ===');
  console.log('User object:', req.user); // Add this line
  console.log('User ID:', req.user?._id); // Add this line
  
  try {
    const result = await runPythonScript("dijkstra.py", req.body);
    
    // Check if user exists before saving
    if (req.user && req.user._id) {
      console.log('🟢 User authenticated, attempting to save result...');
      await saveAlgorithmResult('dijkstra', req.body, result, req.user._id);
    } else {
      console.log('🔴 User not authenticated, skipping result save');
    }
    
    res.json(result);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: "Dijkstra failed", details: err.message });
  }
};


// Bellman-Ford algorithm controller
exports.runBellmanFord = async (req, res) => {
  console.log('=== BELLMAN-FORD CONTROLLER START ===');
  console.log('Request body:', req.body);
  console.log('User:', req.user?.username || 'Anonymous');
  
  try {
    const result = await runPythonScript("bellman_ford.py", req.body);
    
    // Save result to database if user is authenticated
    if (req.user && req.user._id) {
      await saveAlgorithmResult('bellman_ford', req.body, result, req.user._id);
    }
    
    console.log('=== BELLMAN-FORD SUCCESS ===');
    res.json(result);
  } catch (err) {
    console.log('=== BELLMAN-FORD FAILED ===');
    console.error('Error:', err);
    res.status(500).json({ error: "Bellman-Ford failed", details: err.message });
  }
};

// Floyd-Warshall algorithm controller
exports.runFloydWarshall = async (req, res) => {
  console.log('=== FLOYD-WARSHALL CONTROLLER START ===');
  console.log('Request body:', req.body);
  console.log('User:', req.user?.username || 'Anonymous');
  
  try {
    const result = await runPythonScript("floyd_warshall.py", req.body);
    
    // Save result to database if user is authenticated
    if (req.user && req.user._id) {
      await saveAlgorithmResult('floyd_warshall', req.body, result, req.user._id);
    }
    
    console.log('=== FLOYD-WARSHALL SUCCESS ===');
    res.json(result);
  } catch (err) {
    console.log('=== FLOYD-WARSHALL FAILED ===');
    console.error('Error:', err);
    res.status(500).json({ error: "Floyd-Warshall failed", details: err.message });
  }
};

// Prim's algorithm controller
exports.runPrims = async (req, res) => {
  console.log('=== PRIMS CONTROLLER START ===');
  console.log('Request body:', req.body);
  console.log('User:', req.user?.username || 'Anonymous');
  
  try {
    const result = await runPythonScript("prims.py", req.body);
    
    // Save result to database if user is authenticated
    if (req.user && req.user._id) {
      await saveAlgorithmResult('prims', req.body, result, req.user._id);
    }
    
    console.log('=== PRIMS SUCCESS ===');
    res.json(result);
  } catch (err) {
    console.log('=== PRIMS FAILED ===');
    console.error('Error:', err);
    res.status(500).json({ error: "Prim's algorithm failed", details: err.message });
  }
};

// Kruskal's algorithm controller
exports.runKruskal = async (req, res) => {
  console.log('=== KRUSKAL CONTROLLER START ===');
  console.log('Request body:', req.body);
  console.log('User:', req.user?.username || 'Anonymous');
  
  try {
    const result = await runPythonScript("kruskal.py", req.body);
    
    // Save result to database if user is authenticated
    if (req.user && req.user._id) {
      await saveAlgorithmResult('kruskal', req.body, result, req.user._id);
    }
    
    console.log('=== KRUSKAL SUCCESS ===');
    res.json(result);
  } catch (err) {
    console.log('=== KRUSKAL FAILED ===');
    console.error('Error:', err);
    res.status(500).json({ error: "Kruskal's algorithm failed", details: err.message });
  }
};

// Helper function to save algorithm results
// In graphController.js - add more detailed logging
const saveAlgorithmResult = async (algorithm, inputData, result, userId) => {
  try {
    console.log(`🔄 Attempting to save ${algorithm} result for user:`, userId);
    console.log('Input data:', { graphName: inputData.graphName, nodeCount: inputData.nodes?.length });
    
    // In saveAlgorithmResult helper function
    const algorithmResult = new Result({
      algorithm,
      graphName: inputData.graphName || 'Unnamed Graph',
      source: inputData.source,
      target: inputData.target,
      result: result,
      nodeCount: inputData.nodes?.length || 0,
      edgeCount: inputData.edges?.length || 0,
      executionTime: result.executionTime || 0,
      createdBy: userId
    });

    // Mark the Mixed field as modified
    algorithmResult.markModified('result');

    const savedResult = await algorithmResult.save();

    console.log(`✅ Successfully saved ${algorithm} result with ID:`, savedResult._id);
    
  } catch (error) {
    console.error(`❌ Failed to save ${algorithm} result:`, error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
  }
};


// Save graph controller with authentication
exports.saveGraph = async (req, res) => {
  try {
    const { name, description, nodes, edges, tags, isPublic } = req.body;

    // Input validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Graph name is required" 
      });
    }

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Graph must have at least one node" 
      });
    }

    // Ensure req.user exists from auth middleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const graph = new Graph({
      name: name.trim(),
      description: description?.trim() || '',
      nodes: nodes || [],
      edges: edges || [],
      tags: tags || [],
      isPublic: isPublic || false,
      createdBy: req.user._id
    });

    const savedGraph = await graph.save();

    res.status(201).json({
      success: true,
      message: "Graph saved successfully",
      data: savedGraph
    });
  } catch (error) {
    console.error("Error saving graph:", error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid graph data", 
        details: error.message 
      });
    }
    
    res.status(500).json({ success: false, error: "Failed to save graph" });
  }
};

// Get user's saved graphs
exports.getUserGraphs = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const graphs = await Graph.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: graphs
    });
  } catch (error) {
    console.error("Error fetching graphs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch graphs" });
  }
};

// Get a specific graph by ID
exports.getGraphById = async (req, res) => {
  try {
    const { graphId } = req.params;
    
    // Add ObjectId validation to prevent CastError
    if (!mongoose.Types.ObjectId.isValid(graphId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid graph ID format'
      });
    }
    
    const graph = await Graph.findOne({
      _id: graphId,
      $or: [
        { createdBy: req.user?._id },
        { isPublic: true }
      ]
    });

    if (!graph) {
      return res.status(404).json({ 
        success: false, 
        error: "Graph not found or access denied" 
      });
    }

    res.json({
      success: true,
      data: graph
    });
  } catch (error) {
    console.error("Error fetching graph:", error);
    res.status(500).json({ success: false, error: "Failed to fetch graph" });
  }
};

// Delete a graph
exports.deleteGraph = async (req, res) => {
  try {
    const { graphId } = req.params;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Add ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(graphId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid graph ID format'
      });
    }

    const deletedGraph = await Graph.findOneAndDelete({
      _id: graphId,
      createdBy: req.user._id
    });

    if (!deletedGraph) {
      return res.status(404).json({ 
        success: false, 
        error: "Graph not found or access denied" 
      });
    }

    res.json({
      success: true,
      message: "Graph deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting graph:", error);
    res.status(500).json({ success: false, error: "Failed to delete graph" });
  }
};

// Get algorithm execution results/history (Result model)
exports.getResults = async (req, res) => {
  try {
    const { algorithm, limit = 10, page = 1 } = req.query;
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Build query
    let query = { createdBy: userId };
    if (algorithm && algorithm !== 'all') {
      query.algorithm = algorithm;
    }
    
    // Calculate pagination
    const skip = (page - 1) * parseInt(limit);
    
    // Find results
    const results = await Result.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');
    
    const totalResults = await Result.countDocuments(query);
    const totalPages = Math.ceil(totalResults / parseInt(limit));
    
    res.json({
      success: true,
      data: results,
      totalPages,
      currentPage: parseInt(page),
      totalResults
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch results'
    });
  }
};

// Delete algorithm execution result (Result model)
exports.deleteResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid result ID format'
      });
    }
    
    // Find and delete result (only if owned by user)
    const result = await Result.findOneAndDelete({
      _id: resultId,
      createdBy: userId
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found or access denied'
      });
    }
    
    res.json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete result'
    });
  }
};







// const runPythonScript = require("../utils/runPython");
// const Graph = require("../models/Graph");

// // Dijkstra algorithm controller
// exports.runDijkstra = async (req, res) => {
//   console.log('=== DIJKSTRA CONTROLLER START ===');
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?.username || 'Anonymous');
  
//   try {
//     const result = await runPythonScript("dijkstra.py", req.body);
//     console.log('=== DIJKSTRA SUCCESS ===');
//     console.log('Final result:', result);
//     res.json(result);
//   } catch (err) {
//     console.log('=== DIJKSTRA FAILED ===');
//     console.error('Error:', err);
//     res.status(500).json({ error: "Dijkstra failed", details: err.message });
//   }
// };

// // Bellman-Ford algorithm controller
// exports.runBellmanFord = async (req, res) => {
//   console.log('=== BELLMAN-FORD CONTROLLER START ===');
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?.username || 'Anonymous');
  
//   try {
//     const result = await runPythonScript("bellman_ford.py", req.body);
//     console.log('=== BELLMAN-FORD SUCCESS ===');
//     res.json(result);
//   } catch (err) {
//     console.log('=== BELLMAN-FORD FAILED ===');
//     console.error('Error:', err);
//     res.status(500).json({ error: "Bellman-Ford failed", details: err.message });
//   }
// };

// // Floyd-Warshall algorithm controller
// exports.runFloydWarshall = async (req, res) => {
//   console.log('=== FLOYD-WARSHALL CONTROLLER START ===');
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?.username || 'Anonymous');
  
//   try {
//     const result = await runPythonScript("floyd_warshall.py", req.body);
//     console.log('=== FLOYD-WARSHALL SUCCESS ===');
//     res.json(result);
//   } catch (err) {
//     console.log('=== FLOYD-WARSHALL FAILED ===');
//     console.error('Error:', err);
//     res.status(500).json({ error: "Floyd-Warshall failed", details: err.message });
//   }
// };

// // Prim's algorithm controller
// exports.runPrims = async (req, res) => {
//   console.log('=== PRIMS CONTROLLER START ===');
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?.username || 'Anonymous');
  
//   try {
//     const result = await runPythonScript("prims.py", req.body);
//     console.log('=== PRIMS SUCCESS ===');
//     res.json(result);
//   } catch (err) {
//     console.log('=== PRIMS FAILED ===');
//     console.error('Error:', err);
//     res.status(500).json({ error: "Prim's algorithm failed", details: err.message });
//   }
// };

// // Kruskal's algorithm controller
// exports.runKruskal = async (req, res) => {
//   console.log('=== KRUSKAL CONTROLLER START ===');
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?.username || 'Anonymous');
  
//   try {
//     const result = await runPythonScript("kruskal.py", req.body);
//     console.log('=== KRUSKAL SUCCESS ===');
//     res.json(result);
//   } catch (err) {
//     console.log('=== KRUSKAL FAILED ===');
//     console.error('Error:', err);
//     res.status(500).json({ error: "Kruskal's algorithm failed", details: err.message });
//   }
// };

// // Save graph controller with authentication
// exports.saveGraph = async (req, res) => {
//   try {
//     const { name, description, nodes, edges, tags, isPublic } = req.body;

//     // Input validation
//     if (!name || name.trim().length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         error: "Graph name is required" 
//       });
//     }

//     if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         error: "Graph must have at least one node" 
//       });
//     }

//     // Ensure req.user exists from auth middleware
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ success: false, error: "Unauthorized" });
//     }

//     const graph = new Graph({
//       name: name.trim(),
//       description: description?.trim() || '',
//       nodes: nodes || [],
//       edges: edges || [],
//       tags: tags || [],
//       isPublic: isPublic || false,
//       createdBy: req.user._id
//     });

//     const savedGraph = await graph.save();

//     res.status(201).json({
//       success: true,
//       message: "Graph saved successfully",
//       data: savedGraph
//     });
//   } catch (error) {
//     console.error("Error saving graph:", error);
    
//     // Handle MongoDB validation errors
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ 
//         success: false, 
//         error: "Invalid graph data", 
//         details: error.message 
//       });
//     }
    
//     res.status(500).json({ success: false, error: "Failed to save graph" });
//   }
// };

// // Get user's saved graphs
// exports.getUserGraphs = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ success: false, error: "Unauthorized" });
//     }

//     const graphs = await Graph.find({ createdBy: req.user._id })
//       .sort({ createdAt: -1 })
//       .select('-__v');

//     res.json({
//       success: true,
//       data: graphs
//     });
//   } catch (error) {
//     console.error("Error fetching graphs:", error);
//     res.status(500).json({ success: false, error: "Failed to fetch graphs" });
//   }
// };

// // Get a specific graph by ID
// exports.getGraphById = async (req, res) => {
//   try {
//     const { graphId } = req.params;
    
//     const graph = await Graph.findOne({
//       _id: graphId,
//       $or: [
//         { createdBy: req.user?._id },
//         { isPublic: true }
//       ]
//     });

//     if (!graph) {
//       return res.status(404).json({ 
//         success: false, 
//         error: "Graph not found or access denied" 
//       });
//     }

//     res.json({
//       success: true,
//       data: graph
//     });
//   } catch (error) {
//     console.error("Error fetching graph:", error);
//     res.status(500).json({ success: false, error: "Failed to fetch graph" });
//   }
// };

// // Delete a graph
// exports.deleteGraph = async (req, res) => {
//   try {
//     const { graphId } = req.params;
    
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ success: false, error: "Unauthorized" });
//     }

//     const deletedGraph = await Graph.findOneAndDelete({
//       _id: graphId,
//       createdBy: req.user._id
//     });

//     if (!deletedGraph) {
//       return res.status(404).json({ 
//         success: false, 
//         error: "Graph not found or access denied" 
//       });
//     }

//     res.json({
//       success: true,
//       message: "Graph deleted successfully"
//     });
//   } catch (error) {
//     console.error("Error deleting graph:", error);
//     res.status(500).json({ success: false, error: "Failed to delete graph" });
//   }
// };











// const runPythonScript = require("../utils/runPython");

// exports.runDijkstra = async (req, res) => {
//   console.log('=== DIJKSTRA CONTROLLER START ===');
//   console.log('Request body:', req.body);
  
//   try {
//     const result = await runPythonScript("dijkstra.py", req.body);
//     console.log('=== DIJKSTRA SUCCESS ===');
//     console.log('Final result:', result);
//     res.json(result);
//   } catch (err) {
//     console.log('=== DIJKSTRA FAILED ===');
//     console.error('Error:', err);
//     res.status(500).json({ error: "Dijkstra failed", details: err.message });
//   }
// };

// // Add the other exports...
// exports.runBellmanFord = async (req, res) => {
//   try {
//     const result = await runPythonScript("bellman_ford.py", req.body);
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Bellman-Ford failed" });
//   }
// };

// exports.runFloydWarshall = async (req, res) => {
//   try {
//     const result = await runPythonScript("floyd_warshall.py", req.body);
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Floyd-Warshall failed" });
//   }
// };


// exports.runPrims = async (req, res) => {
//   try {
//     const result = await runPythonScript("prims.py", req.body);
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Prim's algorithm failed" });
//   }
// };


// exports.runKruskal = async (req, res) => {
//   try {
//     const result = await runPythonScript("kruskal.py", req.body);
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Kruskal's algorithm failed" });
//   }
// };
