// // routes/graphDbRoutes.js
// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const graphDbController = require('../controllers/graphDbController');

// // Graph CRUD operations
// router.get('/', auth, graphDbController.getUserGraphs); // ✅ Changed to getUserGraphs for user-specific data
// router.get('/:id', auth, graphDbController.getGraphById);
// router.post('/', auth, graphDbController.createGraph);
// router.put('/:id', auth, graphDbController.updateGraph);
// router.delete('/:id', auth, graphDbController.deleteGraph);

// // ✅ FIXED: Algorithm results routes (matching frontend expectations)
// router.post('/results', auth, graphDbController.saveAlgorithmResult);        // For saving algorithm results
// router.get('/results', auth, graphDbController.getAlgorithmHistory);         // For fetching history (what frontend calls)
// router.delete('/results/:id', auth, graphDbController.deleteAlgorithmResult); // For deleting results

// // ✅ ALTERNATIVE: Keep your current naming convention but add missing route
// // router.post('/save_result', auth, graphDbController.saveAlgorithmResult);
// // router.get('/history', auth, graphDbController.getAlgorithmHistory);
// // router.get('/results', auth, graphDbController.getAlgorithmHistory);  // Add this line
// // router.delete('/result/:id', auth, graphDbController.deleteAlgorithmResult);

// module.exports = router;
