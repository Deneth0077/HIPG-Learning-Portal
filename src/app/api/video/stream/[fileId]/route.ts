import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { getDriveClient, getActiveDriveClient } from '@/lib/googleDrive';

// Extract clean Google Drive File ID if full URL was provided
function extractFileId(raw: string): string {
  if (!raw) return '';
  const fileMatch = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const idMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  const cleanMatch = raw.match(/([a-zA-Z0-9_-]{20,})/);
  if (cleanMatch) return cleanMatch[1];
  return raw;
}

// GET /api/video/stream/[fileId]
// Authenticated HTTP Range Streaming endpoint with full Range header support
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const cleanId = extractFileId(fileId);
  const drive = (await getActiveDriveClient()) || getDriveClient();

  if (!drive || cleanId.startsWith('mock')) {
    const accept = req.headers.get('accept') || '';
    if (accept.includes('image') || !req.headers.get('range')) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270" fill="#0A192F"><rect width="480" height="270" fill="#0E2A47"/><rect x="20" y="20" width="440" height="230" rx="12" fill="#143657" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="4 4"/><circle cx="240" cy="110" r="32" fill="#1E4976"/><path d="M228 118 L240 102 L252 118 Z M248 112 L258 100 L266 112 Z" fill="#38BDF8"/><circle cx="230" cy="96" r="4" fill="#FACC15"/><text x="240" y="165" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="bold" font-size="13">HIPG Screenshot Preview</text><text x="240" y="185" dominant-baseline="middle" text-anchor="middle" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="11">Click Replace Screenshot to attach new image</text></svg>`;
      return new NextResponse(svg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // In local dev without Google Drive, return 204 for video
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
      const meta = await drive.files.get({ fileId: cleanId, fields: 'mimeType, size' });
      if (meta.data.mimeType) mimeType = meta.data.mimeType;
    } catch {
      // fallback to video/mp4
    }

    const driveRes = await drive.files.get(
      { fileId: cleanId, alt: 'media' },
      { responseType: 'stream', headers: range ? { Range: range } : {} }
    );

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Disposition', 'inline'); // Force inline display/playback
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=7200');

    if (driveRes.headers) {
      const cr = (driveRes.headers as any)['content-range'] || (driveRes.headers as any).get?.('content-range');
      if (cr) headers.set('Content-Range', String(cr));
      const cl = (driveRes.headers as any)['content-length'] || (driveRes.headers as any).get?.('content-length');
      if (cl) headers.set('Content-Length', String(cl));
    }

    const statusCode = range && driveRes.status === 206 ? 206 : (driveRes.status || 200);
    const webStream = Readable.toWeb(driveRes.data as Readable) as ReadableStream;

    return new NextResponse(webStream, {
      status: statusCode,
      headers,
    });
  } catch (error: any) {
    console.error('Video stream error for fileId', cleanId, error?.message);
    return NextResponse.json({ error: 'Video unavailable' }, { status: 500 });
  }
}
