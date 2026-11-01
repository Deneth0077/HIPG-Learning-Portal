import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const conn = await connectDB();
  if (conn && session.userId !== 'mock-admin-id' && session.userId !== 'mock-employee-id') {
    const user = await User.findById(session.userId).select('-passwordHash');
    if (!user || !user.isActive) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        department: user.department,
        designation: user.designation,
      },
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
  });
}
