import { connectToDatabase } from '../config/db.js';

export const createUser = async (full_name, email, password) => {
    const pool = await connectToDatabase();
    const sql = `
      INSERT INTO users (full_name, email, password)
      VALUES (?, ?, ?)
    `;
    await pool.execute(sql, [full_name, email, password]);
};

export const findByEmail = async (email) => {
    const pool = await connectToDatabase();
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await pool.execute(sql, [email]);
    return rows;
};

export const findById = async (uid) => {
    const pool = await connectToDatabase();
    const sql = `SELECT uid, full_name, email FROM users WHERE uid = ?`;
    const [rows] = await pool.execute(sql, [uid]);
    return rows;
};

export const getAllUsers = async () => {
    try {
        const pool = await connectToDatabase();
        const sql = `SELECT * FROM users ORDER BY email ASC`;
        const [rows] = await pool.execute(sql);
        
        const mappedRows = rows.map((row) => ({
            id: row.uid || row.user_id || row.id, // Database uses 'uid' as primary key
            uid: row.uid, // Include uid for database compatibility
            user_id: row.uid || row.user_id || row.id, // Normalize to user_id
            full_name: row.full_name || row.name || 'Unknown User',
            email: row.email || '',
            created_at: row.created_at || null
        }));
        
        return mappedRows;
    } catch (error) {
        throw new Error(`Failed to fetch users: ${error.sqlMessage || error.message}`);
    }
};

export const deleteUser = async (userId) => {
    try {
        const pool = await connectToDatabase();
        // Database uses 'uid' as primary key
        const sql = `DELETE FROM users WHERE uid = ?`;
        const [result] = await pool.execute(sql, [userId]);
        
        if (result.affectedRows === 0) {
            throw new Error('User not found');
        }
        
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

export const updatePassword = async (userId, hashedPassword) => {
    try {
        const pool = await connectToDatabase();
        // Database uses 'uid' as primary key
        const sql = `UPDATE users SET password = ? WHERE uid = ?`;
        const [result] = await pool.execute(sql, [hashedPassword, userId]);
        
        if (result.affectedRows === 0) {
            throw new Error('User not found');
        }
        
        return { success: true, message: 'Password updated successfully' };
    } catch (error) {
        throw new Error(`Failed to update password: ${error.message}`);
    }
};