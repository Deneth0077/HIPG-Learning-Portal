import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ModuleModel, AuditLogModel } from '@/models';
import { BTOS_MODULES, ALL_SYSTEM_MODULES } from '@/data/portalData';
import { LessonModel } from '@/models';

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
  const sysKey = (systemId || 'btos').toLowerCase();
  const seedModules = ALL_SYSTEM_MODULES[sysKey] || [];

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ modules: seedModules });
  }

  const modules = await ModuleModel.find({ systemId: sysKey }).sort({ displayOrder: 1 }).lean();
  if (!modules || modules.length === 0) {
    return NextResponse.json({ modules: seedModules });
  }

  // Fetch lessons for this system from DB
  const lessons = await LessonModel.find({ systemId: sysKey }).sort({ order: 1 }).lean();
  const modulesWithLessons = modules.map((mod: any) => {
    const modKey = mod.slug || mod.id || mod._id?.toString();
    const modLessons = lessons.filter(
      (l: any) => l.moduleId === modKey || l.moduleId === mod.slug || l.moduleId === mod._id?.toString()
    );
    const fallbackSeed = seedModules.find((s) => s.id === mod.slug || s.title === mod.title);
    return {
      ...mod,
      id: modKey,
      lessons: modLessons.length > 0 ? modLessons : fallbackSeed?.lessons || [],
    };
  });

  return NextResponse.json({ modules: modulesWithLessons });
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
