const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const {
  runDijkstra,
  runBellmanFord,
  runFloydWarshall,
  runPrims,
  runKruskal,
  saveGraph,
  getUserGraphs,
  getGraphById,
  deleteGraph,
  getResults,
  deleteResult
} = require('../controllers/graphController');

// 🔧 FIX: Add authMiddleware to algorithm routes
router.post("/algorithms/dijkstra", authMiddleware, runDijkstra);
router.post("/algorithms/bellman_ford", authMiddleware, runBellmanFord);
router.post("/algorithms/floyd_warshall", authMiddleware, runFloydWarshall);
router.post("/algorithms/prims", authMiddleware, runPrims);
router.post("/algorithms/kruskal", authMiddleware, runKruskal);

// Algorithm history routes (already protected)
router.get("/algorithms/results", authMiddleware, getResults);
router.delete("/algorithms/results/:resultId", authMiddleware, deleteResult);

// Graph management routes (already protected)
router.post("/save_graph", authMiddleware, saveGraph);
router.get("/user_graphs", authMiddleware, getUserGraphs);
router.get("/:graphId", authMiddleware, getGraphById);
router.delete("/:graphId", authMiddleware, deleteGraph);

module.exports = router;








// // routes/graphRoutes.js
// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middleware/auth");

// const {
//   runDijkstra,
//   runBellmanFord,
//   runFloydWarshall,
//   runPrims,
//   runKruskal,
//   saveGraph,
//   getUserGraphs,
//   getGraphById,
//   deleteGraph,
//   // ADD THESE NEW IMPORTS
//   getResults,
//   deleteResult
// } = require("../controllers/graphController");

// // Algorithm routes (choose your security preference)
// router.post("/dijkstra", runDijkstra);
// router.post("/bellman_ford", runBellmanFord);
// router.post("/floyd_warshall", runFloydWarshall);
// router.post("/prims", runPrims);
// router.post("/kruskal", runKruskal);

// // 🆕 ADD THESE ROUTES BEFORE THE PARAMETERIZED ROUTES
// router.get("/results", authMiddleware, getResults);           // For history
// router.delete("/results/:resultId", authMiddleware, deleteResult); // For delete

// // Graph management routes (always protected)
// router.post("/save_graph", authMiddleware, saveGraph);
// router.get("/user_graphs", authMiddleware, getUserGraphs);
// router.get("/:graphId", authMiddleware, getGraphById);        // Keep this AFTER specific routes
// router.delete("/:graphId", authMiddleware, deleteGraph);

// module.exports = router;



// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middleware/auth");

// const {
//   runDijkstra,
//   runBellmanFord,
//   runFloydWarshall,
//   runPrims,
//   runKruskal,
//   saveGraph,
//   getUserGraphs,
//   getGraphById,
//   deleteGraph
// } = require("../controllers/graphController");

// // Algorithm routes (choose your security preference)
// // Option 1: Public access
// router.post("/dijkstra", runDijkstra);
// router.post("/bellman_ford", runBellmanFord);
// router.post("/floyd_warshall", runFloydWarshall);
// router.post("/prims", runPrims);
// router.post("/kruskal", runKruskal);

// // Option 2: Protected access (uncomment to require auth for algorithms)
// // router.post("/dijkstra", authMiddleware, runDijkstra);
// // router.post("/bellman_ford", authMiddleware, runBellmanFord);
// // router.post("/floyd_warshall", authMiddleware, runFloydWarshall);
// // router.post("/prims", authMiddleware, runPrims);
// // router.post("/kruskal", authMiddleware, runKruskal);

// // Graph management routes (always protected)
// router.post("/save_graph", authMiddleware, saveGraph);
// router.get("/user_graphs", authMiddleware, getUserGraphs);
// router.get("/:graphId", authMiddleware, getGraphById);
// router.delete("/:graphId", authMiddleware, deleteGraph);

// module.exports = router;









// const express = require("express");
// const router = express.Router();

// const {
//   runDijkstra,
//   runBellmanFord,
//   runFloydWarshall,
//   runPrims,
//   runKruskal
// } = require("../controllers/graphController");

// router.post("/dijkstra", runDijkstra);
// router.post("/bellman_ford", runBellmanFord);
// router.post("/floyd_warshall", runFloydWarshall);
// router.post("/prims", runPrims);
// router.post("/kruskal", runKruskal);

// module.exports = router;
