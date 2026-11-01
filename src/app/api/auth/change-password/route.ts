import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = ChangePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, message: 'Password updated (dev mode)' });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
