import { verifyAccessToken } from '../services/tokenService.js';

export const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  if (req.cookies?.access_token) return req.cookies.access_token;
  return null;
};

export const authenticate = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ msg: 'Authentication required' });

  try {
    const decoded = verifyAccessToken(token);
    const role = decoded.role;
    if (!role) return res.status(401).json({ msg: 'Invalid token payload' });

    req.auth = decoded;
    if (role === 'user') {
      const userId = decoded.uid || decoded.user_id || decoded.id;
      req.user = { ...decoded, user_id: userId, uid: userId, id: userId };
    } else if (role === 'admin') {
      req.admin = decoded;
    } else if (role === 'evaluator') {
      req.evaluator = decoded;
    }
    return next();
  } catch (_error) {
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
};

export const verifyToken = authenticate;

