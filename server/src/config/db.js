import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { env } from './env.js';
dotenv.config(); 

let pool;

// Validate required database environment variables
const validateDbConfig = () => {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET', 'ALLOWED_ORIGINS', 'FRONTEND_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const errorMsg = `Missing required database environment variables: ${missing.join(', ')}. Please check your .env file.`;
    console.error('[DB CONFIG ERROR]', errorMsg);
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    } else {
      console.warn('[DB CONFIG WARNING]', errorMsg);
    }
  }
};

export const connectToDatabase = async () => {
  // Validate configuration before creating pool
  validateDbConfig();
  
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: Number(process.env.DB_POOL_SIZE || 30),
        queueLimit: 0,
      });
      
      // Test the connection
      const connection = await pool.getConnection();
      console.log('[DB] Successfully connected to MySQL database:', env.DB_NAME);
      connection.release();
    } catch (error) {
      console.error('[DB CONNECTION ERROR]', error.message);
      throw error;
    }
  }
  return pool;
};
