import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { LessonModel, AuditLogModel } from '@/models';

const LessonUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.string().optional(),
  order: z.string().optional(),
  displayOrder: z.number().optional(),
  isPublished: z.boolean().optional(),
  videoDriveId: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  manualContent: z.string().optional().nullable(),
  manualSteps: z.array(z.any()).optional().nullable(),
  sections: z.array(z.any()).optional().nullable(),
  learningObjectives: z.array(z.string()).optional().nullable(),
});

// GET /api/lessons/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  }

  const lesson = await LessonModel.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { slug: id }],
  });

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  return NextResponse.json({ lesson });
}

// PUT /api/lessons/[id] - Update lesson
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await params;
  try {
    const body = await req.json();
    const result = LessonUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, lesson: { ...body, id } });
    }

    const updated = await LessonModel.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { slug: id }] },
      { $set: result.data },
      { new: true }
    );

    if (!updated) {
      // If not found by query, attempt creation or update
      const created: any = await LessonModel.create({
        ...result.data,
        systemId: body.systemId || 'btos',
        moduleId: body.moduleId || 'mod-01',
        title: body.title || 'Lesson',
        slug: body.slug || id,
      } as any);

      return NextResponse.json({ success: true, lesson: created });
    }

    await AuditLogModel.create({
      adminId: adminCheck.userId,
      adminUsername: adminCheck.username,
      action: 'LESSON_UPDATED',
      resourceType: 'Lesson',
      resourceId: (updated as any)._id?.toString() || id,
      details: { title: (updated as any).title || body.title },
    });

    return NextResponse.json({ success: true, lesson: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/lessons/[id] - Delete lesson
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await params;
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true });
    }

    const deleted = await LessonModel.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { slug: id }],
    });

    if (deleted) {
      await AuditLogModel.create({
        adminId: adminCheck.userId,
        adminUsername: adminCheck.username,
        action: 'LESSON_DELETED',
        resourceType: 'Lesson',
        resourceId: deleted._id.toString(),
        details: { title: deleted.title },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
