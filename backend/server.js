const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const graphRoutes = require('./routes/graphRoutes'); // Single route file

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://localhost:5173',        // ← Add this for Vite
    'http://127.0.0.1:5173',       // ← Add this too
    'https://shortest-path-ui.onrender.com'  // For production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Root route
app.get('/', (_req, res) => {
  res.json({ message: 'Shortest Path API is running!' });
});

// Routes - Simple and clean
app.use('/api/auth', authRoutes);
app.use('/api/graphs', graphRoutes); // Everything goes through this single route

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('MongoDB connection error:', err));












// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const authRoutes = require('./routes/authRoutes');
// const graphRoutes = require('./routes/graphRoutes');
// const graphDbRoutes = require('./routes/graphDbRoutes');

// dotenv.config();

// const app = express();

// // ✅ IMPROVED CORS CONFIGURATION
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   optionsSuccessStatus: 200
// }));

// app.use(express.json());

// // Rest of your routes...
// app.get('/', (_req, res) => {
//   res.json({ message: 'Shortest Path API is running!' });
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/graphs', graphRoutes);
// app.use('/api/db/graphs', graphDbRoutes);

// app.use((_req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// // MongoDB connection...
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('Connected to MongoDB');
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () =>
//       console.log(`Server running on http://localhost:${PORT}`)
//     );
//   })
//   .catch((err) => console.error('MongoDB connection error:', err));
