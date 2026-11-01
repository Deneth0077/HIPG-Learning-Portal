import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ModuleModel, LessonModel, AuditLogModel } from '@/models';

const ModuleUpdateSchema = z.object({
  moduleNumber: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.number().optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/systems/[systemId]/modules/[moduleId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ systemId: string; moduleId: string }> }
) {
  const { systemId, moduleId } = await params;
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  }

  const moduleItem = await ModuleModel.findOne({
    systemId,
    $or: [{ id: moduleId }, { slug: moduleId }, { _id: moduleId.match(/^[0-9a-fA-F]{24}$/) ? moduleId : null }],
  });

  if (!moduleItem) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 });
  }

  return NextResponse.json({ module: moduleItem });
}

// PUT /api/systems/[systemId]/modules/[moduleId] - Update Module
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ systemId: string; moduleId: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { systemId, moduleId } = await params;
  try {
    const body = await req.json();
    const result = ModuleUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, module: { ...body, id: moduleId, systemId } });
    }

    const updated = await ModuleModel.findOneAndUpdate(
      {
        systemId,
        $or: [{ id: moduleId }, { slug: moduleId }, { _id: moduleId.match(/^[0-9a-fA-F]{24}$/) ? moduleId : null }],
      },
      { $set: result.data },
      { new: true }
    );

    if (!updated) {
      // Create if not found
      const created = await ModuleModel.create({
        ...result.data,
        systemId,
        moduleNumber: body.moduleNumber || 'Module',
        title: body.title || 'New Module',
        slug: body.slug || moduleId,
      });
      return NextResponse.json({ success: true, module: created });
    }

    await AuditLogModel.create({
      adminId: adminCheck.userId,
      adminUsername: adminCheck.username,
      action: 'MODULE_UPDATED',
      resourceType: 'Module',
      resourceId: updated._id.toString(),
      details: { title: updated.title, systemId },
    });

    return NextResponse.json({ success: true, module: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/systems/[systemId]/modules/[moduleId] - Delete Module & its Lessons
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ systemId: string; moduleId: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { systemId, moduleId } = await params;
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true });
    }

    const deleted = await ModuleModel.findOneAndDelete({
      systemId,
      $or: [{ id: moduleId }, { slug: moduleId }, { _id: moduleId.match(/^[0-9a-fA-F]{24}$/) ? moduleId : null }],
    });

    if (deleted) {
      // Also delete lessons under this module
      await LessonModel.deleteMany({ moduleId: deleted._id.toString() });
      await LessonModel.deleteMany({ moduleId });

      await AuditLogModel.create({
        adminId: adminCheck.userId,
        adminUsername: adminCheck.username,
        action: 'MODULE_DELETED',
        resourceType: 'Module',
        resourceId: deleted._id.toString(),
        details: { title: deleted.title, systemId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
