import { connectToDatabase } from '../config/db.js';

export const createEvaluator = async (full_name, email, institution, designation, password) => {
    const pool = await connectToDatabase();
    const sql = `
      INSERT INTO evaluators (full_name, email, institution, designation, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.execute(sql, [full_name, email, institution, designation, password]);
};

export const findByEmail = async (email) => {
    const pool = await connectToDatabase();
    // Use LOWER() for case-insensitive email comparison
    const sql = `SELECT * FROM evaluators WHERE LOWER(email) = LOWER(?)`;
    const [rows] = await pool.execute(sql, [email]);
    return rows;
};

export const findById = async (evaluator_id) => {
    const pool = await connectToDatabase();
    const sql = `SELECT evaluator_id, full_name, email, institution, designation, created_at FROM evaluators WHERE evaluator_id = ?`;
    const [rows] = await pool.execute(sql, [evaluator_id]);
    return rows;
};

export const getAllEvaluators = async () => {
    try {
        const pool = await connectToDatabase();
        const sql = `SELECT evaluator_id, full_name, email, institution, designation, created_at FROM evaluators ORDER BY evaluator_id DESC`;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(`Failed to fetch evaluators: ${error.message}`);
    }
};

export const deleteEvaluator = async (evaluator_id) => {
    try {
        const pool = await connectToDatabase();
        const sql = `DELETE FROM evaluators WHERE evaluator_id = ?`;
        await pool.execute(sql, [evaluator_id]);
    } catch (error) {
        throw new Error(`Failed to delete evaluator: ${error.message}`);
    }
};

export const updatePassword = async (evaluator_id, hashedPassword) => {
    try {
        const pool = await connectToDatabase();
        const sql = `UPDATE evaluators SET password = ? WHERE evaluator_id = ?`;
        const [result] = await pool.execute(sql, [hashedPassword, evaluator_id]);
        
        if (result.affectedRows === 0) {
            throw new Error('Evaluator not found');
        }
        
        return { success: true, message: 'Password updated successfully' };
    } catch (error) {
        throw new Error(`Failed to update password: ${error.message}`);
    }
};

