import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User, AuditLogModel, LearningProgressModel } from '@/models';

const UpdateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  employeeId: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(), // Optional password reset
});

// GET single user with learning progress
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await params;
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({
      user: {
        _id: id,
        fullName: 'Chathuranga',
        username: 'chathuranga',
        role: 'EMPLOYEE',
        employeeId: 'HIPG-EMP-3049',
        department: 'Port Operations',
        designation: 'Terminal Engineer',
        isActive: true,
      },
      progress: [],
    });
  }

  const user = await User.findById(id).select('-passwordHash');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const progress = await LearningProgressModel.find({ userId: id });
  return NextResponse.json({ user, progress });
}

// PUT /api/admin/users/[id] - Edit user / Reset password / Toggle active
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await params;
  try {
    const body = await req.json();
    const result = UpdateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.error.issues.map(e => e.message) }, { status: 400 });
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, message: 'User updated (dev mode)' });
    }

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updates = result.data;
    if (updates.fullName !== undefined) user.fullName = updates.fullName;
    if (updates.department !== undefined) user.department = updates.department;
    if (updates.designation !== undefined) user.designation = updates.designation;
    if (updates.employeeId !== undefined) user.employeeId = updates.employeeId;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.isActive !== undefined) user.isActive = updates.isActive;

    if (updates.password) {
      user.passwordHash = await hashPassword(updates.password);
    }

    await user.save();

    await AuditLogModel.create({
      adminId: adminCheck.userId,
      adminUsername: adminCheck.username,
      action: 'USER_UPDATED',
      resourceType: 'User',
      resourceId: id,
      details: { updatedFields: Object.keys(updates) },
    });

    return NextResponse.json({ success: true, user: { ...user.toObject(), passwordHash: undefined } });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await params;
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ success: true, message: 'User deleted (dev mode)' });
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await AuditLogModel.create({
    adminId: adminCheck.userId,
    adminUsername: adminCheck.username,
    action: 'USER_DELETED',
    resourceType: 'User',
    resourceId: id,
    details: { username: user.username },
  });

  return NextResponse.json({ success: true, message: 'User deleted successfully' });
}
