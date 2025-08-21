import { sql } from '@vercel/postgres';

// Database connection configuration
interface DBConfig {
  url: string;
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
}

// Environment-specific configurations
const dbConfigs: Record<string, DBConfig> = {
  development: {
    url: process.env.POSTGRES_URL || '',
    maxConnections: 10,
    idleTimeout: 30000,
    connectionTimeout: 5000,
  },
  production: {
    url: process.env.POSTGRES_URL || '',
    maxConnections: 20,
    idleTimeout: 60000,
    connectionTimeout: 10000,
  },
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';
const config = dbConfigs[environment];

// Connection pool for read operations (public endpoints)
export const readPool = {
  query: async (text: string, params?: any[]) => {
    try {
      const result = await sql.query(text, params);
      return result;
    } catch (error) {
      console.error('Read pool query error:', error);
      throw error;
    }
  },
  
  // Convenience methods for common read operations
  getPost: async (id: number) => {
    return await sql`SELECT * FROM posts WHERE id = ${id} AND status = 'published'`;
  },
  
  getPosts: async (limit: number = 10, offset: number = 0) => {
    return await sql`
      SELECT * FROM posts 
      WHERE status = 'published' 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
  },
  
  getPostBySlug: async (slug: string) => {
    return await sql`SELECT * FROM posts WHERE slug = ${slug} AND status = 'published'`;
  },
  
  searchPosts: async (query: string, limit: number = 10) => {
    return await sql`
      SELECT * FROM posts 
      WHERE status = 'published' 
      AND (
        title ILIKE ${`%${query}%`} 
        OR content ILIKE ${`%${query}%`}
        OR primary_keyword ILIKE ${`%${query}%`}
      )
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
  },
  
  getPostsByTag: async (tag: string, limit: number = 10) => {
    return await sql`
      SELECT * FROM posts 
      WHERE status = 'published' 
      AND ${tag} = ANY(tags)
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
  },
  
  getPostStats: async () => {
    const totalResult = await sql`SELECT COUNT(*) as total FROM posts WHERE status = 'published'`;
    const monthlyResult = await sql`SELECT COUNT(*) as monthly FROM posts WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) AND status = 'published'`;
    const weeklyResult = await sql`SELECT COUNT(*) as weekly FROM posts WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE) AND status = 'published'`;
    
    return {
      total: parseInt(totalResult.rows[0]?.total || '0'),
      monthly: parseInt(monthlyResult.rows[0]?.monthly || '0'),
      weekly: parseInt(weeklyResult.rows[0]?.weekly || '0'),
    };
  },
};

// Connection pool for write operations (authenticated endpoints)
export const writePool = {
  query: async (text: string, params?: any[]) => {
    try {
      const result = await sql.query(text, params);
      return result;
    } catch (error) {
      console.error('Write pool query error:', error);
      throw error;
    }
  },
  
  // Convenience methods for common write operations
  createPost: async (postData: any, userId: string) => {
    const {
      title, description, content, tags, primaryKeyword,
      targetAudience, toneOfVoice, featuredImage, status
    } = postData;
    
    const wordCount = content.trim().split(/\s+/).length;
    const slug = generateSlug(title);
    
    return await sql`
      INSERT INTO posts (
        slug, title, description, content, tags, primary_keyword,
        word_count, status, target_audience, tone_of_voice, featured_image,
        created_by, created_at, updated_at
      )
      VALUES (
        ${slug}, ${title}, ${description}, ${content}, ${tags}, ${primaryKeyword},
        ${wordCount}, ${status}, ${targetAudience}, ${toneOfVoice}, ${featuredImage},
        ${userId}, NOW(), NOW()
      )
      RETURNING *
    `;
  },
  
  updatePost: async (id: number, postData: any, userId: string) => {
    const {
      title, description, content, tags, primaryKeyword,
      targetAudience, toneOfVoice, featuredImage, status
    } = postData;
    
    const wordCount = content.trim().split(/\s+/).length;
    
    return await sql`
      UPDATE posts SET
        title = ${title},
        description = ${description},
        content = ${content},
        tags = ${tags},
        primary_keyword = ${primaryKeyword},
        word_count = ${wordCount},
        status = ${status},
        target_audience = ${targetAudience},
        tone_of_voice = ${toneOfVoice},
        featured_image = ${featuredImage},
        updated_by = ${userId},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
  },
  
  deletePost: async (id: number, userId: string) => {
    // Soft delete by updating status to 'deleted'
    return await sql`
      UPDATE posts SET
        status = 'deleted',
        deleted_by = ${userId},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
  },
  
  // Audit logging
  logAuditEvent: async (auditData: {
    userId: string;
    action: string;
    tableName: string;
    recordId: number;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) => {
    const {
      userId, action, tableName, recordId,
      oldValues, newValues, ipAddress, userAgent
    } = auditData;
    
    return await sql`
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id,
        old_values, new_values, ip_address, user_agent
      ) VALUES (
        ${userId}, ${action}, ${tableName}, ${recordId},
        ${oldValues ? JSON.stringify(oldValues) : null},
        ${newValues ? JSON.stringify(newValues) : null},
        ${ipAddress}, ${userAgent}
      )
    `;
  },
};

// Admin pool for administrative operations
export const adminPool = {
  query: async (text: string, params?: any[]) => {
    try {
      const result = await sql.query(text, params);
      return result;
    } catch (error) {
      console.error('Admin pool query error:', error);
      throw error;
    }
  },
  
  // Administrative operations
  getAllPosts: async (limit: number = 50, offset: number = 0) => {
    return await sql`
      SELECT * FROM posts 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
  },
  
  getAuditLogs: async (limit: number = 100, offset: number = 0) => {
    return await sql`
      SELECT * FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
  },
  
  getAuditLogsByUser: async (userId: string, limit: number = 50) => {
    return await sql`
      SELECT * FROM audit_logs 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
  },
  
  // Database maintenance
  vacuumTable: async (tableName: string) => {
    return await sql`VACUUM ANALYZE ${sql(tableName)}`;
  },
  
  reindexTable: async (tableName: string) => {
    return await sql`REINDEX TABLE ${sql(tableName)}`;
  },
};

// Utility function to generate slugs
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  const uniqueId = Date.now().toString(36).slice(-6);
  return `${baseSlug}-${uniqueId}`;
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: string;
}> {
  try {
    const result = await sql`SELECT 1 as health_check`;
    return {
      status: 'healthy',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString(),
    };
  }
}

// Export the main sql instance for backward compatibility
export { sql };
