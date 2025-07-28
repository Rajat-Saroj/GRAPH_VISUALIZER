// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email or username already exists' 
      });
    }
    
    // Create user
    const user = new User({ username, email, password, firstName, lastName });
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user (for token validation)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;















// // routes/authRoutes.js
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const router = express.Router();

// // Register
// router.post('/register', async (req, res) => {
//   try {
//     const { username, email, password, firstName, lastName } = req.body;
    
//     // Check if user exists
//     const existingUser = await User.findOne({ 
//       $or: [{ email }, { username }] 
//     });
    
//     if (existingUser) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'User with this email or username already exists' 
//       });
//     }
    
//     // Create user
//     const user = new User({ username, email, password, firstName, lastName });
//     await user.save();
    
//     // Generate token
//     const token = jwt.sign(
//       { userId: user._id }, 
//       process.env.JWT_SECRET, 
//       { expiresIn: '7d' }
//     );
    
//     res.status(201).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ 
//         success: false, 
//         error: 'Invalid email or password' 
//       });
//     }
    
//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ 
//         success: false, 
//         error: 'Invalid email or password' 
//       });
//     }
    
//     // Generate token
//     const token = jwt.sign(
//       { userId: user._id }, 
//       process.env.JWT_SECRET, 
//       { expiresIn: '7d' }
//     );
    
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// module.exports = router;
