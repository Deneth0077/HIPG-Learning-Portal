import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AuditLogModel } from '@/models';

// GET /api/admin/audit - Fetch real immutable audit logs with IP and exact timestamps
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ logs: [], total: 0, dbConnected: false });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action')?.trim();
    const search = searchParams.get('search')?.trim();
    const limitParam = parseInt(searchParams.get('limit') || '100', 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 100;

    const filter: Record<string, unknown> = {};
    if (action && action !== 'ALL') {
      filter.action = action;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { adminUsername: regex },
        { action: regex },
        { resourceType: regex },
        { resourceId: regex },
        { ipAddress: regex },
      ];
    }

    const [docs, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      AuditLogModel.countDocuments(filter),
    ]);

    const logs = docs.map((doc: any) => ({
      id: doc._id.toString(),
      action: doc.action,
      admin: doc.adminUsername,
      adminId: doc.adminId,
      resourceType: doc.resourceType,
      resourceId: doc.resourceId || '',
      ip: doc.ipAddress || (doc.details?.ip as string) || '—',
      userAgent: doc.userAgent || '',
      details: doc.details || {},
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ logs, total, dbConnected: true });
  } catch (err: any) {
    console.error('Audit logs fetch error:', err?.message);
    return NextResponse.json({ error: err?.message || 'Failed to load audit logs' }, { status: 500 });
  }
}

