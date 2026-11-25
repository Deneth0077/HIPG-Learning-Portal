import { google } from 'googleapis';
import { Readable } from 'stream';
import { connectDB } from '@/lib/db';
import { AppSettingModel } from '@/models';

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

export async function getActiveDriveClient() {
  if (!CLIENT_ID || !CLIENT_SECRET || CLIENT_ID.includes('mock')) {
    return null;
  }

  let activeRefreshToken = REFRESH_TOKEN;
  try {
    const conn = await connectDB();
    if (conn) {
      const dbToken = await AppSettingModel.findOne({ key: 'GOOGLE_DRIVE_REFRESH_TOKEN' });
      if (dbToken?.value) activeRefreshToken = dbToken.value;
    }
  } catch {}

  if (!activeRefreshToken || activeRefreshToken.includes('mock')) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  oauth2Client.setCredentials({ refresh_token: activeRefreshToken });

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
  const drive = (await getActiveDriveClient()) || getDriveClient();
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
  const drive = (await getActiveDriveClient()) || getDriveClient();
  if (!drive) {
    return {
      fileId: 'mock-file-' + Date.now(),
      name: fileName,
      mimeType,
      size: `${buffer.length} bytes`,
    };
  }

  let activeRootFolderId = ROOT_FOLDER_ID;
  try {
    const conn = await connectDB();
    if (conn) {
      const dbFolder = await AppSettingModel.findOne({ key: 'GOOGLE_DRIVE_FOLDER_ID' });
      if (dbFolder?.value) activeRootFolderId = dbFolder.value;
    }
  } catch {}

  // 1. Ensure System Folder exists (e.g. BTOS)
  const systemFolderId = await getOrCreateDriveFolder(systemName.toUpperCase(), activeRootFolderId);

  // 2. Ensure Module Folder exists inside System Folder (e.g. Module 04 - Operational Training)
  const moduleFolderId = await getOrCreateDriveFolder(moduleName, systemFolderId);

  // 3. Upload File into the Module Folder
  const media = {
    mimeType,
    body: Readable.from(buffer),
  };

  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [moduleFolderId],
      },
      media,
      fields: 'id, name, mimeType, size, webViewLink',
    });

    if (response.data.id) {
      makeDriveFilePublic(response.data.id).catch(() => {});
    }

    return {
      fileId: response.data.id || '',
      name: response.data.name || fileName,
      mimeType: response.data.mimeType || mimeType,
      size: response.data.size || undefined,
      webViewLink: response.data.webViewLink || undefined,
    };
  } catch (err: any) {
    console.error('Google Drive files.create error:', err?.message);
    if (err?.message?.includes('invalid_grant') || err?.code === 400) {
      throw new Error('Google Drive API authorization expired (invalid_grant). Please paste the Google Drive share link directly into the lesson editor.');
    }
    throw err;
  }
}

// Make a Google Drive file publicly viewable so any learner or embedded video player can view it
export async function makeDriveFilePublic(fileId: string): Promise<boolean> {
  try {
    const drive = (await getActiveDriveClient()) || getDriveClient();
    if (!drive) return false;
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    return true;
  } catch (err: any) {
    console.warn('Could not set anyoneWithLink permission on file:', err?.message);
    return false;
  }
}

export async function uploadVideoToDrive(fileName: string, buffer: Buffer, mimeType: string = 'video/mp4'): Promise<DriveVideoMeta> {
  return uploadToModuleDriveFolder(fileName, buffer, mimeType, 'GENERAL', 'Videos');
}

export async function ensureDriveFolder(folderName: string, parentFolderId?: string): Promise<string> {
  return getOrCreateDriveFolder(folderName, parentFolderId || ROOT_FOLDER_ID);
}

// Initiate Resumable Upload Session directly with Google Drive API
// Returns a Location session URI that the browser can PUT bytes directly into, bypassing Vercel limits!
export async function initiateResumableDriveUpload(
  fileName: string,
  fileSize: number,
  mimeType: string,
  systemName: string,
  moduleName: string
): Promise<{ uploadUrl: string; moduleFolderId: string }> {
  if (!CLIENT_ID || !CLIENT_SECRET || CLIENT_ID.includes('mock')) {
    throw new Error('Google Drive integration is not configured.');
  }

  let activeRefreshToken = REFRESH_TOKEN;
  let activeRootFolderId = ROOT_FOLDER_ID;

  try {
    const conn = await connectDB();
    if (conn) {
      const dbToken = await AppSettingModel.findOne({ key: 'GOOGLE_DRIVE_REFRESH_TOKEN' });
      if (dbToken?.value) activeRefreshToken = dbToken.value;
      const dbFolder = await AppSettingModel.findOne({ key: 'GOOGLE_DRIVE_FOLDER_ID' });
      if (dbFolder?.value) activeRootFolderId = dbFolder.value;
    }
  } catch {}

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  if (activeRefreshToken && !activeRefreshToken.includes('mock')) {
    oauth2Client.setCredentials({ refresh_token: activeRefreshToken });
  }

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // 1. Ensure System Folder exists (e.g. BTOS)
  const systemFolderId = await getOrCreateDriveFolder(systemName.toUpperCase(), activeRootFolderId);

  // 2. Ensure Module Folder exists inside System Folder (e.g. Module 04 - Operational Training)
  const moduleFolderId = await getOrCreateDriveFolder(moduleName, systemFolderId);

  // 3. Obtain Access Token from OAuth2Client
  let tokenObj;
  try {
    tokenObj = await oauth2Client.getAccessToken();
  } catch (err: any) {
    console.error('Failed to get Google Drive access token:', err?.message);
    throw new Error('Google Drive authorization expired (invalid_grant).');
  }

  if (!tokenObj || !tokenObj.token) {
    throw new Error('Google Drive authorization expired (invalid_grant).');
  }

  // 4. Initiate Resumable Upload with Google Drive API
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenObj.token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType || 'video/mp4',
      ...(fileSize > 0 ? { 'X-Upload-Content-Length': String(fileSize) } : {}),
    },
    body: JSON.stringify({
      name: fileName,
      parents: [moduleFolderId],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Google Drive resumable upload init failed:', res.status, errText);
    throw new Error(`Google Drive upload initiation failed: ${res.statusText}`);
  }

  const uploadUrl = res.headers.get('location');
  if (!uploadUrl) {
    throw new Error('Google Drive did not return a session upload URL.');
  }

  return { uploadUrl, moduleFolderId };
}

