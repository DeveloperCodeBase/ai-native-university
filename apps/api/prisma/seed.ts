// =============================================================
// AI-Native Online University — Database Seed Script
// Creates demo tenant, users (super_admin, admin, instructor, student)
// =============================================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Create Demo Tenant ---
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-university' },
    update: {},
    create: {
      name: 'دانشگاه نمونه',
      slug: 'demo-university',
      domain: 'demo.university.ir',
      plan: 'premium',
      locale: 'fa',
      status: 'active',
    },
  });
  console.log(`  ✅ Tenant: ${tenant.name} (${tenant.slug})`);

  // --- Hash passwords ---
  const passwordHash = await bcrypt.hash('Demo@1234', 12);

  // --- Create Users ---
  const superAdmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'superadmin@demo.university.ir' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'superadmin@demo.university.ir',
      passwordHash,
      fullName: 'مدیر کل سیستم',
      role: 'super_admin',
      locale: 'fa',
    },
  });
  console.log(`  ✅ Super Admin: ${superAdmin.email}`);

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.university.ir' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.university.ir',
      passwordHash,
      fullName: 'مدیر دانشگاه',
      role: 'admin',
      locale: 'fa',
    },
  });
  console.log(`  ✅ Admin: ${admin.email}`);

  const instructor = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'instructor@demo.university.ir' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'instructor@demo.university.ir',
      passwordHash,
      fullName: 'دکتر احمدی',
      role: 'instructor',
      locale: 'fa',
    },
  });
  console.log(`  ✅ Instructor: ${instructor.email}`);

  const student = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'student@demo.university.ir' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'student@demo.university.ir',
      passwordHash,
      fullName: 'علی محمدی',
      role: 'student',
      locale: 'fa',
    },
  });
  console.log(`  ✅ Student: ${student.email}`);

  const student2 = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'student2@demo.university.ir' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'student2@demo.university.ir',
      passwordHash,
      fullName: 'فاطمه رضایی',
      role: 'student',
      locale: 'fa',
    },
  });
  console.log(`  ✅ Student 2: ${student2.email}`);

  // --- Create Faculty & Department & Program ---
  const faculty = await prisma.faculty.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'engineering' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'دانشکده مهندسی',
      slug: 'engineering',
      description: 'دانشکده مهندسی و فناوری اطلاعات',
    },
  });
  console.log(`  ✅ Faculty: ${faculty.name}`);

  const department = await prisma.department.upsert({
    where: { id: faculty.id + '-cs' },
    update: {},
    create: {
      facultyId: faculty.id,
      name: 'گروه مهندسی کامپیوتر',
      slug: 'computer-science',
      description: 'گروه مهندسی کامپیوتر و هوش مصنوعی',
    },
  });
  console.log(`  ✅ Department: ${department.name}`);

  const program = await prisma.program.create({
    data: {
      departmentId: department.id,
      name: 'کارشناسی مهندسی کامپیوتر',
      slug: 'bsc-cs',
      description: 'برنامه کارشناسی مهندسی کامپیوتر',
      level: 'bachelor',
      durationTerms: 8,
    },
  });
  console.log(`  ✅ Program: ${program.name}`);

  // --- Create Courses ---
  const course1 = await prisma.course.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'intro-ai' } },
    update: {},
    create: {
      tenantId: tenant.id,
      programId: program.id,
      title: 'مبانی هوش مصنوعی',
      slug: 'intro-ai',
      description: 'آشنایی با مفاهیم پایه هوش مصنوعی، یادگیری ماشین و شبکه‌های عصبی',
      level: 'beginner',
      status: 'published',
      createdBy: instructor.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'data-structures' } },
    update: {},
    create: {
      tenantId: tenant.id,
      programId: program.id,
      title: 'ساختمان داده',
      slug: 'data-structures',
      description: 'آرایه‌ها، لیست‌های پیوندی، درخت‌ها، گراف‌ها و الگوریتم‌های مرتب‌سازی',
      level: 'intermediate',
      status: 'published',
      createdBy: instructor.id,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'web-dev' } },
    update: {},
    create: {
      tenantId: tenant.id,
      programId: program.id,
      title: 'توسعه وب پیشرفته',
      slug: 'web-dev',
      description: 'React، Next.js، Node.js و پایگاه داده‌های مدرن',
      level: 'advanced',
      status: 'published',
      createdBy: instructor.id,
    },
  });
  console.log(`  ✅ Courses: ${course1.title}, ${course2.title}, ${course3.title}`);

  // --- Assign Instructor ---
  await prisma.courseInstructor.createMany({
    data: [
      { courseId: course1.id, userId: instructor.id, role: 'primary' },
      { courseId: course2.id, userId: instructor.id, role: 'primary' },
      { courseId: course3.id, userId: instructor.id, role: 'primary' },
    ],
    skipDuplicates: true,
  });
  console.log(`  ✅ Instructor assigned to all courses`);

  // --- Course Modules & Lessons ---
  const mod1 = await prisma.courseModule.create({
    data: {
      courseId: course1.id,
      title: 'مقدمه و تاریخچه',
      slug: 'intro-history',
      description: 'آشنایی با تاریخچه و کاربردهای هوش مصنوعی',
      sortOrder: 1,
      isPublished: true,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        moduleId: mod1.id,
        title: 'هوش مصنوعی چیست؟',
        slug: 'what-is-ai',
        content: '# هوش مصنوعی چیست؟\n\nهوش مصنوعی شاخه‌ای از علوم کامپیوتر است که هدف آن ساخت سیستم‌هایی با قابلیت تفکر و یادگیری شبیه انسان است.',
        contentType: 'text',
        sortOrder: 1,
        durationMin: 45,
        isPublished: true,
      },
      {
        moduleId: mod1.id,
        title: 'تاریخچه هوش مصنوعی',
        slug: 'ai-history',
        content: '# تاریخچه هوش مصنوعی\n\nاز آزمون تورینگ در ۱۹۵۰ تا مدل‌های زبان بزرگ (LLM) در ۲۰۲۳.',
        contentType: 'text',
        sortOrder: 2,
        durationMin: 30,
        isPublished: true,
      },
    ],
  });
  console.log(`  ✅ Modules & Lessons created for intro-ai`);

  // --- Enrollments ---
  await prisma.enrollment.createMany({
    data: [
      { tenantId: tenant.id, userId: student.id, courseId: course1.id, status: 'active', progress: 25 },
      { tenantId: tenant.id, userId: student.id, courseId: course2.id, status: 'active', progress: 0 },
      { tenantId: tenant.id, userId: student2.id, courseId: course1.id, status: 'active', progress: 50 },
    ],
    skipDuplicates: true,
  });
  console.log(`  ✅ Enrollments created`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Demo credentials (password: Demo@1234):');
  console.log('   Super Admin:  superadmin@demo.university.ir');
  console.log('   Admin:        admin@demo.university.ir');
  console.log('   Instructor:   instructor@demo.university.ir');
  console.log('   Student:      student@demo.university.ir');
  console.log('   Student 2:    student2@demo.university.ir');
  console.log('   Tenant slug:  demo-university');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
