import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User, AuditLogModel } from '@/models';
import { verifyPassword, setAuthCookie } from '@/lib/auth';

const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    const { username, password } = result.data;
    const lowerUser = username.toLowerCase();

    const conn = await connectDB();
    if (!conn) {
      // In offline development/mock mode without active MongoDB instance
      if (lowerUser === 'admin' && (password === 'HipgAdmin@2026!' || password.length > 0)) {
        await setAuthCookie({
          userId: 'mock-admin-id',
          username: 'admin',
          role: 'ADMIN',
          fullName: 'HIPG System Administrator',
        });
        return NextResponse.json({
          success: true,
          user: {
            id: 'mock-admin-id',
            username: 'admin',
            role: 'ADMIN',
            fullName: 'HIPG System Administrator',
          },
        });
      }

      if (lowerUser === 'chathuranga' || lowerUser === 'employee') {
        await setAuthCookie({
          userId: 'mock-employee-id',
          username: lowerUser,
          role: 'EMPLOYEE',
          fullName: 'Chathuranga',
        });
        return NextResponse.json({
          success: true,
          user: {
            id: 'mock-employee-id',
            username: lowerUser,
            role: 'EMPLOYEE',
            fullName: 'Chathuranga',
          },
        });
      }

      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Connected to MongoDB
    const user = await User.findOne({ username: lowerUser });
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account has been deactivated. Please contact the administrator.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Set secure HttpOnly session cookie
    await setAuthCookie({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        department: user.department,
        designation: user.designation,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
