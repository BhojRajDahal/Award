import { requestPasswordReset, resetPassword } from '../services/passwordResetService.js';

/**
 * Handle password reset request
 * POST /api/auth/forgot-password
 * Body: { email: string }
 */
export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                msg: 'Email is required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                msg: 'Invalid email format'
            });
        }

        // Request password reset (only for users)
        await requestPasswordReset(email, 'user');

        // Always return success for security (don't reveal if email exists)
        res.status(200).json({
            msg: 'If an account with that email exists, a password reset link has been sent to your email address.'
        });
    } catch (error) {
        console.error('[forgotPasswordController] Error');
        res.status(500).json({
            msg: 'Failed to process password reset request'
        });
    }
};

/**
 * Handle password reset with token
 * POST /api/auth/reset-password
 * Body: { token: string, newPassword: string }
 */
export const resetPasswordController = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Validate input
        if (!token || !newPassword) {
            return res.status(400).json({
                msg: 'Token and new password are required'
            });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                msg: 'Password must be at least 8 characters long'
            });
        }

        // Reset password
        await resetPassword(token, newPassword);

        res.status(200).json({
            msg: 'Password has been reset successfully. You can now log in with your new password.'
        });
    } catch (error) {
        console.error('[resetPasswordController] Error:', error);
        
        // Determine appropriate status code
        let statusCode = 500;
        if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('used')) {
            statusCode = 400;
        } else if (error.message.includes('not found')) {
            statusCode = 404;
        }

        res.status(statusCode).json({
            msg: error.message || 'Failed to reset password'
        });
    }
};

