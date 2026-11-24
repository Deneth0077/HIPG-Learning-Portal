import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { initiateResumableDriveUpload } from '@/lib/googleDrive';

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const { fileName, fileSize, mimeType, systemName, moduleName } = body;

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    const { uploadUrl, moduleFolderId } = await initiateResumableDriveUpload(
      fileName,
      fileSize || 0,
      mimeType || 'video/mp4',
      systemName || 'BTOS',
      moduleName || 'General Module'
    );

    return NextResponse.json({
      success: true,
      uploadUrl,
      moduleFolderId,
    });
  } catch (err: any) {
    console.error('Resumable upload session error:', err?.message);
    const msg = err?.message || 'Failed to create upload session';
    const isAuthError = msg.includes('invalid_grant') || msg.includes('not configured') || msg.includes('expired');
    return NextResponse.json(
      {
        success: false,
        isAuthError,
        error: isAuthError
          ? 'Google Drive API authorization expired (invalid_grant). Please renew token in Admin Settings or paste the Google Drive share link directly.'
          : msg,
      },
      { status: 200 }
    );
  }
}

