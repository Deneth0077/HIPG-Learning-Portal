import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDriveClient } from '@/lib/googleDrive';

// GET /api/video/stream/[fileId]
// Authenticated HTTP Range Streaming endpoint with download prevention headers
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  // 1. Require authenticated session (Prevents public access)
  const auth = await requireAuth();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { fileId } = await params;
  const drive = getDriveClient();

  if (!drive || fileId.startsWith('mock')) {
    // In local dev without Google Drive, return 204 or informative header
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Content-Type': 'video/mp4',
        'X-Protected-Stream': 'HIPG-Internal',
      },
    });
  }

  try {
    const range = req.headers.get('range');
    
    // Fetch file metadata to determine exact MIME type
    let mimeType = 'video/mp4';
    try {
      const meta = await drive.files.get({ fileId, fields: 'mimeType' });
      if (meta.data.mimeType) mimeType = meta.data.mimeType;
    } catch {
      // fallback to video/mp4
    }

    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream', headers: range ? { Range: range } : {} }
    );

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Disposition', 'inline'); // Force inline display/playback
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    // Return piped stream
    return new NextResponse(response.data as any, {
      status: range ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error('Video stream error:', error);
    return NextResponse.json({ error: 'Video unavailable' }, { status: 500 });
  }
}
