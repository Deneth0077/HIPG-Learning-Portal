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

  // 1. Fetch DB modules and all DB lessons for this system (latest first)
  const dbModules: any[] = await ModuleModel.find({ systemId: sysKey }).sort({ displayOrder: 1 }).lean();
  const dbLessons: any[] = await LessonModel.find({ systemId: sysKey }).sort({ updatedAt: -1 }).lean();

  // If no modules exist in DB, use seedModules as the base list
  const baseModules: any[] = dbModules && dbModules.length > 0 ? dbModules : seedModules;

  // 2. Normalize and merge lessons for each module
  const modulesWithLessons = baseModules.map((mod: any) => {
    const modId = mod.id || mod.slug || mod._id?.toString();
    const fallbackSeed = seedModules.find((s) => s.id === modId || s.title === mod.title);
    const initialLessons: any[] = mod.lessons && mod.lessons.length > 0
      ? mod.lessons
      : (fallbackSeed?.lessons || []);

    // Merge each lesson with DB updates
    const mergedLessons = initialLessons.map((les: any) => {
      const lesId = les.id || les._id?.toString() || les.slug;
      const normSlug = (les.slug || lesId || '').replace(/-installation$/, '-install').replace(/-install$/, '');
      const lesTitle = (les.title || '').trim().toLowerCase();

      // Find matching dbLesson
      const matchedDb = dbLessons.find((dbl: any) => {
        if (dbl._id?.toString() === lesId || dbl.id === lesId) return true;
        if (dbl.slug === lesId || dbl.slug === les.slug) return true;
        const dblNorm = (dbl.slug || '').replace(/-installation$/, '-install').replace(/-install$/, '');
        if (normSlug && dblNorm && normSlug === dblNorm) return true;
        if (dbl.title && dbl.title.trim().toLowerCase() === lesTitle) return true;
        if (dbl.order && les.order && dbl.order === les.order && (dbl.moduleId === modId || dbl.moduleId === mod.slug)) return true;
        return false;
      });

      if (!matchedDb) return les;

      return {
        ...les,
        ...matchedDb,
        id: les.id || (matchedDb as any).id || matchedDb._id?.toString(),
        slug: les.slug || matchedDb.slug,
        videoDriveId: matchedDb.videoDriveId || les.videoDriveId,
        videoUrl: matchedDb.videoUrl || les.videoUrl,
        manualSteps: matchedDb.manualSteps && matchedDb.manualSteps.length > 0 ? matchedDb.manualSteps : les.manualSteps,
        manualContent: matchedDb.manualContent || les.manualContent,
        duration: matchedDb.duration || les.duration,
      };
    });

    // Also include any extra dbLessons created under this module that were not in initialLessons
    const extraDbLessons = dbLessons.filter((dbl: any) => {
      const belongsToThisMod = dbl.moduleId === modId || dbl.moduleId === mod.slug || dbl.moduleId === mod.title;
      if (!belongsToThisMod) return false;
      const alreadyIncluded = mergedLessons.some((ml: any) =>
        ml._id?.toString() === dbl._id?.toString() ||
        ml.id === dbl.id ||
        ml.slug === dbl.slug ||
        (ml.title && dbl.title && ml.title.trim().toLowerCase() === dbl.title.trim().toLowerCase())
      );
      return !alreadyIncluded;
    });

    return {
      ...mod,
      id: modId,
      lessons: [...mergedLessons, ...extraDbLessons],
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
