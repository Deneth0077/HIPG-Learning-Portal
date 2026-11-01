import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User, AuditLogModel } from '@/models';

const CreateUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').trim(),
  username: z.string().min(3, 'Username must be at least 3 characters').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE'),
  isActive: z.boolean().default(true),
});

// GET /api/admin/users - List all users
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  const conn = await connectDB();
  if (!conn) {
    // Return sample users in offline dev mode
    const mockUsers = [
      { _id: '1', fullName: 'Chathuranga', username: 'chathuranga', role: 'EMPLOYEE', employeeId: 'HIPG-EMP-3049', department: 'Port Operations', designation: 'Terminal Engineer', isActive: true, createdAt: new Date() },
      { _id: '2', fullName: 'HIPG System Administrator', username: 'admin', role: 'ADMIN', employeeId: 'HIPG-IT-001', department: 'IT Systems', designation: 'Lead Architect', isActive: true, createdAt: new Date() },
      { _id: '3', fullName: 'Nuwan Perera', username: 'nuwan.p', role: 'EMPLOYEE', employeeId: 'HIPG-EMP-1022', department: 'Harbor Control', designation: 'VTMS Supervisor', isActive: true, createdAt: new Date() },
      { _id: '4', fullName: 'Sandun Jayasuriya', username: 'sandun.j', role: 'EMPLOYEE', employeeId: 'HIPG-EMP-2041', department: 'Container Yard', designation: 'CTOS Yard Planner', isActive: false, createdAt: new Date() },
    ];
    const filtered = mockUsers.filter(u =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()))
    );
    return NextResponse.json({ users: filtered });
  }

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).select('-passwordHash');
  return NextResponse.json({ users });
}

// POST /api/admin/users - Create new employee or admin account
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const result = CreateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    const { fullName, username, password, employeeId, department, designation, role, isActive } = result.data;

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({
        success: true,
        user: { _id: 'mock-' + Date.now(), fullName, username, role, employeeId, department, designation, isActive },
      });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      fullName,
      username,
      passwordHash,
      employeeId,
      department,
      designation,
      role,
      isActive,
    });

    await AuditLogModel.create({
      adminId: adminCheck.userId,
      adminUsername: adminCheck.username,
      action: 'USER_CREATED',
      resourceType: 'User',
      resourceId: newUser._id.toString(),
      details: { username: newUser.username, role: newUser.role },
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: newUser._id.toString(),
        fullName: newUser.fullName,
        username: newUser.username,
        role: newUser.role,
        employeeId: newUser.employeeId,
        department: newUser.department,
        designation: newUser.designation,
        isActive: newUser.isActive,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
