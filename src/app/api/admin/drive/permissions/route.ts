import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { makeDriveFilePublic } from '@/lib/googleDrive';
import { connectDB } from '@/lib/db';
import { LessonModel, VideoModel, AuditLogModel } from '@/models';

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const { fileId, lessonId, systemId, moduleId, title } = body;

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    // 1. Ensure file is readable by anyone with link in Google Drive
    await makeDriveFilePublic(fileId);

    const conn = await connectDB();
    if (conn) {
      // 2. Register video in VideoModel
      try {
        await VideoModel.findOneAndUpdate(
          { driveFileId: fileId },
          {
            title: title || 'Module Lesson Video',
            driveFileId: fileId,
            mimeType: 'video/mp4',
            systemId: (systemId || 'btos').toLowerCase(),
          },
          { upsert: true, new: true }
        );
      } catch (err: any) {
        console.warn('VideoModel upsert warning:', err?.message);
      }

      // 3. If lessonId is provided, link to lesson immediately in MongoDB!
      if (lessonId) {
        const normId = lessonId.replace(/-installation$/, '-install');
        const altNorm = lessonId.replace(/-install$/, '-installation');
        const targetTitle = (title || lessonId.replace(/-/g, ' ')).trim();

        await LessonModel.findOneAndUpdate(
          {
            $or: [
              { id: lessonId },
              { slug: lessonId },
              { slug: normId },
              { slug: altNorm },
              { _id: lessonId.match(/^[0-9a-fA-F]{24}$/) ? lessonId : null },
              { title: { $regex: new RegExp(`^${targetTitle}$`, 'i') } },
            ],
          },
          {
            $set: {
              videoDriveId: fileId,
              isPublished: true,
              ...(systemId ? { systemId: systemId.toLowerCase() } : {}),
              ...(moduleId ? { moduleId } : {}),
              ...(title ? { title } : {}),
            },
          },
          { upsert: true, new: true }
        );

        await AuditLogModel.create({
          adminId: adminCheck.userId,
          adminUsername: adminCheck.username,
          action: 'DRIVE_VIDEO_LINKED_TO_LESSON',
          resourceType: 'Lesson',
          resourceId: lessonId,
          details: { fileId, systemId, moduleId, title },
        });
      }
    }

    return NextResponse.json({ success: true, fileId, linkedLessonId: lessonId });
  } catch (err: any) {
    console.error('Error in drive permissions route:', err?.message);
    return NextResponse.json({ error: err?.message || 'Failed to update permissions' }, { status: 500 });
  }
}

