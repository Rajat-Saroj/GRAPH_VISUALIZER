const mongoose = require('mongoose');

const algorithmResultSchema = new mongoose.Schema({
  graphName: {
    type: String,
    required: true
  },
  algorithm: {
    type: String,
    required: true,
    enum: ['dijkstra', 'bellman_ford', 'floyd_warshall', 'prims', 'kruskal']
  },
  source: {
    type: Number,
    required: function() {
      return ['dijkstra', 'bellman_ford'].includes(this.algorithm);
    }
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  executionTime: {
    type: Number, // in milliseconds
    required: true
  },
  nodeCount: {
    type: Number,
    required: true
  },
  edgeCount: {
    type: Number,
    required: true
  },
  // 🔧 FIXED: Changed from String to ObjectId for proper authentication
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AlgorithmResult', algorithmResultSchema);

























// const mongoose = require('mongoose');

// const algorithmResultSchema = new mongoose.Schema({
//   graphName: {
//     type: String,
//     required: true
//   },
//   algorithm: {
//     type: String,
//     required: true,
//     enum: ['dijkstra', 'bellman_ford', 'floyd_warshall', 'prims', 'kruskal']
//   },
//   source: {
//     type: Number,
//     required: function() {
//       return ['dijkstra', 'bellman_ford'].includes(this.algorithm);
//     }
//   },
//   result: {
//     type: mongoose.Schema.Types.Mixed,
//     required: true
//   },
//   executionTime: {
//     type: Number, // in milliseconds
//     required: true
//   },
//   nodeCount: {
//     type: Number,
//     required: true
//   },
//   edgeCount: {
//     type: Number,
//     required: true
//   },
//   createdBy: {
//     type: String,
//     default: 'Lalit Kumar Yadav'
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('AlgorithmResult', algorithmResultSchema);
























// const mongoose = require('mongoose');

// const algorithmResultSchema = new mongoose.Schema({
//   graphId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Graph',
//     required: true
//   },
//   algorithm: {
//     type: String,
//     required: true,
//     enum: ['dijkstra', 'bellman_ford', 'floyd_warshall', 'prims', 'kruskal']
//   },
//   source: {
//     type: Number,
//     required: function() {
//       return ['dijkstra', 'bellman_ford'].includes(this.algorithm);
//     }
//   },
//   target: {
//     type: Number,
//     required: false
//   },
//   result: {
//     type: mongoose.Schema.Types.Mixed,
//     required: true
//   },
//   executionTime: {
//     type: Number,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('AlgorithmResult', algorithmResultSchema);
