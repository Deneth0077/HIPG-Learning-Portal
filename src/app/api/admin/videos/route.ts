import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uploadVideoToDrive, ensureDriveFolder } from '@/lib/googleDrive';
import { connectDB } from '@/lib/db';
import { VideoModel, AuditLogModel, LessonModel } from '@/models';

// GET /api/admin/videos - List videos
export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({
      videos: [
        {
          _id: 'v1',
          title: 'BTOS - Cargo ID Generation',
          driveFileId: '1AbC_mock_cargo_id_drive_id',
          duration: '12:36',
          systemId: 'btos',
          moduleId: 'mod-04',
          lessonId: 'cargo-id-gen',
          createdAt: new Date(),
        },
        {
          _id: 'v2',
          title: 'CTOS - Create Yard Plan',
          driveFileId: '2XyZ_mock_yard_plan_drive_id',
          duration: '08:21',
          systemId: 'ctos',
          moduleId: 'mod-02',
          lessonId: 'ctos-create-yard-plan',
          createdAt: new Date(),
        },
      ],
    });
  }

  const videos = await VideoModel.find().sort({ createdAt: -1 });
  return NextResponse.json({ videos });
}

// POST /api/admin/videos - Upload video to Google Drive or attach existing Drive File ID
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const contentType = req.headers.get('content-type') || '';
    let title: string;
    let driveFileId: string;
    let duration: string = '10:00';
    let systemId: string = 'btos';
    let moduleId: string = 'mod-04';
    let lessonId: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      title = (formData.get('title') as string) || file?.name || 'Untitled Video';
      duration = (formData.get('duration') as string) || '10:00';
      systemId = (formData.get('systemId') as string) || 'btos';
      moduleId = (formData.get('moduleId') as string) || 'mod-04';
      lessonId = (formData.get('lessonId') as string) || undefined;

      if (!file) {
        return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const driveMeta = await uploadVideoToDrive(file.name, buffer);
      driveFileId = driveMeta.fileId;
    } else {
      // JSON payload attaching existing Drive File ID
      const body = await req.json();
      title = body.title;
      driveFileId = body.driveFileId;
      duration = body.duration || '10:00';
      systemId = body.systemId || 'btos';
      moduleId = body.moduleId || 'mod-04';
      lessonId = body.lessonId;

      if (!driveFileId || !title) {
        return NextResponse.json({ error: 'title and driveFileId are required' }, { status: 400 });
      }
    }

    const conn = await connectDB();
    let videoDoc;
    if (conn) {
      videoDoc = await VideoModel.create({
        title,
        driveFileId,
        duration,
        systemId,
        moduleId,
        lessonId,
      });

      if (lessonId) {
        await LessonModel.findOneAndUpdate(
          { slug: lessonId },
          { videoDriveId: driveFileId, duration }
        );
      }

      await AuditLogModel.create({
        adminId: adminCheck.userId,
        adminUsername: adminCheck.username,
        action: 'VIDEO_ATTACHED',
        resourceType: 'Video',
        resourceId: videoDoc._id.toString(),
        details: { driveFileId, title, lessonId },
      });
    }

    return NextResponse.json({
      success: true,
      video: videoDoc || {
        _id: 'mock-' + Date.now(),
        title,
        driveFileId,
        duration,
        systemId,
        lessonId,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('Video upload error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
