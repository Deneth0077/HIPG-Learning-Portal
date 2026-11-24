import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AppSettingModel } from '@/models';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI || 'https://developers.google.com/oauthplayground';

// GET: Check Google Drive status
export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const conn = await connectDB();
    let currentRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';
    let currentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1-0TwN8EfD_5UMGbKhs4G2wnC5qGsiOyw';

    if (conn) {
      const dbToken = await AppSettingModel.findOne({ key: 'GOOGLE_DRIVE_REFRESH_TOKEN' });
      if (dbToken?.value) currentRefreshToken = dbToken.value;
      const dbFolder = await AppSettingModel.findOne({ key: 'GOOGLE_DRIVE_FOLDER_ID' });
      if (dbFolder?.value) currentFolderId = dbFolder.value;
    }

    let isTokenValid = false;
    let authError: string | null = null;

    if (CLIENT_ID && CLIENT_SECRET && currentRefreshToken && !currentRefreshToken.includes('mock')) {
      try {
        const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
        oauth2Client.setCredentials({ refresh_token: currentRefreshToken });
        const tokenRes = await oauth2Client.getAccessToken();
        if (tokenRes && tokenRes.token) {
          isTokenValid = true;
        }
      } catch (err: any) {
        authError = err?.message || 'Token verification failed';
      }
    }

    return NextResponse.json({
      configured: !!(CLIENT_ID && CLIENT_SECRET && currentRefreshToken),
      isTokenValid,
      authError,
      folderId: currentFolderId,
      hasCustomDbToken: false,
      maskedToken: currentRefreshToken ? `${currentRefreshToken.substring(0, 10)}...${currentRefreshToken.slice(-6)}` : '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Update and test Google Drive Refresh Token
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const { refreshToken, folderId } = body;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    // Verify token with Google Drive API
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken.trim() });
    
    try {
      const tokenRes = await oauth2Client.getAccessToken();
      if (!tokenRes || !tokenRes.token) {
        return NextResponse.json({ error: 'Google did not return an access token for this refresh token.' }, { status: 400 });
      }
    } catch (testErr: any) {
      return NextResponse.json({
        error: `Google rejected this token (${testErr.message}). Ensure client ID and secret match.`,
      }, { status: 400 });
    }

    // Save verified token into MongoDB
    const conn = await connectDB();
    if (conn) {
      await AppSettingModel.findOneAndUpdate(
        { key: 'GOOGLE_DRIVE_REFRESH_TOKEN' },
        { value: refreshToken.trim(), description: 'Google Drive OAuth Refresh Token' },
        { upsert: true, new: true }
      );

      if (folderId) {
        await AppSettingModel.findOneAndUpdate(
          { key: 'GOOGLE_DRIVE_FOLDER_ID' },
          { value: folderId.trim(), description: 'Google Drive Root Folder ID' },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Google Drive connected and verified successfully! Direct uploads are now active.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

