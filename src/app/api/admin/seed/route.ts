import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, SystemModel, ModuleModel, LessonModel } from '@/models';
import { hashPassword } from '@/lib/auth';
import { SYSTEMS_DATA, BTOS_MODULES, MANUAL_CARGO_ID } from '@/data/portalData';

export async function POST() {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({
        success: false,
        message: 'Could not connect to MongoDB. Please ensure MONGODB_URI is accessible.',
      }, { status: 503 });
    }

    // 1. Seed or Verify Administrator
    const adminUser = process.env.INITIAL_ADMIN_USERNAME || 'admin';
    const adminPass = process.env.INITIAL_ADMIN_PASSWORD || 'HipgAdmin@2026!';
    const adminFull = process.env.INITIAL_ADMIN_FULLNAME || 'HIPG System Administrator';

    let existingAdmin = await User.findOne({ username: adminUser });
    if (!existingAdmin) {
      const passwordHash = await hashPassword(adminPass);
      existingAdmin = await User.create({
        fullName: adminFull,
        username: adminUser,
        passwordHash,
        role: 'ADMIN',
        department: 'Information Technology',
        designation: 'Lead Systems Architect',
        isActive: true,
      });
      console.log('[Seed] Admin user created successfully.');
    }

    // 2. Seed Employee demo account (Chathuranga)
    let existingEmployee = await User.findOne({ username: 'chathuranga' });
    if (!existingEmployee) {
      const employeeHash = await hashPassword('HipgPort@2026');
      existingEmployee = await User.create({
        fullName: 'Chathuranga',
        username: 'chathuranga',
        passwordHash: employeeHash,
        role: 'EMPLOYEE',
        employeeId: 'HIPG-EMP-3049',
        department: 'Port Operations & IT Systems',
        designation: 'Terminal Operations Engineer',
        isActive: true,
      });
      console.log('[Seed] Employee user created successfully.');
    }

    // 3. Seed Systems
    for (let i = 0; i < SYSTEMS_DATA.length; i++) {
      const sys = SYSTEMS_DATA[i];
      const found = await SystemModel.findOne({ slug: sys.id });
      if (!found) {
        await SystemModel.create({
          name: sys.name,
          slug: sys.id,
          fullName: sys.fullName,
          description: sys.description,
          iconType: sys.iconType,
          displayOrder: i,
          isActive: true,
          topicsCount: sys.topicsCount,
          videosCount: sys.videosCount,
          manualsCount: sys.manualsCount,
          totalDuration: sys.totalDuration,
        });
      }
    }

    // 4. Seed BTOS Modules & Lessons
    for (let mIdx = 0; mIdx < BTOS_MODULES.length; mIdx++) {
      const m = BTOS_MODULES[mIdx];
      let dbMod = await ModuleModel.findOne({ systemId: 'btos', slug: m.id });
      if (!dbMod) {
        dbMod = await ModuleModel.create({
          systemId: 'btos',
          moduleNumber: m.moduleNumber,
          title: m.title,
          slug: m.id,
          displayOrder: mIdx,
          isPublished: true,
        });
      }

      for (let lIdx = 0; lIdx < m.lessons.length; lIdx++) {
        const l = m.lessons[lIdx];
        const existingLesson = await LessonModel.findOne({ systemId: 'btos', slug: l.id });
        if (!existingLesson) {
          await LessonModel.create({
            systemId: 'btos',
            moduleId: m.id,
            title: l.title,
            slug: l.id,
            description: l.description,
            duration: l.duration,
            order: l.order,
            displayOrder: lIdx,
            isPublished: true,
            sections: l.id === 'cargo-id-gen' ? MANUAL_CARGO_ID : [],
            learningObjectives: [
              'Understand terminal operational workflow',
              'Perform verification and validation',
              'Export audit reports',
            ],
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Initial database seed completed successfully. Admin and portal data initialized.',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
