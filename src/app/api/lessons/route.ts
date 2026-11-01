import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { LessonModel, AuditLogModel } from '@/models';
import { BTOS_MODULES, MANUAL_CARGO_ID } from '@/data/portalData';

const LessonSchema = z.object({
  systemId: z.string().min(1),
  moduleId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(''),
  duration: z.string().default('10:00'),
  order: z.string().default('1.1'),
  displayOrder: z.number().default(0),
  isPublished: z.boolean().default(true),
  videoDriveId: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  manualContent: z.string().optional().nullable(),
  manualSteps: z.array(z.any()).optional().nullable(),
  sections: z.array(z.any()).optional().nullable(),
  learningObjectives: z.array(z.string()).optional().nullable(),
});

// GET /api/lessons - Query lessons
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const systemId = searchParams.get('systemId');
  const moduleId = searchParams.get('moduleId');

  const conn = await connectDB();
  if (!conn) {
    const all = BTOS_MODULES.flatMap(m => m.lessons);
    return NextResponse.json({ lessons: all });
  }

  const query: Record<string, unknown> = { isPublished: true };
  if (systemId) query.systemId = systemId;
  if (moduleId) query.moduleId = moduleId;

  const lessons = await LessonModel.find(query).sort({ displayOrder: 1 });
  return NextResponse.json({ lessons });
}

// POST /api/lessons - Create lesson
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const result = LessonSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues.map(e => e.message) }, { status: 400 });
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, lesson: { ...result.data, _id: 'mock-' + Date.now() } });
    }

    const newLesson: any = await LessonModel.create(result.data as any);
    await AuditLogModel.create({
      adminId: adminCheck.userId,
      adminUsername: adminCheck.username,
      action: 'LESSON_CREATED',
      resourceType: 'Lesson',
      resourceId: newLesson._id.toString(),
      details: { title: newLesson.title },
    });

    return NextResponse.json({ success: true, lesson: newLesson }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
