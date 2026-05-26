import { connectToDatabase } from '../config/db.js';

export const createRefreshSession = async ({
  token_hash,
  user_id = null,
  admin_id = null,
  evaluator_id = null,
  role,
  expires_at,
}) => {
  const pool = await connectToDatabase();
  const sql = `
    INSERT INTO auth_sessions (token_hash, user_id, admin_id, evaluator_id, role, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await pool.execute(sql, [token_hash, user_id, admin_id, evaluator_id, role, expires_at]);
};

export const findRefreshSessionByHash = async (token_hash) => {
  const pool = await connectToDatabase();
  const sql = `
    SELECT session_id, token_hash, user_id, admin_id, evaluator_id, role, expires_at, revoked_at
    FROM auth_sessions
    WHERE token_hash = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [token_hash]);
  return rows[0] || null;
};

export const revokeRefreshSessionByHash = async (token_hash) => {
  const pool = await connectToDatabase();
  const sql = `UPDATE auth_sessions SET revoked_at = NOW() WHERE token_hash = ?`;
  await pool.execute(sql, [token_hash]);
};

export const revokeAllSessionsForPrincipal = async ({ role, user_id = null, admin_id = null, evaluator_id = null }) => {
  const pool = await connectToDatabase();
  let sql = '';
  let params = [];
  if (role === 'user') {
    sql = `UPDATE auth_sessions SET revoked_at = NOW() WHERE role = 'user' AND user_id = ?`;
    params = [user_id];
  } else if (role === 'admin') {
    sql = `UPDATE auth_sessions SET revoked_at = NOW() WHERE role = 'admin' AND admin_id = ?`;
    params = [admin_id];
  } else if (role === 'evaluator') {
    sql = `UPDATE auth_sessions SET revoked_at = NOW() WHERE role = 'evaluator' AND evaluator_id = ?`;
    params = [evaluator_id];
  } else {
    return;
  }
  await pool.execute(sql, params);
};
