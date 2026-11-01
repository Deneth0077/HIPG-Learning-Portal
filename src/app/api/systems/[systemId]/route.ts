import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { SystemModel, AuditLogModel } from '@/models';
import { SYSTEMS_DATA } from '@/data/portalData';

const SystemUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  fullName: z.string().min(1).optional(),
  description: z.string().optional(),
  iconType: z.string().optional(),
  color: z.string().optional(),
  topicsCount: z.number().optional(),
  videosCount: z.number().optional(),
  manualsCount: z.number().optional(),
  totalDuration: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/systems/[systemId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  const { systemId } = await params;
  const conn = await connectDB();
  if (!conn) {
    const s = SYSTEMS_DATA.find((item) => item.id === systemId);
    if (s) return NextResponse.json({ system: s });
    return NextResponse.json({ error: 'System not found' }, { status: 404 });
  }

  const system = await SystemModel.findOne({
    $or: [{ slug: systemId.toLowerCase() }, { _id: systemId.match(/^[0-9a-fA-F]{24}$/) ? systemId : null }],
  });

  if (!system) {
    const fallback = SYSTEMS_DATA.find((item) => item.id === systemId);
    if (fallback) return NextResponse.json({ system: fallback });
    return NextResponse.json({ error: 'System not found' }, { status: 404 });
  }

  return NextResponse.json({ system });
}

// PUT /api/systems/[systemId] - Update system
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { systemId } = await params;
  try {
    const body = await req.json();
    const result = SystemUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, system: { ...body, slug: systemId } });
    }

    const updated = await SystemModel.findOneAndUpdate(
      { $or: [{ slug: systemId.toLowerCase() }, { _id: systemId.match(/^[0-9a-fA-F]{24}$/) ? systemId : null }] },
      { $set: result.data },
      { new: true }
    );

    if (!updated) {
      // create if not existing
      const created = await SystemModel.create({
        ...result.data,
        name: body.name || systemId.toUpperCase(),
        slug: systemId.toLowerCase(),
        fullName: body.fullName || body.name || systemId,
        description: body.description || '',
      });
      return NextResponse.json({ success: true, system: created });
    }

    await AuditLogModel.create({
      adminId: adminCheck.userId,
      adminUsername: adminCheck.username,
      action: 'SYSTEM_UPDATED',
      resourceType: 'System',
      resourceId: updated._id.toString(),
      details: { slug: updated.slug },
    });

    return NextResponse.json({ success: true, system: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/systems/[systemId] - Delete system
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { systemId } = await params;
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true });
    }

    const deleted = await SystemModel.findOneAndDelete({
      $or: [{ slug: systemId.toLowerCase() }, { _id: systemId.match(/^[0-9a-fA-F]{24}$/) ? systemId : null }],
    });

    if (deleted) {
      await AuditLogModel.create({
        adminId: adminCheck.userId,
        adminUsername: adminCheck.username,
        action: 'SYSTEM_DELETED',
        resourceType: 'System',
        resourceId: deleted._id.toString(),
        details: { slug: deleted.slug },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
