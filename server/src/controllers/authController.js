import { registerService, loginService } from '../services/authService.js';
import { loginAdminService } from '../services/adminService.js';
import { loginEvaluatorService } from '../services/evaluatorService.js';
import {
    clearAuthCookies,
    mintRefreshToken,
    revokeRefreshToken,
    rotateRefreshToken,
    setAuthCookies,
    signAccessToken,
} from '../services/tokenService.js';
import { authenticate } from '../middleware/auth.js';
import { findById as findAdminById } from '../model/adminModel.js';
import { findById as findEvaluatorById } from '../model/evaluatorModel.js';
import { findById as findUserById } from '../model/userModel.js';

export const registerUser = async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ msg: 'All fields are required' });
    }

    try {
        const message = await registerService(full_name, email, password);
        res.status(201).json({ msg: message });
    } catch (error) {
        res.status(400).json({ msg: error.message || error });
    }
};

/**
 * Single entry login: applicant user, then admin, then evaluator (one request per sign-in).
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
    }

    try {
        const user = await loginService(email, password);
        const userId = user.uid || user.user_id || user.id;
        const token = signAccessToken({
            user_id: userId,
            uid: userId,
            id: userId,
            email: user.email,
            role: 'user',
        });
        const refreshToken = await mintRefreshToken({ role: 'user', user_id: userId });
        setAuthCookies(res, { accessToken: token, refreshToken });

        return res.status(200).json({
            msg: 'Login successful',
            token,
            user: {
                id: userId,
                user_id: userId,
                uid: userId,
                full_name: user.full_name,
                email: user.email,
                role: 'user',
            },
        });
    } catch {
        /* continue */
    }

    try {
        const admin = await loginAdminService(email, password);
        const token = signAccessToken({ aid: admin.aid, email: admin.email, role: 'admin' });
        const refreshToken = await mintRefreshToken({ role: 'admin', aid: admin.aid });
        setAuthCookies(res, { accessToken: token, refreshToken });

        return res.status(200).json({
            msg: 'Login successful',
            token,
            admin: {
                aid: admin.aid,
                full_name: admin.full_name,
                email: admin.email,
                department: admin.department,
                role: 'admin',
            },
        });
    } catch {
        /* continue */
    }

    try {
        const evaluator = await loginEvaluatorService(email, password);
        const token = signAccessToken({
            evaluator_id: evaluator.evaluator_id,
            email: evaluator.email,
            role: 'evaluator',
        });
        const refreshToken = await mintRefreshToken({
            role: 'evaluator',
            evaluator_id: evaluator.evaluator_id,
        });
        setAuthCookies(res, { accessToken: token, refreshToken });

        return res.status(200).json({
            msg: 'Login successful',
            token,
            evaluator: {
                evaluator_id: evaluator.evaluator_id,
                full_name: evaluator.full_name,
                email: evaluator.email,
                institution: evaluator.institution,
                designation: evaluator.designation,
                role: 'evaluator',
            },
        });
    } catch {
        /* continue */
    }

    return res.status(401).json({ msg: 'Invalid email or password' });
};

export const refreshSession = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) return res.status(401).json({ msg: 'Refresh token missing' });

        const { principal, refreshToken: nextRefreshToken } = await rotateRefreshToken(refreshToken);
        let payload;
        if (principal.role === 'admin') {
            const rows = await findAdminById(principal.aid);
            const row = rows[0];
            payload = { aid: principal.aid, email: row?.email, role: 'admin' };
        } else if (principal.role === 'evaluator') {
            const rows = await findEvaluatorById(principal.evaluator_id);
            const row = rows[0];
            payload = {
                evaluator_id: principal.evaluator_id,
                email: row?.email,
                role: 'evaluator',
            };
        } else {
            const rows = await findUserById(principal.user_id);
            const row = rows[0];
            payload = {
                user_id: principal.user_id,
                uid: principal.user_id,
                id: principal.user_id,
                email: row?.email,
                role: 'user',
            };
        }
        const accessToken = signAccessToken(payload);
        setAuthCookies(res, { accessToken, refreshToken: nextRefreshToken });
        return res.status(200).json({ msg: 'Session refreshed' });
    } catch (error) {
        clearAuthCookies(res);
        return res.status(401).json({ msg: error.message || 'Unable to refresh session' });
    }
};

export const logoutSession = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refresh_token;
        await revokeRefreshToken(refreshToken);
        clearAuthCookies(res);
        return res.status(200).json({ msg: 'Logged out' });
    } catch (_error) {
        clearAuthCookies(res);
        return res.status(200).json({ msg: 'Logged out' });
    }
};

export const getCurrentSession = [
    authenticate,
    async (req, res) => {
        if (!req.auth?.role) return res.status(401).json({ msg: 'Not authenticated' });

        if (req.auth.role === 'admin') {
            return res.status(200).json({
                role: req.auth.role,
                user: { aid: req.auth.aid, email: req.auth.email, role: 'admin' },
            });
        }

        if (req.auth.role === 'evaluator') {
            let full_name = '';
            try {
                const row = await findEvaluatorById(req.auth.evaluator_id);
                full_name = row?.full_name || '';
            } catch (_e) {
                /* ignore */
            }
            return res.status(200).json({
                role: 'evaluator',
                user: {
                    id: req.auth.evaluator_id,
                    evaluator_id: req.auth.evaluator_id,
                    email: req.auth.email,
                    full_name: full_name || undefined,
                    role: 'evaluator',
                },
            });
        }

        let full_name = '';
        try {
            const uid = req.user?.user_id ?? req.auth.user_id;
            if (uid) {
                const row = await findUserById(uid);
                full_name = row?.full_name || '';
            }
        } catch (_e) {
            /* ignore */
        }

        return res.status(200).json({
            role: req.auth.role,
            user: {
                id: req.user?.user_id,
                user_id: req.user?.user_id,
                uid: req.user?.user_id,
                email: req.auth.email,
                full_name: full_name || undefined,
                role: 'user',
            },
        });
    },
];
