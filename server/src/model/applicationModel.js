import { connectToDatabase } from '../config/db.js';
import { safeLimitOffset } from '../utils/pagination.js';

// Create a new application
export const createApplication = async (user_id, prize_id, status = 'submitted') => {
    const pool = await connectToDatabase();
    const sql = `
      INSERT INTO applications (user_id, prize_id, status)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [user_id, prize_id, status]);
    
    // Fetch and return the created application
    const selectSql = `
      SELECT application_id, user_id, prize_id, status, submitted_at 
      FROM applications 
      WHERE application_id = ?
    `;
    const [rows] = await pool.execute(selectSql, [result.insertId]);
    return rows[0];
};

export const createApplicationWithFieldValuesTransactional = async ({
    user_id,
    prize_id,
    status = 'submitted',
    commonFieldValues = [],
    specificFieldValues = [],
}) => {
    const pool = await connectToDatabase();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const createSql = `
          INSERT INTO applications (user_id, prize_id, status)
          VALUES (?, ?, ?)
        `;
        const [createResult] = await connection.execute(createSql, [user_id, prize_id, status]);
        const applicationId = createResult.insertId;

        const normalizedCommon = (commonFieldValues || [])
            .map(({ common_field_id, value, file_path }) => ({
                common_field_id: Number(common_field_id),
                value: value ?? null,
                file_path: file_path ?? null,
            }))
            .filter((x) => Number.isFinite(x.common_field_id) && x.common_field_id > 0);

        if (normalizedCommon.length > 0) {
            const placeholders = normalizedCommon.map(() => '(?, ?, ?, ?)').join(',');
            const params = normalizedCommon.flatMap((v) => [applicationId, v.common_field_id, v.value, v.file_path]);
            const commonSql = `
              INSERT INTO application_field_values (application_id, common_field_id, value, file_path)
              VALUES ${placeholders}
            `;
            await connection.execute(commonSql, params);
        }

        const normalizedSpecific = (specificFieldValues || [])
            .map(({ prize_specific_field_id, value, file_path }) => ({
                prize_specific_field_id: Number(prize_specific_field_id),
                value: value ?? null,
                file_path: file_path ?? null,
            }))
            .filter((x) => Number.isFinite(x.prize_specific_field_id) && x.prize_specific_field_id > 0);

        if (normalizedSpecific.length > 0) {
            const placeholders = normalizedSpecific.map(() => '(?, ?, ?, ?)').join(',');
            const params = normalizedSpecific.flatMap((v) => [applicationId, v.prize_specific_field_id, v.value, v.file_path]);
            const specificSql = `
              INSERT INTO application_specific_field_values (application_id, prize_specific_field_id, value, file_path)
              VALUES ${placeholders}
            `;
            await connection.execute(specificSql, params);
        }

        await connection.commit();
        return applicationId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const buildInClause = (ids = []) => {
    const cleanIds = (ids || []).map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0);
    if (cleanIds.length === 0) return { clause: '(NULL)', params: [] };
    return { clause: `(${cleanIds.map(() => '?').join(',')})`, params: cleanIds };
};

// Get all applications (admin only)
export const getAllApplications = async ({ limit = 50, offset = 0 } = {}) => {
    try {
        const pool = await connectToDatabase();
        const { clause } = safeLimitOffset(limit, offset);
        const sql = `
          SELECT a.*, u.full_name as user_name, u.email as user_email, p.title as prize_title
          FROM applications a
          LEFT JOIN users u ON a.user_id = u.uid
          LEFT JOIN prize p ON a.prize_id = p.prize_id
          ORDER BY a.submitted_at DESC
          ${clause}
        `;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
    }
};

export const getAllApplicationsCount = async () => {
    try {
        const pool = await connectToDatabase();
        const sql = `SELECT COUNT(*) AS total FROM applications`;
        const [rows] = await pool.execute(sql);
        return rows[0]?.total || 0;
    } catch (error) {
        throw new Error(`Failed to fetch applications count: ${error.message}`);
    }
};

/**
 * Evaluator dashboard: admin-approved (`accepted`) applications with no `application_marks` row yet.
 * After admin assigns marks, the application no longer appears here.
 */
export const getEvaluatorQueueApplications = async ({ limit = 50, offset = 0 } = {}) => {
    try {
        const pool = await connectToDatabase();
        const { clause } = safeLimitOffset(limit, offset);
        const sql = `
          SELECT a.*, u.full_name AS user_name, u.email AS user_email, p.title AS prize_title
          FROM applications a
          LEFT JOIN users u ON a.user_id = u.uid
          LEFT JOIN prize p ON a.prize_id = p.prize_id
          WHERE a.status = 'accepted'
            AND NOT EXISTS (
              SELECT 1 FROM application_marks m WHERE m.application_id = a.application_id
            )
          ORDER BY a.submitted_at DESC
          ${clause}
        `;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(`Failed to fetch evaluator queue applications: ${error.message}`);
    }
};

export const getEvaluatorQueueApplicationsCount = async () => {
    try {
        const pool = await connectToDatabase();
        const sql = `
          SELECT COUNT(*) AS total
          FROM applications a
          WHERE a.status = 'accepted'
            AND NOT EXISTS (
              SELECT 1 FROM application_marks m WHERE m.application_id = a.application_id
            )
        `;
        const [rows] = await pool.execute(sql);
        return rows[0]?.total || 0;
    } catch (error) {
        throw new Error(`Failed to count evaluator queue applications: ${error.message}`);
    }
};

export const getCommonFieldValuesByApplicationIds = async (applicationIds = []) => {
    const pool = await connectToDatabase();
    const { clause, params } = buildInClause(applicationIds);
    const sql = `
      SELECT afv.*, cf.field_name, cf.field_type, cf.is_required
      FROM application_field_values afv
      LEFT JOIN common_fields cf ON afv.common_field_id = cf.common_field_id
      WHERE afv.application_id IN ${clause}
    `;
    const [rows] = await pool.execute(sql, params);
    return rows || [];
};

export const getSpecificFieldValuesByApplicationIds = async (applicationIds = []) => {
    const pool = await connectToDatabase();
    const { clause, params } = buildInClause(applicationIds);
    const sql = `
      SELECT asfv.*, psf.field_name, psf.field_type, psf.is_required
      FROM application_specific_field_values asfv
      LEFT JOIN prize_specific_fields psf ON asfv.prize_specific_field_id = psf.prize_specific_field_id
      WHERE asfv.application_id IN ${clause}
    `;
    const [rows] = await pool.execute(sql, params);
    return rows || [];
};

// Get application by ID
export const getApplicationById = async (application_id) => {
    try {
        const pool = await connectToDatabase();
        const sql = `
          SELECT a.*, u.full_name as user_name, u.email as user_email, p.title as prize_title, p.description as prize_description
          FROM applications a
          LEFT JOIN users u ON a.user_id = u.uid
          LEFT JOIN prize p ON a.prize_id = p.prize_id
          WHERE a.application_id = ?
        `;
        const [rows] = await pool.execute(sql, [application_id]);
        return rows[0];
    } catch (error) {
        throw new Error(`Failed to fetch application: ${error.message}`);
    }
};

export const insertApplicationFieldValuesBulk = async (application_id, fieldValues = []) => {
    const values = (fieldValues || [])
        .map(({ common_field_id, value, file_path }) => ({
            common_field_id: Number(common_field_id),
            value: value ?? null,
            file_path: file_path ?? null,
        }))
        .filter((x) => Number.isFinite(x.common_field_id) && x.common_field_id > 0);

    if (values.length === 0) return { inserted: 0 };

    const pool = await connectToDatabase();
    const placeholders = values.map(() => '(?, ?, ?, ?)').join(',');
    const params = values.flatMap((v) => [application_id, v.common_field_id, v.value, v.file_path]);
    const sql = `
      INSERT INTO application_field_values (application_id, common_field_id, value, file_path)
      VALUES ${placeholders}
    `;
    await pool.execute(sql, params);
    return { inserted: values.length };
};

export const insertApplicationSpecificFieldValuesBulk = async (application_id, fieldValues = []) => {
    const values = (fieldValues || [])
        .map(({ prize_specific_field_id, value, file_path }) => ({
            prize_specific_field_id: Number(prize_specific_field_id),
            value: value ?? null,
            file_path: file_path ?? null,
        }))
        .filter((x) => Number.isFinite(x.prize_specific_field_id) && x.prize_specific_field_id > 0);

    if (values.length === 0) return { inserted: 0 };

    const pool = await connectToDatabase();
    const placeholders = values.map(() => '(?, ?, ?, ?)').join(',');
    const params = values.flatMap((v) => [application_id, v.prize_specific_field_id, v.value, v.file_path]);
    const sql = `
      INSERT INTO application_specific_field_values (application_id, prize_specific_field_id, value, file_path)
      VALUES ${placeholders}
    `;
    await pool.execute(sql, params);
    return { inserted: values.length };
};

// Get applications by user ID
export const getApplicationsByUserId = async (user_id) => {
    try {
        const pool = await connectToDatabase();
        const sql = `
          SELECT a.*, p.title as prize_title, p.description as prize_description
          FROM applications a
          LEFT JOIN prize p ON a.prize_id = p.prize_id
          WHERE a.user_id = ?
          ORDER BY a.submitted_at DESC
        `;
        const [rows] = await pool.execute(sql, [user_id]);
        return rows;
    } catch (error) {
        throw new Error(`Failed to fetch user applications: ${error.message}`);
    }
};

// Get user profile with all applications and field values
export const getUserProfileWithApplications = async (user_id) => {
    try {
        const pool = await connectToDatabase();
        
        // Get user info
        const userSql = `SELECT uid, full_name, email, created_at FROM users WHERE uid = ?`;
        const [userRows] = await pool.execute(userSql, [user_id]);
        const user = userRows[0];
        
        if (!user) {
            return null;
        }
        
        // Get all applications for this user
        const applications = await getApplicationsByUserId(user_id);

        const applicationIds = applications.map((a) => a.application_id);
        const [commonFieldRows, specificFieldRows] = await Promise.all([
            getCommonFieldValuesByApplicationIds(applicationIds),
            getSpecificFieldValuesByApplicationIds(applicationIds),
        ]);

        const commonByAppId = new Map();
        for (const row of commonFieldRows) {
            const appId = row.application_id;
            if (!commonByAppId.has(appId)) commonByAppId.set(appId, []);
            commonByAppId.get(appId).push(row);
        }
        const specificByAppId = new Map();
        for (const row of specificFieldRows) {
            const appId = row.application_id;
            if (!specificByAppId.has(appId)) specificByAppId.set(appId, []);
            specificByAppId.get(appId).push(row);
        }

        const applicationsWithFields = applications.map((app) => ({
            ...app,
            common_field_values: commonByAppId.get(app.application_id) || [],
            specific_field_values: specificByAppId.get(app.application_id) || [],
        }));
        
        return {
            user: {
                uid: user.uid,
                full_name: user.full_name,
                email: user.email,
                created_at: user.created_at,
            },
            applications: applicationsWithFields,
            total_applications: applications.length,
        };
    } catch (error) {
        throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
};

// Get applications by prize ID
export const getApplicationsByPrizeId = async (prize_id) => {
    try {
        const pool = await connectToDatabase();
        const sql = `
          SELECT a.*, u.full_name as user_name, u.email as user_email
          FROM applications a
          LEFT JOIN users u ON a.user_id = u.uid
          WHERE a.prize_id = ?
          ORDER BY a.submitted_at DESC
        `;
        const [rows] = await pool.execute(sql, [prize_id]);
        return rows;
    } catch (error) {
        throw new Error(`Failed to fetch prize applications: ${error.message}`);
    }
};

// Update application status
export const updateApplicationStatus = async (application_id, status) => {
    const pool = await connectToDatabase();
    const sql = `UPDATE applications SET status = ? WHERE application_id = ?`;
    await pool.execute(sql, [status, application_id]);
    
    return await getApplicationById(application_id);
};

// Save common field value for an application
export const saveApplicationFieldValue = async (application_id, common_field_id, value, file_path = null) => {
    const pool = await connectToDatabase();
    
    // Check if value already exists
    const checkSql = `SELECT id FROM application_field_values WHERE application_id = ? AND common_field_id = ?`;
    const [existing] = await pool.execute(checkSql, [application_id, common_field_id]);
    
    if (existing && existing.length > 0) {
        // Update existing value
        const updateSql = `
          UPDATE application_field_values 
          SET value = ?, file_path = ?
          WHERE application_id = ? AND common_field_id = ?
        `;
        await pool.execute(updateSql, [value, file_path, application_id, common_field_id]);
        return { id: existing[0].id, application_id, common_field_id, value, file_path };
    } else {
        // Insert new value
        const insertSql = `
          INSERT INTO application_field_values (application_id, common_field_id, value, file_path)
          VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.execute(insertSql, [application_id, common_field_id, value, file_path]);
        return { id: result.insertId, application_id, common_field_id, value, file_path };
    }
};

// Save prize-specific field value for an application
export const saveApplicationSpecificFieldValue = async (application_id, prize_specific_field_id, value, file_path = null) => {
    const pool = await connectToDatabase();
    
    // Check if value already exists
    const checkSql = `SELECT id FROM application_specific_field_values WHERE application_id = ? AND prize_specific_field_id = ?`;
    const [existing] = await pool.execute(checkSql, [application_id, prize_specific_field_id]);
    
    if (existing && existing.length > 0) {
        // Update existing value
        const updateSql = `
          UPDATE application_specific_field_values 
          SET value = ?, file_path = ?
          WHERE application_id = ? AND prize_specific_field_id = ?
        `;
        await pool.execute(updateSql, [value, file_path, application_id, prize_specific_field_id]);
        return { id: existing[0].id, application_id, prize_specific_field_id, value, file_path };
    } else {
        // Insert new value
        const insertSql = `
          INSERT INTO application_specific_field_values (application_id, prize_specific_field_id, value, file_path)
          VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.execute(insertSql, [application_id, prize_specific_field_id, value, file_path]);
        return { id: result.insertId, application_id, prize_specific_field_id, value, file_path };
    }
};

// Get application with all field values
export const getApplicationWithFields = async (application_id) => {
    try {
        const pool = await connectToDatabase();
        
        // Get application basic info
        const application = await getApplicationById(application_id);
        if (!application) return null;
        
        // Get common field values
        const commonFieldsSql = `
          SELECT afv.*, cf.field_name, cf.field_type, cf.is_required
          FROM application_field_values afv
          LEFT JOIN common_fields cf ON afv.common_field_id = cf.common_field_id
          WHERE afv.application_id = ?
        `;
        const [commonFieldValues] = await pool.execute(commonFieldsSql, [application_id]);
        
        // Get prize-specific field values
        const specificFieldsSql = `
          SELECT asfv.*, psf.field_name, psf.field_type, psf.is_required
          FROM application_specific_field_values asfv
          LEFT JOIN prize_specific_fields psf ON asfv.prize_specific_field_id = psf.prize_specific_field_id
          WHERE asfv.application_id = ?
        `;
        const [specificFieldValues] = await pool.execute(specificFieldsSql, [application_id]);
        
        return {
            ...application,
            common_field_values: commonFieldValues || [],
            specific_field_values: specificFieldValues || [],
        };
    } catch (error) {
        throw new Error(`Failed to fetch application with fields: ${error.message}`);
    }
};

