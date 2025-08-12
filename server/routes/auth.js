import express from 'express';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Authenticate user with Firebase token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { firebaseToken } = req.body;
    
    if (!firebaseToken) {
      return res.status(400).json({
        success: false,
        error: 'Firebase token is required'
      });
    }
    
    // Verify Firebase token (implementation in middleware/auth.js)
    // For now, return success
    res.json({
      success: true,
      user: {
        uid: 'demo-user',
        email: 'demo@blyza.com',
        name: 'Demo User',
        role: 'manager'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

/**
 * @route POST /api/auth/verify
 * @desc Verify user session
 * @access Private
 */
router.post('/verify', authenticateUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Token verification failed'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // In a real implementation, you might invalidate the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

export default router;
