import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uploadToModuleDriveFolder } from '@/lib/googleDrive';
import { connectDB } from '@/lib/db';
import { VideoModel, AuditLogModel } from '@/models';

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const systemName = (formData.get('systemName') as string) || 'BTOS';
    const moduleName = (formData.get('moduleName') as string) || 'General Module';
    const title = (formData.get('title') as string) || file?.name || 'Uploaded File';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds serverless upload limit (4.5 MB). Please upload directly to Google Drive and paste the shareable link in the lesson editor.`,
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly into the Module folder in Google Drive
    const meta = await uploadToModuleDriveFolder(
      file.name,
      buffer,
      file.type || 'application/octet-stream',
      systemName,
      moduleName
    );

    const conn = await connectDB();
    if (conn) {
      await VideoModel.create({
        title,
        driveFileId: meta.fileId,
        mimeType: meta.mimeType,
        systemId: systemName.toLowerCase(),
      });

      await AuditLogModel.create({
        adminId: adminCheck.userId,
        adminUsername: adminCheck.username,
        action: 'DRIVE_MODULE_FILE_UPLOADED',
        resourceType: 'DriveFile',
        resourceId: meta.fileId,
        details: { fileName: file.name, systemName, moduleName },
      });
    }

    return NextResponse.json({
      success: true,
      fileId: meta.fileId,
      name: meta.name,
      mimeType: meta.mimeType,
      url: `/api/video/stream/${meta.fileId}`,
    });
  } catch (error: any) {
    console.error('Module drive upload error:', error);
    const msg = error?.message || 'Drive upload error';
    return NextResponse.json(
      {
        error: msg.includes('invalid_grant')
          ? 'Google Drive API authorization expired. Please paste the Google Drive share link directly into the lesson editor.'
          : msg,
      },
      { status: 500 }
    );
  }
}
