import { connectToDatabase } from '../config/db.js';

// Common Field Operations
export const createCommonField = async (field_name, field_type, is_required = true) => {
    const pool = await connectToDatabase();
    const sql = `
      INSERT INTO common_fields (field_name, field_type, is_required)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [field_name, field_type, is_required ? 1 : 0]);
    
    const selectSql = `SELECT * FROM common_fields WHERE common_field_id = ?`;
    const [rows] = await pool.execute(selectSql, [result.insertId]);
    return rows[0];
};

export const getAllCommonFields = async () => {
    try {
        const pool = await connectToDatabase();
        const sql = `SELECT * FROM common_fields ORDER BY common_field_id ASC`;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(`Failed to fetch common fields: ${error.message}`);
    }
};

export const getCommonFieldById = async (common_field_id) => {
    const pool = await connectToDatabase();
    const sql = `SELECT * FROM common_fields WHERE common_field_id = ?`;
    const [rows] = await pool.execute(sql, [common_field_id]);
    return rows[0];
};

export const updateCommonField = async (common_field_id, field_name, field_type, is_required) => {
    const pool = await connectToDatabase();
    const sql = `
      UPDATE common_fields
      SET field_name = ?, field_type = ?, is_required = ?
      WHERE common_field_id = ?
    `;
    await pool.execute(sql, [field_name, field_type, is_required ? 1 : 0, common_field_id]);
    
    const selectSql = `SELECT * FROM common_fields WHERE common_field_id = ?`;
    const [rows] = await pool.execute(selectSql, [common_field_id]);
    return rows[0];
};

export const deleteCommonField = async (common_field_id) => {
    const pool = await connectToDatabase();
    const sql = `DELETE FROM common_fields WHERE common_field_id = ?`;
    const [result] = await pool.execute(sql, [common_field_id]);
    return result.affectedRows > 0;
};

// Prize Specific Field Operations
export const createPrizeSpecificField = async (prize_id, field_name, field_type, is_required = true) => {
    const pool = await connectToDatabase();
    const sql = `
      INSERT INTO prize_specific_fields (prize_id, field_name, field_type, is_required)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [prize_id, field_name, field_type, is_required ? 1 : 0]);
    
    const selectSql = `SELECT * FROM prize_specific_fields WHERE prize_specific_field_id = ?`;
    const [rows] = await pool.execute(selectSql, [result.insertId]);
    return rows[0];
};

export const createPrizeSpecificFieldsBulk = async (prize_id, fields = []) => {
    const normalizedPrizeId = Number(prize_id);
    if (!Number.isFinite(normalizedPrizeId) || normalizedPrizeId <= 0) {
        throw new Error('Invalid prize ID');
    }

    if (!Array.isArray(fields) || fields.length === 0) {
        throw new Error('At least one prize specific field is required');
    }

    const pool = await connectToDatabase();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const rows = fields.map((field) => [
            normalizedPrizeId,
            field.field_name,
            field.field_type,
            field.is_required ? 1 : 0,
        ]);

        const placeholders = rows.map(() => '(?, ?, ?, ?)').join(', ');
        const params = rows.flat();

        const insertSql = `
          INSERT INTO prize_specific_fields (prize_id, field_name, field_type, is_required)
          VALUES ${placeholders}
        `;

        const [result] = await connection.execute(insertSql, params);

        const firstId = Number(result.insertId);
        const insertedCount = Number(result.affectedRows || rows.length);
        const lastId = firstId + insertedCount - 1;

        const selectSql = `
          SELECT * FROM prize_specific_fields
          WHERE prize_specific_field_id BETWEEN ? AND ?
          ORDER BY prize_specific_field_id ASC
        `;
        const [insertedRows] = await connection.execute(selectSql, [firstId, lastId]);

        await connection.commit();
        return insertedRows;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const getAllPrizeSpecificFields = async () => {
    try {
        const pool = await connectToDatabase();
        const sql = `SELECT * FROM prize_specific_fields ORDER BY prize_specific_field_id DESC`;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(`Failed to fetch prize specific fields: ${error.message}`);
    }
};

export const getPrizeSpecificFieldsByPrizeId = async (prize_id) => {
    try {
        const pool = await connectToDatabase();
        const sql = `SELECT * FROM prize_specific_fields WHERE prize_id = ? ORDER BY prize_specific_field_id ASC`;
        const [rows] = await pool.execute(sql, [prize_id]);
        return rows;
    } catch (error) {
        throw new Error(`Failed to fetch prize specific fields: ${error.message}`);
    }
};

export const getPrizeSpecificFieldById = async (prize_specific_field_id) => {
    const pool = await connectToDatabase();
    const sql = `SELECT * FROM prize_specific_fields WHERE prize_specific_field_id = ?`;
    const [rows] = await pool.execute(sql, [prize_specific_field_id]);
    return rows[0];
};

export const updatePrizeSpecificField = async (prize_specific_field_id, field_name, field_type, is_required) => {
    const pool = await connectToDatabase();
    const sql = `
      UPDATE prize_specific_fields
      SET field_name = ?, field_type = ?, is_required = ?
      WHERE prize_specific_field_id = ?
    `;
    await pool.execute(sql, [field_name, field_type, is_required ? 1 : 0, prize_specific_field_id]);
    
    const selectSql = `SELECT * FROM prize_specific_fields WHERE prize_specific_field_id = ?`;
    const [rows] = await pool.execute(selectSql, [prize_specific_field_id]);
    return rows[0];
};

export const deletePrizeSpecificField = async (prize_specific_field_id) => {
    const pool = await connectToDatabase();
    const sql = `DELETE FROM prize_specific_fields WHERE prize_specific_field_id = ?`;
    const [result] = await pool.execute(sql, [prize_specific_field_id]);
    return result.affectedRows > 0;
};

