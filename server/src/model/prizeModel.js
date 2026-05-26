import { connectToDatabase } from '../config/db.js';
import { safeLimitOffset } from '../utils/pagination.js';

export const createPrize = async (title, description, openDate, closeDate, isActive = true) => {
  const pool = await connectToDatabase();

  const sql = `
    INSERT INTO prize (title, description, open_date, close_date, is_active)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    title,
    description,
    openDate,
    closeDate,
    isActive ? 1 : 0,
  ]);

  // Fetch and return the full prize object
  const selectSql = `SELECT prize_id, title, description, open_date, close_date, is_active FROM prize WHERE prize_id = ?`;
  const [rows] = await pool.execute(selectSql, [result.insertId]);
  
  if (!rows || rows.length === 0) {
    throw new Error('Failed to retrieve created prize');
  }
  
  return rows[0];
};

export const getAllPrizes = async ({ limit = 50, offset = 0 } = {}) => {
  const pool = await connectToDatabase();
  const { clause } = safeLimitOffset(limit, offset);
  const sql = `SELECT prize_id, title, description, open_date, close_date, is_active FROM prize ORDER BY open_date DESC ${clause}`;
  const [rows] = await pool.execute(sql);
  return rows;
};

export const getPrizesCount = async () => {
  const pool = await connectToDatabase();
  const [rows] = await pool.execute(`SELECT COUNT(*) AS total FROM prize`);
  return rows[0]?.total || 0;
};

export const updatePrizeStatus = async (prizeId, isActive) => {
  const pool = await connectToDatabase();
  const sql = `UPDATE prize SET is_active = ? WHERE prize_id = ?`;
  await pool.execute(sql, [isActive ? 1 : 0, prizeId]);

  const selectSql = `SELECT prize_id, title, description, open_date, close_date, is_active FROM prize WHERE prize_id = ?`;
  const [rows] = await pool.execute(selectSql, [prizeId]);
  return rows[0];
};

export const deletePrize = async (prizeId) => {
  const pool = await connectToDatabase();
  const sql = `DELETE FROM prize WHERE prize_id = ?`;
  const [result] = await pool.execute(sql, [prizeId]);
  return result.affectedRows > 0;
};

export const updatePrize = async (prizeId, data) => {
  const pool = await connectToDatabase();
  const { title, description = null, open_date, close_date, is_active = true } = data;

  const sql = `
    UPDATE prize
    SET title = ?, description = ?, open_date = ?, close_date = ?, is_active = ?
    WHERE prize_id = ?
  `;

  await pool.execute(sql, [
    title,
    description,
    open_date,
    close_date,
    is_active ? 1 : 0,
    prizeId,
  ]);

  const selectSql = `SELECT prize_id, title, description, open_date, close_date, is_active FROM prize WHERE prize_id = ?`;
  const [rows] = await pool.execute(selectSql, [prizeId]);
  return rows[0];
};

