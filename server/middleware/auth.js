import jwt from 'jsonwebtoken'

// Simple API key middleware factory. If the env var is absent, acts as a no-op (open for dev)
export function apiKey(requiredEnvVar){
  return (req,res,next) => {
    const needed = process.env[requiredEnvVar]
    if(!needed) return next()
    const provided = req.headers['x-api-key']
    if(provided !== needed) return res.status(401).json({ success:false, error:'invalid api key' })
    next()
  }
}

// Lightweight JWT auth. If JWT secret & Authorization present, validates; else attaches anonymous user.
export function maybeJwt(){
  return (req,res,next) => {
    const secret = process.env.JWT_SECRET
    const auth = req.headers.authorization || ''
    if(secret && auth.startsWith('Bearer ')){
      const token = auth.slice(7)
      try {
        req.user = jwt.verify(token, secret)
      } catch (e) {
        return res.status(401).json({ success:false, error:'invalid token' })
      }
    } else {
      // Fallback demo identity
      req.user = req.user || { id:'demo_manager_1', role:'manager', name:'Demo Manager' }
    }
    next()
  }
}

// Require manager role (after maybeJwt)
export function requireManager(){
  return (req,res,next) => {
    if(!req.user || req.user.role !== 'manager') return res.status(403).json({ success:false, error:'manager_required' })
    next()
  }
}

// Optional admin gate
export function requireAdmin(){
  return (req,res,next) => {
    if(!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) return res.status(403).json({ success:false, error:'admin_required' })
    next()
  }
}

export default { apiKey, maybeJwt, requireManager, requireAdmin }
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
