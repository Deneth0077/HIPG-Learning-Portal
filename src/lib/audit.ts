import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { AuditLogModel } from '@/models';

/**
 * Extract the real client IP address from incoming Next.js / Vercel / proxy request headers.
 */
export function getClientIp(req?: NextRequest | Request | null): string {
  if (!req) return 'unknown';
  const headers = req.headers;

  const candidates = [
    headers.get('x-forwarded-for'),
    headers.get('x-vercel-forwarded-for'),
    headers.get('x-real-ip'),
    headers.get('cf-connecting-ip'),
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const first = raw.split(',')[0].trim();
    if (!first) continue;
    if (first === '::1') return '127.0.0.1 (localhost)';
    if (first.startsWith('::ffff:')) return first.slice(7);
    return first;
  }

  return '127.0.0.1 (localhost)';
}

export interface AuditEntryParams {
  req?: NextRequest | Request | null;
  userId: string;
  username: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

/**
 * Safely persist an immutable audit log entry with client IP, user-agent, and exact server timestamp.
 */
export async function recordAuditLog(params: AuditEntryParams): Promise<void> {
  try {
    const conn = await connectDB();
    if (!conn) return;

    const ipAddress = getClientIp(params.req);
    const userAgent = params.req?.headers.get('user-agent') || undefined;

    await AuditLogModel.create({
      adminId: params.userId,
      adminUsername: params.username,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      ipAddress,
      userAgent,
      details: params.details,
    });
  } catch (err: any) {
    console.warn('Audit log write warning:', err?.message);
  }
}

