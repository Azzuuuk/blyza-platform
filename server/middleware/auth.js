/**
 * Authentication middleware for Firebase tokens
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // In production, verify Firebase token here
    // For development/demo, use mock user
    if (token === 'demo-token' || process.env.NODE_ENV === 'development') {
      req.user = {
        uid: 'demo-user-123',
        email: 'demo@blyza.com',
        name: 'Demo User',
        role: 'manager'
      };
      return next();
    }
    
    // TODO: Implement Firebase token verification
    // const admin = require('firebase-admin');
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // req.user = {
    //   uid: decodedToken.uid,
    //   email: decodedToken.email,
    //   name: decodedToken.name,
    //   role: decodedToken.role || 'player'
    // };
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
