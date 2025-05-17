const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  authUser, 
  getUserProfile, 
  updateUserStatus, 
  getUsers 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/', registerUser);
router.post('/login', authUser);

// Protected routes
router.get('/', protect, getUsers);
router.get('/profile', protect, getUserProfile);
router.put('/status', protect, updateUserStatus);

module.exports = router;