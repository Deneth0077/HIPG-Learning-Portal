import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { makeDriveFilePublic, findRecentDriveFile } from '@/lib/googleDrive';
import { connectDB } from '@/lib/db';
import { LessonModel, VideoModel, AuditLogModel } from '@/models';

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    let { fileId, fileName, moduleFolderId, lessonId, systemId, moduleId, title } = body;

    if (!fileId && fileName) {
      fileId = await findRecentDriveFile(fileName, moduleFolderId);
    }

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

      // 3. If lessonId is provided, link to lesson immediately in MongoDB
      if (lessonId) {
        const normId = lessonId.replace(/-installation$/, '-install');
        const altNorm = lessonId.replace(/-install$/, '-installation');
        const safeTitle = (title || lessonId.replace(/-/g, ' ')).trim() || 'Lesson Video';
        const escapedTitle = safeTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const generatedSlug =
          safeTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || lessonId;

        const orConditions: Record<string, unknown>[] = [
          { slug: lessonId },
          { slug: normId },
          { slug: altNorm },
          { slug: generatedSlug },
          { title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') } },
        ];

        if (/^[0-9a-fA-F]{24}$/.test(lessonId)) {
          orConditions.unshift({ _id: lessonId });
        }

        const existing = await LessonModel.findOne({ $or: orConditions }).sort({ updatedAt: -1 });
        if (existing) {
          existing.videoDriveId = fileId;
          existing.isPublished = true;
          await existing.save();
        } else {
          await LessonModel.create({
            systemId: (systemId || 'btos').toLowerCase(),
            moduleId: moduleId || 'mod-01',
            title: safeTitle,
            slug: lessonId || generatedSlug,
            videoDriveId: fileId,
            isPublished: true,
          });
        }

        try {
          await AuditLogModel.create({
            adminId: adminCheck.userId,
            adminUsername: adminCheck.username,
            action: 'DRIVE_VIDEO_LINKED_TO_LESSON',
            resourceType: 'Lesson',
            resourceId: lessonId,
            details: { fileId, systemId, moduleId, title },
          });
        } catch (auditErr: any) {
          console.warn('AuditLog warning:', auditErr?.message);
        }
      }
    }

    return NextResponse.json({ success: true, fileId, linkedLessonId: lessonId });
  } catch (err: any) {
    console.error('Error in drive permissions route:', err?.message);
    return NextResponse.json({ error: err?.message || 'Failed to update permissions' }, { status: 500 });
  }
}
