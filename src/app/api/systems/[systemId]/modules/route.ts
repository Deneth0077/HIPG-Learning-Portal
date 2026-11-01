import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ModuleModel, AuditLogModel } from '@/models';
import { BTOS_MODULES } from '@/data/portalData';

const ModuleSchema = z.object({
  systemId: z.string().min(1, 'System ID is required').trim(),
  moduleNumber: z.string().min(1, 'Module number is required').trim(),
  title: z.string().min(1, 'Module title is required').trim(),
  slug: z.string().min(1, 'Slug is required').trim(),
  description: z.string().optional(),
  displayOrder: z.number().default(0),
  isPublished: z.boolean().default(true),
});

// GET /api/systems/[systemId]/modules
export async function GET(req: NextRequest, { params }: { params: Promise<{ systemId: string }> }) {
  const { systemId } = await params;
  const conn = await connectDB();
  if (!conn) {
    if (systemId === 'btos') return NextResponse.json({ modules: BTOS_MODULES });
    return NextResponse.json({ modules: [] });
  }

  const modules = await ModuleModel.find({ systemId }).sort({ displayOrder: 1 });
  if (modules.length === 0 && systemId === 'btos') {
    return NextResponse.json({ modules: BTOS_MODULES });
  }
  return NextResponse.json({ modules });
}

// POST /api/systems/[systemId]/modules - Create Module
export async function POST(req: NextRequest, { params }: { params: Promise<{ systemId: string }> }) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { systemId } = await params;
  try {
    const body = await req.json();
    const result = ModuleSchema.safeParse({ ...body, systemId });
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues.map(e => e.message) }, { status: 400 });
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, module: { ...result.data, _id: 'mock-' + Date.now() } });
    }

    const newMod = await ModuleModel.create(result.data);
    await AuditLogModel.create({
      adminId: adminCheck.userId,
      adminUsername: adminCheck.username,
      action: 'MODULE_CREATED',
      resourceType: 'Module',
      resourceId: newMod._id.toString(),
      details: { title: newMod.title, systemId },
    });

    return NextResponse.json({ success: true, module: newMod }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
