/**
 * Database error handler utility
 * Converts Supabase/PostgreSQL errors into user-friendly messages
 */

interface DbError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export function handleDbError(error: DbError, context?: string): never {
  const prefix = context ? `[${context}]` : '[DB]';

  console.error(`${prefix} Database error:`, error);

  // PostgreSQL error codes
  if (error.code === 'PGRST116') {
    throw new Error('Kayıt bulunamadı');
  }

  if (error.code === '23505') {
    throw new Error('Bu kayıt zaten mevcut');
  }

  if (error.code === '23503') {
    throw new Error('İlişkili kayıt bulunamadı');
  }

  if (error.code === '42P01') {
    throw new Error('Tablo bulunamadı');
  }

  // JWT/Auth errors
  if (error.message?.includes('JWT')) {
    throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın');
  }

  if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
    throw new Error('Bu işlem için yetkiniz bulunmuyor');
  }

  // Connection errors
  if (error.message?.includes('connection') || error.message?.includes('timeout')) {
    throw new Error('Veritabanı bağlantısı kurulamadı. Lütfen tekrar deneyin');
  }

  // Generic error
  throw new Error(error.message || 'Bir veritabanı hatası oluştu');
}

/**
 * Safe wrapper for database queries
 * Returns null on error instead of throwing
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await queryFn();
  } catch (error: any) {
    console.error(context ? `[${context}]` : '[DB]', 'Query failed:', error);
    return null;
  }
}
