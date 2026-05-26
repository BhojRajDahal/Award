import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { createPasswordReset, findByTokenHash, markTokenAsUsed } from '../model/passwordResetModel.js';
import { findByEmail as findUserByEmail } from '../model/userModel.js';
import { findByEmail as findAdminByEmail } from '../model/adminModel.js';
import { findByEmail as findEvaluatorByEmail } from '../model/evaluatorModel.js';
import { updatePassword as updateUserPassword } from '../model/userModel.js';
import { updatePassword as updateAdminPassword } from '../model/adminModel.js';
import { updatePassword as updateEvaluatorPassword } from '../model/evaluatorModel.js';
import { sendPasswordResetEmail } from './emailService.js';

const TOKEN_EXPIRY_MINUTES = 45; // Between 30-60 minutes as per requirements

/**
 * Request a password reset for a user (users only)
 * @param {string} email - User's email address
 * @param {string} user_type - Type of user (defaults to 'user')
 * @returns {Promise<void>}
 */
export const requestPasswordReset = async (email, user_type = 'user') => {
    // Only allow password reset for users
    if (user_type !== 'user') {
        throw new Error('Password reset is only available for users');
    }

    // Verify email exists in users table
    let user = null;
    let userName = null;
    let userId = null;

    const users = await findUserByEmail(email);
    if (users.length > 0) {
        user = users[0];
        userName = user.full_name;
        userId = user.uid || user.user_id || user.id;
    }

    // For security, don't reveal if email exists or not
    // If email doesn't exist, we still return success to prevent email enumeration
    if (!user) {
        return; // Silent success for security
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiry time (45 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + TOKEN_EXPIRY_MINUTES);

    // Store token hash in database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await createPasswordReset(email, user_type, tokenHash, expiresAt);

    // Generate reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Send email with reset link
    try {
        await sendPasswordResetEmail(email, resetLink, userName);
    } catch (emailError) {
        console.error(`[PasswordReset] Failed to send email`);
        // Don't throw error - token is already created, user can request again if needed
        // In production, you might want to delete the token if email fails
    }
};

/**
 * Validate a password reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} Token record if valid
 * @throws {Error} If token is invalid, expired, or already used
 */
export const validateToken = async (token) => {
    if (!token || typeof token !== 'string') {
        throw new Error('Invalid token');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = await findByTokenHash(tokenHash);

    if (!tokenRecord) {
        throw new Error('Invalid or expired reset token');
    }

    if (tokenRecord.used === 1) {
        throw new Error('This reset link has already been used. Please request a new password reset.');
    }

    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);

    if (expiresAt < now) {
        throw new Error('This reset link has expired. Please request a new password reset.');
    }

    return tokenRecord;
};

/**
 * Reset password using a valid token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password (plain text, will be hashed)
 * @returns {Promise<void>}
 */
export const resetPassword = async (token, newPassword) => {
    // Validate token
    const tokenRecord = await validateToken(token);

    // Validate password strength
    if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the appropriate table
    let userId = null;
    if (tokenRecord.user_type === 'user') {
        const users = await findUserByEmail(tokenRecord.email);
        if (users.length === 0) {
            throw new Error('User not found');
        }
        userId = users[0].uid || users[0].user_id || users[0].id;
        await updateUserPassword(userId, hashedPassword);
    } else if (tokenRecord.user_type === 'admin') {
        const admins = await findAdminByEmail(tokenRecord.email);
        if (admins.length === 0) {
            throw new Error('Admin not found');
        }
        userId = admins[0].aid;
        await updateAdminPassword(userId, hashedPassword);
    } else if (tokenRecord.user_type === 'evaluator') {
        const evaluators = await findEvaluatorByEmail(tokenRecord.email);
        if (evaluators.length === 0) {
            throw new Error('Evaluator not found');
        }
        userId = evaluators[0].evaluator_id;
        await updateEvaluatorPassword(userId, hashedPassword);
    } else {
        throw new Error('Invalid user type in token record');
    }

    // Mark token as used
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await markTokenAsUsed(tokenHash);
};

