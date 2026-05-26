import { registerAdminService, loginAdminService } from '../services/adminService.js';
import { getAllUsers, deleteUser } from '../model/userModel.js';
import { getAllAdmins, deleteAdmin } from '../model/adminModel.js';
import { registerEvaluatorService, loginEvaluatorService } from '../services/evaluatorService.js';
import { getAllEvaluators, deleteEvaluator } from '../model/evaluatorModel.js';
import { mintRefreshToken, setAuthCookies, signAccessToken } from '../services/tokenService.js';

export const registerAdmin = async (req, res) => {
    const { full_name, email, password, department } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ msg: 'Full name, email, and password are required' });
    }

    try {
        const message = await registerAdminService(full_name, email, password, department);
        res.status(201).json({ msg: message });
    } catch (error) {
        res.status(400).json({ msg: error.message || error });
    }
};

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
    }

    try {
        const admin = await loginAdminService(email, password);
        
        // Generate JWT token
        const token = jwt.sign(
            { aid: admin.aid, email: admin.email, role: 'admin' },
            SECRET,
            { expiresIn: EXPIRES_IN }
        );
        const refreshToken = await mintRefreshToken({ role: 'admin', aid: admin.aid });
        setAuthCookies(res, { accessToken: token, refreshToken });

        res.status(200).json({
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
    } catch (error) {
        res.status(401).json({ msg: error.message || 'Login failed' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            details: error.code || 'UNKNOWN_ERROR'
        });
    }
};

export const getAdmins = async (req, res) => {
    try {
        const admins = await getAllAdmins();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || 'Failed to fetch admins',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            details: error.code || 'UNKNOWN_ERROR'
        });
    }
};

export const registerEvaluator = async (req, res) => {
    const { full_name, email, institution, designation, password } = req.body;

    if (!full_name || !email || !institution || !designation || !password) {
        return res.status(400).json({ msg: 'Full name, email, institution, designation, and password are required' });
    }

    try {
        const message = await registerEvaluatorService(full_name, email, institution, designation, password);
        res.status(201).json({ msg: message });
    } catch (error) {
        res.status(400).json({ msg: error.message || error });
    }
};

export const getEvaluators = async (req, res) => {
    try {
        const evaluators = await getAllEvaluators();
        res.status(200).json(evaluators);
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || 'Failed to fetch evaluators',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            details: error.code || 'UNKNOWN_ERROR'
        });
    }
};

export const deleteEvaluatorController = async (req, res) => {
    try {
        const { evaluator_id } = req.params;
        
        if (!evaluator_id) {
            return res.status(400).json({ msg: 'Evaluator ID is required' });
        }

        await deleteEvaluator(evaluator_id);
        res.status(200).json({ msg: 'Evaluator deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || 'Failed to delete evaluator',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};

export const loginEvaluator = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
    }

    try {
        const evaluator = await loginEvaluatorService(email, password);
        
        // Generate JWT token
        const token = signAccessToken({
            evaluator_id: evaluator.evaluator_id,
            email: evaluator.email,
            role: 'evaluator',
        });
        const refreshToken = await mintRefreshToken({ role: 'evaluator', evaluator_id: evaluator.evaluator_id });
        setAuthCookies(res, { accessToken: token, refreshToken });

        res.status(200).json({
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
    } catch (error) {
        res.status(401).json({ msg: error.message || 'Login failed' });
    }
};

export const deleteAdminController = async (req, res) => {
    try {
        const { aid } = req.params;
        
        if (!aid) {
            return res.status(400).json({ msg: 'Admin ID is required' });
        }

        // Prevent admin from deleting themselves
        if (req.admin && req.admin.aid && parseInt(aid) === parseInt(req.admin.aid)) {
            return res.status(400).json({ msg: 'You cannot delete your own account' });
        }

        await deleteAdmin(aid);
        res.status(200).json({ msg: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || 'Failed to delete admin',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};

export const deleteUserController = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ msg: 'User ID is required' });
        }

        await deleteUser(id);
        res.status(200).json({ msg: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            msg: error.message || 'Failed to delete user',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};

