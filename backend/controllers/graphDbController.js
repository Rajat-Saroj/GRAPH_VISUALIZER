// const Graph = require('../models/Graph');
// const AlgorithmResult = require('../models/AlgorithmResult');
// const mongoose = require('mongoose'); // 🆕 Added for ObjectId validation

// // Get public graphs only
// exports.getAllGraphs = async (req, res) => {
//   try {
//     const graphs = await Graph.find({ isPublic: true })
//       .sort({ createdAt: -1 })
//       .limit(50)
//       .populate('createdBy', 'username firstName lastName');
    
//     res.json({
//       success: true,
//       count: graphs.length,
//       data: graphs
//     });
//   } catch (error) {
//     console.error('Error fetching public graphs:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch graphs'
//     });
//   }
// };

// // Get user's graphs (private + owned)
// exports.getUserGraphs = async (req, res) => {
//   try {
//     // Ensure user is authenticated
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const graphs = await Graph.find({ createdBy: req.user._id })
//       .sort({ createdAt: -1 })
//       .limit(50);
    
//     res.json({
//       success: true,
//       count: graphs.length,
//       data: graphs
//     });
//   } catch (error) {
//     console.error('Error fetching user graphs:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch graphs'
//     });
//   }
// };

// // Get graph by ID with proper access control
// exports.getGraphById = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // 🆕 Add ObjectId validation to prevent CastError
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid graph ID format'
//       });
//     }
    
//     const graph = await Graph.findOne({
//       _id: id,
//       $or: [
//         { createdBy: req.user?._id }, // User's own graph
//         { isPublic: true }             // Or public graph
//       ]
//     });
    
//     if (!graph) {
//       return res.status(404).json({
//         success: false,
//         error: 'Graph not found or access denied'
//       });
//     }
    
//     res.json({
//       success: true,
//       data: graph
//     });
//   } catch (error) {
//     console.error('Error fetching graph:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch graph'
//     });
//   }
// };

// // Create graph with proper user association
// exports.createGraph = async (req, res) => {
//   try {
//     // Ensure user is authenticated
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const { name, description, nodes, edges, tags, isPublic } = req.body;
    
//     // Input validation
//     if (!name || name.trim().length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Graph name is required'
//       });
//     }

//     const graph = new Graph({
//       name: name.trim(),
//       description: description?.trim() || '',
//       nodes: nodes || [],
//       edges: edges || [],
//       createdBy: req.user._id, // Use authenticated user
//       tags: tags || [],
//       isPublic: isPublic || false
//     });
    
//     const savedGraph = await graph.save();
    
//     res.status(201).json({
//       success: true,
//       data: savedGraph,
//       message: 'Graph created successfully'
//     });
//   } catch (error) {
//     console.error('Error creating graph:', error);
    
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid graph data',
//         details: error.message
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create graph'
//     });
//   }
// };

// // Update graph with ownership verification
// exports.updateGraph = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const { id } = req.params;
    
//     // 🆕 Add ObjectId validation
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid graph ID format'
//       });
//     }

//     const { name, description, nodes, edges, tags, isPublic } = req.body;
    
//     const graph = await Graph.findOneAndUpdate(
//       { 
//         _id: id,
//         createdBy: req.user._id // Only update user's own graphs
//       },
//       {
//         name: name?.trim(),
//         description: description?.trim(),
//         nodes,
//         edges,
//         tags,
//         isPublic,
//         updatedAt: Date.now()
//       },
//       { new: true, runValidators: true }
//     );
    
//     if (!graph) {
//       return res.status(404).json({
//         success: false,
//         error: 'Graph not found or access denied'
//       });
//     }
    
//     res.json({
//       success: true,
//       data: graph,
//       message: 'Graph updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating graph:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to update graph'
//     });
//   }
// };

// // Delete graph with ownership verification
// exports.deleteGraph = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const { id } = req.params;
    
//     // 🆕 Add ObjectId validation
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid graph ID format'
//       });
//     }

//     const graph = await Graph.findOneAndDelete({
//       _id: id,
//       createdBy: req.user._id // Only delete user's own graphs
//     });
    
//     if (!graph) {
//       return res.status(404).json({
//         success: false,
//         error: 'Graph not found or access denied'
//       });
//     }
    
//     // Delete associated algorithm results
//     await AlgorithmResult.deleteMany({ 
//       graphId: id,
//       createdBy: req.user._id // Only delete user's own results
//     });
    
//     res.json({
//       success: true,
//       message: 'Graph and associated results deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting graph:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to delete graph'
//     });
//   }
// };

// // Save algorithm result with user association (AlgorithmResult model)
// exports.saveAlgorithmResult = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const { 
//       graphName, 
//       algorithm, 
//       source, 
//       result, 
//       executionTime,
//       nodeCount,
//       edgeCount
//     } = req.body;
    
//     const algorithmResult = new AlgorithmResult({
//       graphName,
//       algorithm,
//       source,
//       result,
//       executionTime,
//       nodeCount,
//       edgeCount,
//       createdBy: req.user._id // Use authenticated user
//     });
    
//     const savedResult = await algorithmResult.save();
    
//     res.status(201).json({
//       success: true,
//       data: savedResult,
//       message: 'Algorithm result saved successfully'
//     });
//   } catch (error) {
//     console.error('Error saving algorithm result:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to save algorithm result'
//     });
//   }
// };

// // Get user's algorithm history (AlgorithmResult model)
// exports.getAlgorithmHistory = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const { algorithm, limit = 20 } = req.query;
    
//     const filter = { createdBy: req.user._id }; // Only user's results
//     if (algorithm && algorithm !== 'all') {
//       filter.algorithm = algorithm;
//     }
    
//     const results = await AlgorithmResult.find(filter)
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit));
    
//     res.json({
//       success: true,
//       count: results.length,
//       data: results
//     });
//   } catch (error) {
//     console.error('Error fetching algorithm history:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch algorithm history'
//     });
//   }
// };

// // Get algorithm results for a specific graph (user's own)
// exports.getAlgorithmResults = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const { graphId } = req.params;
    
//     // 🆕 Add ObjectId validation
//     if (!mongoose.Types.ObjectId.isValid(graphId)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid graph ID format'
//       });
//     }

//     const results = await AlgorithmResult.find({ 
//       graphId: graphId,
//       createdBy: req.user._id // Only user's own results
//     }).sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       count: results.length,
//       data: results
//     });
//   } catch (error) {
//     console.error('Error fetching algorithm results:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch algorithm results'
//     });
//   }
// };

// // Delete algorithm result (user's own only)
// exports.deleteAlgorithmResult = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const { id } = req.params;
    
//     // 🆕 Add ObjectId validation
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid result ID format'
//       });
//     }

//     const result = await AlgorithmResult.findOneAndDelete({
//       _id: id,
//       createdBy: req.user._id // Only delete user's own results
//     });
    
//     if (!result) {
//       return res.status(404).json({
//         success: false,
//         error: 'Algorithm result not found or access denied'
//       });
//     }
    
//     res.json({
//       success: true,
//       message: 'Algorithm result deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting algorithm result:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to delete algorithm result'
//     });
//   }
// };













// // const Graph = require('../models/Graph');
// // const AlgorithmResult = require('../models/AlgorithmResult');

// // // Get all graphs
// // exports.getAllGraphs = async (req, res) => {
// //   try {
// //     const graphs = await Graph.find({ isPublic: true })
// //       .sort({ createdAt: -1 })
// //       .limit(50);
    
// //     res.json({
// //       success: true,
// //       count: graphs.length,
// //       data: graphs
// //     });
// //   } catch (error) {
// //     console.error('Error fetching graphs:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Failed to fetch graphs'
// //     });
// //   }
// // };

// // // Get graph by ID
// // exports.getGraphById = async (req, res) => {
// //   try {
// //     const graph = await Graph.findById(req.params.id);
    
// //     if (!graph) {
// //       return res.status(404).json({
// //         success: false,
// //         error: 'Graph not found'
// //       });
// //     }
    
// //     res.json({
// //       success: true,
// //       data: graph
// //     });
// //   } catch (error) {
// //     console.error('Error fetching graph:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Failed to fetch graph'
// //     });
// //   }
// // };

// // // Create new graph
// // exports.createGraph = async (req, res) => {
// //   try {
// //     const { name, description, nodes, edges, createdBy, tags } = req.body;
    
// //     const graph = new Graph({
// //       name,
// //       description,
// //       nodes: nodes || [],
// //       edges: edges || [],
// //       createdBy: createdBy || 'Anonymous',
// //       tags: tags || []
// //     });
    
// //     const savedGraph = await graph.save();
    
// //     res.status(201).json({
// //       success: true,
// //       data: savedGraph,
// //       message: 'Graph created successfully'
// //     });
// //   } catch (error) {
// //     console.error('Error creating graph:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Failed to create graph'
// //     });
// //   }
// // };

// // // Update graph
// // exports.updateGraph = async (req, res) => {
// //   try {
// //     const { name, description, nodes, edges, tags } = req.body;
    
// //     const graph = await Graph.findByIdAndUpdate(
// //       req.params.id,
// //       {
// //         name,
// //         description,
// //         nodes,
// //         edges,
// //         tags,
// //         updatedAt: Date.now()
// //       },
// //       { new: true, runValidators: true }
// //     );
    
// //     if (!graph) {
// //       return res.status(404).json({
// //         success: false,
// //         error: 'Graph not found'
// //       });
// //     }
    
// //     res.json({
// //       success: true,
// //       data: graph,
// //       message: 'Graph updated successfully'
// //     });
// //   } catch (error) {
// //     console.error('Error updating graph:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Failed to update graph'
// //     });
// //   }
// // };

// // // Delete graph
// // exports.deleteGraph = async (req, res) => {
// //   try {
// //     const graph = await Graph.findByIdAndDelete(req.params.id);
    
// //     if (!graph) {
// //       return res.status(404).json({
// //         success: false,
// //         error: 'Graph not found'
// //       });
// //     }
    
// //     // Also delete associated algorithm results
// //     await AlgorithmResult.deleteMany({ graphId: req.params.id });
    
// //     res.json({
// //       success: true,
// //       message: 'Graph and associated results deleted successfully'
// //     });
// //   } catch (error) {
// //     console.error('Error deleting graph:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Failed to delete graph'
// //     });
// //   }
// // };

// // // Save algorithm result
// // exports.saveAlgorithmResult = async (req, res) => {
// //   try {
// //     const { graphId, algorithm, source, target, result, executionTime } = req.body;
    
// //     const algorithmResult = new AlgorithmResult({
// //       graphId,
// //       algorithm,
// //       source,
// //       target,
// //       result,
// //       executionTime
// //     });
    
// //     const savedResult = await algorithmResult.save();
    
// //     res.status(201).json({
// //       success: true,
// //       data: savedResult,
// //       message: 'Algorithm result saved successfully'
// //     });
// //   } catch (error) {
// //     console.error('Error saving algorithm result:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Failed to save algorithm result'
// //     });
// //   }
// // };

// // // Get algorithm results for a graph
// // exports.getAlgorithmResults = async (req, res) => {
// //   try {
// //     const results = await AlgorithmResult.find({ graphId: req.params.graphId })
// //       .sort({ createdAt: -1 });
    
// //     res.json({
// //       success: true,
// //       count: results.length,
// //       data: results
// //     });
// //   } catch (error) {
// //     console.error('Error fetching algorithm results:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Failed to fetch algorithm results'
// //     });
// //   }
// // };
