import { google } from 'googleapis';
import { Readable } from 'stream';

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI || 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1-0TwN8EfD_5UMGbKhs4G2wnC5qGsiOyw';

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

// Find or automatically create a subfolder inside Google Drive parent folder
export async function getOrCreateDriveFolder(folderName: string, parentFolderId: string): Promise<string> {
  const drive = getDriveClient();
  if (!drive) return 'mock-folder-' + folderName;

  try {
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentFolderId}' in parents and trashed=false`;
    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id!;
    }

    // Create folder
    const created = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id',
    });

    return created.data.id!;
  } catch (err) {
    console.warn('Folder creation warning, using root folder:', (err as Error).message);
    return parentFolderId;
  }
}

// Upload buffer directly to module-specific subfolder in Google Drive
// Structure: [ROOT FOLDER] -> [SYSTEM FOLDER (e.g. BTOS)] -> [MODULE FOLDER (e.g. Module 04 - Operational Training)] -> File
export async function uploadToModuleDriveFolder(
  fileName: string,
  buffer: Buffer,
  mimeType: string,
  systemName: string,
  moduleName: string
): Promise<DriveVideoMeta> {
  const drive = getDriveClient();
  if (!drive) {
    return {
      fileId: 'mock-file-' + Date.now(),
      name: fileName,
      mimeType,
      size: `${buffer.length} bytes`,
    };
  }

  // 1. Ensure System Folder exists (e.g. BTOS)
  const systemFolderId = await getOrCreateDriveFolder(systemName.toUpperCase(), ROOT_FOLDER_ID);

  // 2. Ensure Module Folder exists inside System Folder (e.g. Module 04 - Operational Training)
  const moduleFolderId = await getOrCreateDriveFolder(moduleName, systemFolderId);

  // 3. Upload File into the Module Folder
  const media = {
    mimeType,
    body: Readable.from(buffer),
  };

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [moduleFolderId],
    },
    media,
    fields: 'id, name, mimeType, size, webViewLink',
  });

  return {
    fileId: response.data.id || '',
    name: response.data.name || fileName,
    mimeType: response.data.mimeType || mimeType,
    size: response.data.size || undefined,
    webViewLink: response.data.webViewLink || undefined,
  };
}

export async function uploadVideoToDrive(fileName: string, buffer: Buffer, mimeType: string = 'video/mp4'): Promise<DriveVideoMeta> {
  return uploadToModuleDriveFolder(fileName, buffer, mimeType, 'GENERAL', 'Videos');
}

export async function ensureDriveFolder(folderName: string, parentFolderId?: string): Promise<string> {
  return getOrCreateDriveFolder(folderName, parentFolderId || ROOT_FOLDER_ID);
}

