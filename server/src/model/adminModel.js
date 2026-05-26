import { connectToDatabase } from '../config/db.js';

export const createAdmin = async (full_name, email, password, department = null) => {
    const pool = await connectToDatabase();
    const sql = `
      INSERT INTO admin (full_name, email, password, department)
      VALUES (?, ?, ?, ?)
    `;
    await pool.execute(sql, [full_name, email, password, department]);
};

export const findByEmail = async (email) => {
    const pool = await connectToDatabase();
    const sql = `SELECT * FROM admin WHERE email = ?`;
    const [rows] = await pool.execute(sql, [email]);
    return rows;
};

export const findById = async (aid) => {
    const pool = await connectToDatabase();
    const sql = `SELECT aid, full_name, email, department FROM admin WHERE aid = ?`;
    const [rows] = await pool.execute(sql, [aid]);
    return rows;
};

export const getAllAdmins = async () => {
    try {
        const pool = await connectToDatabase();
        const sql = `SELECT aid, full_name, email, department, created_at FROM admin ORDER BY aid DESC`;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(`Failed to fetch admins: ${error.message}`);
    }
};

export const deleteAdmin = async (aid) => {
    try {
        const pool = await connectToDatabase();
        const sql = `DELETE FROM admin WHERE aid = ?`;
        const [result] = await pool.execute(sql, [aid]);
        
        if (result.affectedRows === 0) {
            throw new Error('Admin not found');
        }
        
        return { success: true, message: 'Admin deleted successfully' };
    } catch (error) {
        throw new Error(`Failed to delete admin: ${error.message}`);
    }
};

export const updatePassword = async (aid, hashedPassword) => {
    try {
        const pool = await connectToDatabase();
        const sql = `UPDATE admin SET password = ? WHERE aid = ?`;
        const [result] = await pool.execute(sql, [hashedPassword, aid]);
        
        if (result.affectedRows === 0) {
            throw new Error('Admin not found');
        }
        
        return { success: true, message: 'Password updated successfully' };
    } catch (error) {
        throw new Error(`Failed to update password: ${error.message}`);
    }
};

