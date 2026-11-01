import { google } from 'googleapis';
import { Readable } from 'stream';

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI || 'http://localhost:3000/api/admin/videos/oauth2callback';
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

export function getDriveClient() {
  if (!CLIENT_ID || !CLIENT_SECRET || CLIENT_ID.includes('mock')) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  if (REFRESH_TOKEN && !REFRESH_TOKEN.includes('mock')) {
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  }

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export interface DriveVideoMeta {
  fileId: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
}

// Upload buffer to Google Drive
export async function uploadVideoToDrive(
  fileName: string,
  buffer: Buffer,
  folderId?: string
): Promise<DriveVideoMeta> {
  const drive = getDriveClient();
  if (!drive) {
    // Graceful fallback in dev mode without Google API credentials
    return {
      fileId: 'mock-drive-' + Date.now(),
      name: fileName,
      mimeType: 'video/mp4',
      size: `${buffer.length} bytes`,
    };
  }

  const fileMetadata: Record<string, unknown> = {
    name: fileName,
  };
  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const media = {
    mimeType: 'video/mp4',
    body: Readable.from(buffer),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, mimeType, size, webViewLink',
  });

  return {
    fileId: response.data.id || '',
    name: response.data.name || fileName,
    mimeType: response.data.mimeType || 'video/mp4',
    size: response.data.size || undefined,
    webViewLink: response.data.webViewLink || undefined,
  };
}

// Create or get subfolder for System/Module
export async function ensureDriveFolder(folderName: string, parentFolderId?: string): Promise<string> {
  const drive = getDriveClient();
  if (!drive) return 'mock-folder-' + folderName;

  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false` +
    (parentFolderId ? ` and '${parentFolderId}' in parents` : '');

  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const fileMetadata: Record<string, unknown> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    fileMetadata.parents = [parentFolderId];
  }

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  return folder.data.id!;
}
