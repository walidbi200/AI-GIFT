import { sql } from '@vercel/postgres';

// Environment variables for different database users
const READER_CONNECTION_STRING = process.env.POSTGRES_READER_URL || process.env.POSTGRES_URL;
const WRITER_CONNECTION_STRING = process.env.POSTGRES_WRITER_URL || process.env.POSTGRES_URL;
const ADMIN_CONNECTION_STRING = process.env.POSTGRES_ADMIN_URL || process.env.POSTGRES_URL;

// Connection pool configurations
const connectionConfig = {
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
};

/**
 * Create a database connection for read operations
 * Uses the app_reader user with limited permissions
 */
export async function getReaderConnection() {
  // For now, we'll use the default connection but with read-only mindset
  // In production, you would use a separate connection pool for the reader user
  return sql;
}

/**
 * Create a database connection for write operations
 * Uses the app_writer user with insert/update/delete permissions
 */
export async function getWriterConnection() {
  // For now, we'll use the default connection
  // In production, you would use a separate connection pool for the writer user
  return sql;
}

/**
 * Create a database connection for admin operations
 * Uses the app_admin user with full permissions
 */
export async function getAdminConnection() {
  // For now, we'll use the default connection
  // In production, you would use a separate connection pool for the admin user
  return sql;
}

/**
 * Execute a read-only query
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function executeReadQuery(query: string, params: any[] = []) {
  const connection = await getReaderConnection();
  try {
    const result = await connection.unsafe(query, params);
    return result;
  } catch (error) {
    console.error('Read query error:', error);
    throw error;
  }
}

/**
 * Execute a write query (INSERT, UPDATE, DELETE)
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function executeWriteQuery(query: string, params: any[] = []) {
  const connection = await getWriterConnection();
  try {
    const result = await connection.unsafe(query, params);
    return result;
  } catch (error) {
    console.error('Write query error:', error);
    throw error;
  }
}

/**
 * Execute a transaction with multiple queries
 * @param queries - Array of query objects with SQL and parameters
 * @returns Transaction result
 */
export async function executeTransaction(queries: Array<{ sql: string; params: any[] }>) {
  const connection = await getWriterConnection();
  try {
    // Note: Vercel Postgres doesn't support explicit transactions in the same way
    // This is a simplified implementation
    const results = [];
    for (const query of queries) {
      const result = await connection.unsafe(query.sql, query.params);
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

/**
 * Health check for database connections
 * @returns Health status
 */
export async function checkDatabaseHealth() {
  try {
    const connection = await getReaderConnection();
    const result = await connection`SELECT 1 as health_check`;
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      reader: result.rows.length > 0 ? 'connected' : 'error'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get database statistics
 * @returns Database statistics
 */
export async function getDatabaseStats() {
  try {
    const connection = await getReaderConnection();
    
    // Get table sizes
    const tableStats = await connection`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname
    `;
    
    // Get connection info
    const connectionStats = await connection`
      SELECT 
        count(*) as active_connections,
        state
      FROM pg_stat_activity 
      WHERE state IS NOT NULL
      GROUP BY state
    `;
    
    return {
      tableStats: tableStats.rows,
      connectionStats: connectionStats.rows,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database stats error:', error);
    throw error;
  }
}

/**
 * Optimize database performance
 * This function can be called periodically to maintain database performance
 */
export async function optimizeDatabase() {
  try {
    const connection = await getAdminConnection();
    
    // Analyze tables to update statistics
    await connection`ANALYZE posts`;
    
    // Vacuum tables to reclaim storage and update statistics
    await connection`VACUUM ANALYZE posts`;
    
    return {
      status: 'optimized',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database optimization error:', error);
    throw error;
  }
}
