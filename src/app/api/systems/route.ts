import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { SystemModel, AuditLogModel } from '@/models';
import { SYSTEMS_DATA } from '@/data/portalData';

const SystemSchema = z.object({
  name: z.string().min(1, 'System name is required').trim(),
  slug: z.string().min(1, 'Slug is required').toLowerCase().trim(),
  fullName: z.string().min(1, 'Full name is required').trim(),
  description: z.string().min(1, 'Description is required'),
  iconType: z.string().default('btos'),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

// GET /api/systems - Public/Employee accessible list of systems
export async function GET() {
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ systems: SYSTEMS_DATA });
  }

  const systems = await SystemModel.find({ isActive: true }).sort({ displayOrder: 1 });
  if (systems.length === 0) {
    return NextResponse.json({ systems: SYSTEMS_DATA });
  }
  return NextResponse.json({ systems });
}

// POST /api/admin/systems - Create system
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const result = SystemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues.map(e => e.message) }, { status: 400 });
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, system: { ...result.data, _id: 'mock-' + Date.now() } });
    }

    const existing = await SystemModel.findOne({ slug: result.data.slug });
    if (existing) {
      return NextResponse.json({ error: 'System with this slug already exists' }, { status: 409 });
    }

    const newSys = await SystemModel.create(result.data);
    await AuditLogModel.create({
      adminId: adminCheck.userId,
      adminUsername: adminCheck.username,
      action: 'SYSTEM_CREATED',
      resourceType: 'System',
      resourceId: newSys._id.toString(),
      details: { slug: newSys.slug },
    });

    return NextResponse.json({ success: true, system: newSys }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
