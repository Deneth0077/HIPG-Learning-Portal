import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User, SystemModel, ModuleModel, LessonModel, VideoModel, MediaModel, AuditLogModel } from '@/models';
import { SYSTEMS_DATA, BTOS_MODULES } from '@/data/portalData';

export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  const conn = await connectDB();
  if (!conn) {
    // Return structured default statistics in offline/initial mode
    const totalLessons = BTOS_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
    return NextResponse.json({
      stats: {
        totalEmployees: 24,
        totalSystems: SYSTEMS_DATA.length,
        totalModules: BTOS_MODULES.length,
        totalLessons: totalLessons,
        totalVideos: 18,
        totalUserManuals: 7,
        totalImages: 42,
      },
      recentLessons: BTOS_MODULES[3].lessons.slice(0, 4),
      recentUsers: [
        { id: '1', fullName: 'Chathuranga', username: 'chathuranga', role: 'EMPLOYEE', department: 'Port Operations', designation: 'Terminal Engineer', isActive: true },
        { id: '2', fullName: 'Nuwan Perera', username: 'nuwan.p', role: 'EMPLOYEE', department: 'Harbor Control', designation: 'VTMS Supervisor', isActive: true },
        { id: '3', fullName: 'Sandun Jayasuriya', username: 'sandun.j', role: 'EMPLOYEE', department: 'Container Yard', designation: 'CTOS Yard Planner', isActive: true },
      ],
      systemSummary: SYSTEMS_DATA.map((s) => ({
        id: s.id,
        name: s.name,
        fullName: s.fullName,
        topicsCount: s.topicsCount,
        progressPercent: s.progressPercent,
      })),
    });
  }

  try {
    const [
      totalEmployees,
      totalSystems,
      totalModules,
      totalLessons,
      totalVideos,
      totalImages,
      recentUsers,
      recentLessons,
      systems,
    ] = await Promise.all([
      User.countDocuments({ role: 'EMPLOYEE' }),
      SystemModel.countDocuments(),
      ModuleModel.countDocuments(),
      LessonModel.countDocuments(),
      VideoModel.countDocuments(),
      MediaModel.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('-passwordHash'),
      LessonModel.find().sort({ createdAt: -1 }).limit(5),
      SystemModel.find().sort({ displayOrder: 1 }),
    ]);

    return NextResponse.json({
      stats: {
        totalEmployees,
        totalSystems,
        totalModules,
        totalLessons,
        totalVideos,
        totalUserManuals: totalSystems,
        totalImages,
      },
      recentUsers,
      recentLessons,
      systemSummary: systems,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
