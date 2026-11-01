import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { LearningProgressModel, BookmarkModel } from '@/models';

// GET /api/learning/progress - Get user's progress & statistics
export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({
      overallPercent: 28,
      completedCount: 36,
      totalCount: 128,
      recentWatched: [
        { lessonId: 'cargo-id-gen', title: 'BTOS - Cargo ID Generation', progressPercent: 50, duration: '12:36' },
        { lessonId: 'ctos-create-yard-plan', title: 'CTOS - Create Yard Plan', progressPercent: 25, duration: '08:21' },
      ],
    });
  }

  const [progressRecords, completedCount, bookmarks] = await Promise.all([
    LearningProgressModel.find({ userId: session.userId }).sort({ lastWatchedAt: -1 }),
    LearningProgressModel.countDocuments({ userId: session.userId, status: 'COMPLETED' }),
    BookmarkModel.find({ userId: session.userId }),
  ]);

  return NextResponse.json({
    progressRecords,
    completedCount,
    bookmarks,
  });
}

// POST /api/learning/progress - Update progress or mark as complete
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const { lessonId, systemId, progressPercentage, isCompleted } = body;

    if (!lessonId || !systemId) {
      return NextResponse.json({ error: 'lessonId and systemId are required' }, { status: 400 });
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, message: 'Progress recorded (dev mode)' });
    }

    const status = isCompleted ? 'COMPLETED' : 'IN_PROGRESS';
    const percent = isCompleted ? 100 : Number(progressPercentage || 0);

    const record = await LearningProgressModel.findOneAndUpdate(
      { userId: session.userId, lessonId },
      {
        userId: session.userId,
        lessonId,
        systemId,
        status,
        progressPercentage: percent,
        lastWatchedAt: new Date(),
        ...(isCompleted ? { completedAt: new Date() } : {}),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
