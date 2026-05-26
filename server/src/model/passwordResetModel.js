import { connectToDatabase } from '../config/db.js';

export const createPasswordReset = async (email, user_type, token_hash, expires_at) => {
    const pool = await connectToDatabase();
    const sql = `
        INSERT INTO password_resets (email, user_type, token_hash, expires_at)
        VALUES (?, ?, ?, ?)
    `;
    await pool.execute(sql, [email, user_type, token_hash, expires_at]);
};

export const findByTokenHash = async (token_hash) => {
    const pool = await connectToDatabase();
    const sql = `SELECT * FROM password_resets WHERE token_hash = ?`;
    const [rows] = await pool.execute(sql, [token_hash]);
    return rows.length > 0 ? rows[0] : null;
};

export const markTokenAsUsed = async (token_hash) => {
    const pool = await connectToDatabase();
    const sql = `UPDATE password_resets SET used = 1 WHERE token_hash = ?`;
    await pool.execute(sql, [token_hash]);
};

export const deleteExpiredTokens = async () => {
    const pool = await connectToDatabase();
    const sql = `DELETE FROM password_resets WHERE expires_at < NOW() OR used = 1`;
    const [result] = await pool.execute(sql);
    return result.affectedRows;
};

