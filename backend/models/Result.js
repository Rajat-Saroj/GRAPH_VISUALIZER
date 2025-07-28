// In models/Result.js - add better error handling
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  algorithm: {
    type: String,
    required: [true, 'Algorithm is required'],
    enum: {
      values: ['dijkstra', 'bellman_ford', 'floyd_warshall', 'prims', 'kruskal'],
      message: 'Invalid algorithm type'
    }
  },
  graphId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Graph'
  },
  graphName: {
    type: String,
    default: 'Unnamed Graph'
  },
  source: Number,
  target: Number,
  result: mongoose.Schema.Types.Mixed,
  nodeCount: {
    type: Number,
    default: 0
  },
  edgeCount: {
    type: Number,
    default: 0
  },
  executionTime: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'CreatedBy is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add pre-save middleware for debugging
resultSchema.pre('save', function(next) {
  console.log('📝 About to save Result document:', this.toObject());
  next();
});

// Add post-save middleware for confirmation
resultSchema.post('save', function(doc) {
  console.log('💾 Result document saved successfully:', doc._id);
});

module.exports = mongoose.model('Result', resultSchema);
