import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uploadImageBuffer, deleteCloudinaryImage } from '@/lib/cloudinary';
import { connectDB } from '@/lib/db';
import { MediaModel, AuditLogModel } from '@/models';

// GET /api/admin/media - List media assets
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { searchParams } = new URL(req.url);
  const systemId = searchParams.get('systemId');

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({
      media: [
        {
          _id: 'm1',
          title: 'BTOS Operation Menu Highlight',
          cloudinaryPublicId: 'hipg/btos_step1',
          secureUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
          format: 'jpg',
          width: 800,
          height: 500,
          systemId: 'btos',
          createdAt: new Date(),
        },
        {
          _id: 'm2',
          title: 'Cargo ID Generation Dialog',
          cloudinaryPublicId: 'hipg/btos_step2',
          secureUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
          format: 'jpg',
          width: 800,
          height: 500,
          systemId: 'btos',
          createdAt: new Date(),
        },
      ],
    });
  }

  const query: Record<string, unknown> = {};
  if (systemId) query.systemId = systemId;

  const media = await MediaModel.find(query).sort({ createdAt: -1 });
  return NextResponse.json({ media });
}

// POST /api/admin/media - Upload image to Cloudinary and save to MongoDB
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = (formData.get('title') as string) || file?.name || 'Uploaded Media';
    const systemId = (formData.get('systemId') as string) || 'btos';
    const altText = (formData.get('altText') as string) || title;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await uploadImageBuffer(buffer, `hipg_learning_portal/${systemId}`);

    const conn = await connectDB();
    let mediaDoc;
    if (conn) {
      mediaDoc = await MediaModel.create({
        title,
        cloudinaryPublicId: uploadResult.publicId,
        secureUrl: uploadResult.secureUrl,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        altText,
        systemId,
      });

      await AuditLogModel.create({
        adminId: adminCheck.userId,
        adminUsername: adminCheck.username,
        action: 'MEDIA_UPLOADED',
        resourceType: 'Media',
        resourceId: mediaDoc._id.toString(),
        details: { publicId: uploadResult.publicId, title },
      });
    }

    return NextResponse.json({
      success: true,
      media: mediaDoc || {
        _id: 'mock-' + Date.now(),
        title,
        cloudinaryPublicId: uploadResult.publicId,
        secureUrl: uploadResult.secureUrl,
        format: uploadResult.format,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
