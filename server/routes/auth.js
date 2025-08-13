import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateUser } from '../middleware/auth.js';
import { createOrg, addUserWithPassword, findUserByEmail, verifyPassword, logAudit } from '../services/mvpRepo.js';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Authenticate user with Firebase token
 * @access Public
 */
router.post('/login', async (req,res)=>{
  try {
    const { email, password } = req.body||{}
    if(!email || !password) return res.status(400).json({ success:false, error:'email & password required'})
    const user = await findUserByEmail(email)
    if(!user) return res.status(401).json({ success:false, error:'invalid_credentials' })
    const ok = await verifyPassword(password, user.password_hash)
    if(!ok) return res.status(401).json({ success:false, error:'invalid_credentials' })
    const token = jwt.sign({ id:user.id, email:user.email, orgId:user.org_id, role:'manager' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn:'12h' })
    await logAudit({ userId:user.id, orgId:user.org_id, action:'login', details:{ email }, ip:req.ip })
    res.json({ success:true, token, user:{ id:user.id, email:user.email, name:user.name, orgId:user.org_id } })
  } catch (e){
    console.error('login error', e)
    res.status(500).json({ success:false, error:'login_failed' })
  }
})

router.post('/signup', async (req,res)=>{
  try {
    const { email, name, password, orgName } = req.body||{}
    if(!email || !password) return res.status(400).json({ success:false, error:'email & password required'})
    let org = null
    if(orgName) org = await createOrg({ name: orgName })
    const user = await addUserWithPassword({ email, name, password, orgId: org?.id, role:'manager' })
    const token = jwt.sign({ id:user.id, email:user.email, orgId:user.org_id, role:'manager' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn:'12h' })
    await logAudit({ userId:user.id, orgId:user.org_id, action:'signup', details:{ email, orgName }, ip:req.ip })
    res.json({ success:true, token, user:{ id:user.id, email:user.email, name:user.name, orgId:user.org_id } })
  } catch (e){
    console.error('signup error', e)
    res.status(500).json({ success:false, error:'signup_failed' })
  }
})

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
