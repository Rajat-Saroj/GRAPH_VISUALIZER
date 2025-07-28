const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: function() {
      return `Node ${this.id}`;
    }
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  }
});

const edgeSchema = new mongoose.Schema({
  from: {
    type: Number,
    required: true
  },
  to: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  }
});

// models/Graph.js - Add user relationship
const graphSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  nodes: [nodeSchema],
  edges: [edgeSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  // Now required - links to user
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false  // Private by default
  },
  createdAt: { type: Date, default: Date.now }
});


// const graphSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   nodes: [nodeSchema],
//   edges: [edgeSchema],
//   createdBy: {
//     type: String,
//     default: 'Anonymous'
//   },
//   isPublic: {
//     type: Boolean,
//     default: true
//   },
//   tags: [{
//     type: String,
//     trim: true
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

graphSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Graph', graphSchema);





















// const mongoose = require('mongoose');

// const nodeSchema = new mongoose.Schema({
//   id: {
//     type: Number,
//     required: true
//   },
//   label: {
//     type: String,
//     default: function() {
//       return `Node ${this.id}`;
//     }
//   },
//   position: {
//     x: { type: Number, default: 0 },
//     y: { type: Number, default: 0 }
//   }
// });

// const edgeSchema = new mongoose.Schema({
//   from: {
//     type: Number,
//     required: true
//   },
//   to: {
//     type: Number,
//     required: true
//   },
//   weight: {
//     type: Number,
//     required: true,
//     min: 0
//   }
// });

// // models/Graph.js - Add user relationship
// const graphSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   nodes: [{ id: Number }],
//   edges: [{
//     from: Number,
//     to: Number,
//     weight: Number
//   }],
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true  // Now required - links to user
//   },
//   tags: [String],
//   isPublic: {
//     type: Boolean,
//     default: false  // Private by default
//   },
//   createdAt: { type: Date, default: Date.now }
// });


// // const graphSchema = new mongoose.Schema({
// //   name: {
// //     type: String,
// //     required: true,
// //     trim: true
// //   },
// //   description: {
// //     type: String,
// //     default: ''
// //   },
// //   nodes: [nodeSchema],
// //   edges: [edgeSchema],
// //   createdBy: {
// //     type: String,
// //     default: 'Anonymous'
// //   },
// //   isPublic: {
// //     type: Boolean,
// //     default: true
// //   },
// //   tags: [{
// //     type: String,
// //     trim: true
// //   }],
// //   createdAt: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   updatedAt: {
// //     type: Date,
// //     default: Date.now
// //   }
// // });

// graphSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model('Graph', graphSchema);
