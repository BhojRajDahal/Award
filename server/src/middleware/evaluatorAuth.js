import { getTokenFromRequest } from './auth.js';
import { verifyAccessToken } from '../services/tokenService.js';

export const verifyEvaluatorToken = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ msg: 'Authentication required' });

  try {
    const decoded = verifyAccessToken(token);

    if (decoded.role !== 'evaluator') {
      return res.status(403).json({ msg: 'Access denied: evaluator only' });
    }

    req.evaluator = decoded; // { evaluator_id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
};

