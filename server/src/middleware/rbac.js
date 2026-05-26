import { authenticate } from './auth.js';
import { getApplicationById } from '../model/applicationModel.js';

export const authorize = (...roles) => [
  authenticate,
  (req, res, next) => {
    if (!req.auth?.role || !roles.includes(req.auth.role)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    return next();
  },
];

export const requireApplicationOwnership = async (req, res, next) => {
  try {
    // Admins can access any application detail route.
    if (req.admin?.role === 'admin') return next();
    if (!req.user?.user_id) return res.status(401).json({ msg: 'Authentication required' });
    const appId = Number(req.params.application_id);
    if (!Number.isFinite(appId) || appId <= 0) return res.status(400).json({ msg: 'Invalid application ID' });
    const app = await getApplicationById(appId);
    if (!app) return res.status(404).json({ msg: 'Application not found' });
    if (Number(app.user_id) !== Number(req.user.user_id)) {
      return res.status(403).json({ msg: 'Access denied: not your application' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ msg: error.message || 'Ownership check failed' });
  }
};
