import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteDriveFile } from '@/lib/googleDrive';
import { connectDB } from '@/lib/db';
import { LessonModel, VideoModel } from '@/models';
import { recordAuditLog } from '@/lib/audit';

function extractCleanId(raw: string): string {
  const fileMatch = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const idMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return raw.trim();
}

export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const { fileId, lessonId } = body;

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    const cleanId = extractCleanId(String(fileId));

    // 1. Delete from Google Drive
    const driveRes = await deleteDriveFile(cleanId);

    // 2. Unlink from MongoDB LessonModel and VideoModel
    const conn = await connectDB();
    if (conn) {
      try {
        await VideoModel.deleteMany({ driveFileId: cleanId });
      } catch (err: any) {
        console.warn('VideoModel delete warning:', err?.message);
      }

      const lessonFilters: Record<string, unknown>[] = [{ videoDriveId: cleanId }];
      if (lessonId) {
        const normId = lessonId.replace(/-installation$/, '-install');
        const altNorm = lessonId.replace(/-install$/, '-installation');
        lessonFilters.push({ slug: lessonId }, { slug: normId }, { slug: altNorm });
        if (/^[0-9a-fA-F]{24}$/.test(lessonId)) {
          lessonFilters.push({ _id: lessonId });
        }
      }

      await LessonModel.updateMany(
        { $or: lessonFilters },
        { $unset: { videoDriveId: '', videoUrl: '' } }
      );

      await recordAuditLog({
        req,
        userId: adminCheck.userId,
        username: adminCheck.username,
        action: 'DRIVE_VIDEO_DELETED',
        resourceType: 'DriveFile',
        resourceId: cleanId,
        details: { lessonId, deletedFromDrive: driveRes.deleted },
      });
    }

    return NextResponse.json({
      success: true,
      fileId: cleanId,
      deletedFromDrive: driveRes.deleted,
      driveError: driveRes.error,
    });
  } catch (err: any) {
    console.error('Delete drive video error:', err?.message);
    return NextResponse.json({ error: err?.message || 'Failed to delete video' }, { status: 500 });
  }
}

