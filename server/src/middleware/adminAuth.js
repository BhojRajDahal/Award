import { findById } from '../model/adminModel.js';
import { getTokenFromRequest } from './auth.js';
import { verifyAccessToken } from '../services/tokenService.js';

export const verifyAdminToken = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ msg: 'Authentication required' });
    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: admin only' });
    }

    // Verify that the admin still exists in the database
    // This ensures that deleted admins cannot access protected routes
    const adminRecords = await findById(decoded.aid);
    if (!adminRecords || adminRecords.length === 0) {
      return res.status(401).json({ msg: 'Admin account no longer exists' });
    }

    req.admin = decoded; // { aid, email, role }
    next();
  } catch (_error) {
    return res.status(500).json({ msg: 'Authentication error' });
  }
};


