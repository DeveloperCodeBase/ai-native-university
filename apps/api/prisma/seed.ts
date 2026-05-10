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

  // --- Class Sessions ---
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const session1 = await prisma.classSession.create({
    data: {
      tenantId: tenant.id,
      courseId: course1.id,
      title: 'جلسه اول: معرفی هوش مصنوعی',
      description: 'آشنایی با مفاهیم پایه و تاریخچه هوش مصنوعی',
      scheduledAt: twoDaysAgo,
      endedAt: new Date(twoDaysAgo.getTime() + 90 * 60 * 1000),
      status: 'ended',
      meetingUrl: 'https://meet.example.com/session-1',
    },
  });

  const session2 = await prisma.classSession.create({
    data: {
      tenantId: tenant.id,
      courseId: course1.id,
      title: 'جلسه دوم: یادگیری ماشین',
      description: 'بررسی الگوریتم‌های یادگیری ماشین و کاربردها',
      scheduledAt: yesterday,
      endedAt: new Date(yesterday.getTime() + 90 * 60 * 1000),
      status: 'ended',
      meetingUrl: 'https://meet.example.com/session-2',
    },
  });

  const session3 = await prisma.classSession.create({
    data: {
      tenantId: tenant.id,
      courseId: course1.id,
      title: 'جلسه سوم: شبکه‌های عصبی',
      description: 'مقدمه‌ای بر شبکه‌های عصبی و یادگیری عمیق',
      scheduledAt: tomorrow,
      status: 'scheduled',
      meetingUrl: 'https://meet.example.com/session-3',
    },
  });
  console.log(`  ✅ Class sessions: ${session1.title}, ${session2.title}, ${session3.title}`);

  // --- Attendance ---
  await prisma.attendance.createMany({
    data: [
      { sessionId: session1.id, userId: student.id, joinedAt: twoDaysAgo, leftAt: new Date(twoDaysAgo.getTime() + 85 * 60 * 1000), durationMin: 85 },
      { sessionId: session1.id, userId: student2.id, joinedAt: twoDaysAgo, leftAt: new Date(twoDaysAgo.getTime() + 90 * 60 * 1000), durationMin: 90 },
      { sessionId: session2.id, userId: student.id, joinedAt: yesterday, leftAt: new Date(yesterday.getTime() + 80 * 60 * 1000), durationMin: 80 },
    ],
    skipDuplicates: true,
  });
  console.log(`  ✅ Attendance records created`);

  // --- Recordings ---
  await prisma.recording.create({
    data: {
      sessionId: session1.id,
      url: 'https://storage.example.com/recordings/session-1.mp4',
      durationMin: 90,
      sizeBytes: BigInt(524288000),
      format: 'mp4',
    },
  });
  console.log(`  ✅ Recording added to session 1`);

  // --- Assessments ---
  const assessment1 = await prisma.assessment.create({
    data: {
      tenantId: tenant.id,
      courseId: course1.id,
      title: 'آزمون میان‌ترم: مبانی هوش مصنوعی',
      type: 'quiz',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      passingScore: 60,
      status: 'published',
      aiGradingEnabled: true,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        assessmentId: assessment1.id,
        text: 'هوش مصنوعی قوی (AGI) به چه معناست؟',
        type: 'multiple_choice',
        options: JSON.stringify(['سیستمی با توانایی درک و یادگیری همه وظایف شناختی انسان', 'سیستمی با قدرت محاسباتی بالا', 'یک ربات انسان‌نما', 'یک الگوریتم ریاضی ساده']),
        correctAnswer: 'سیستمی با توانایی درک و یادگیری همه وظایف شناختی انسان',
        points: 25,
        sortOrder: 1,
      },
      {
        assessmentId: assessment1.id,
        text: 'Overfitting چه زمانی رخ می‌دهد؟',
        type: 'multiple_choice',
        options: JSON.stringify(['وقتی مدل روی داده آموزشی بیش از حد یاد می‌گیرد', 'وقتی داده کم است', 'وقتی مدل ساده است', 'وقتی validation خوب است']),
        correctAnswer: 'وقتی مدل روی داده آموزشی بیش از حد یاد می‌گیرد',
        points: 25,
        sortOrder: 2,
      },
      {
        assessmentId: assessment1.id,
        text: 'آزمون تورینگ توسط چه کسی و در چه سالی پیشنهاد شد؟',
        type: 'short_answer',
        correctAnswer: 'آلن تورینگ در سال ۱۹۵۰',
        points: 25,
        sortOrder: 3,
      },
      {
        assessmentId: assessment1.id,
        text: 'مزایا و معایب یادگیری عمیق را در مقایسه با یادگیری ماشین سنتی توضیح دهید.',
        type: 'essay',
        correctAnswer: '',
        points: 25,
        sortOrder: 4,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`  ✅ Assessment with ${4} questions created`);

  // --- Learning Events ---
  await prisma.learningEvent.createMany({
    data: [
      { tenantId: tenant.id, actorId: student.id, eventType: 'course_opened', resourceType: 'course', resourceId: course1.id },
      { tenantId: tenant.id, actorId: student.id, eventType: 'lesson_opened', resourceType: 'lesson', resourceId: 'lesson_1' },
      { tenantId: tenant.id, actorId: student.id, eventType: 'lesson_completed', resourceType: 'lesson', resourceId: 'lesson_1' },
      { tenantId: tenant.id, actorId: student.id, eventType: 'class_joined', resourceType: 'class_session', resourceId: session1.id },
      { tenantId: tenant.id, actorId: student.id, eventType: 'class_left', resourceType: 'class_session', resourceId: session1.id },
      { tenantId: tenant.id, actorId: student.id, eventType: 'ai_tutor_asked', resourceType: 'course', resourceId: course1.id, metadata: JSON.stringify({ query: 'هوش مصنوعی چیست؟' }) },
      { tenantId: tenant.id, actorId: student2.id, eventType: 'course_opened', resourceType: 'course', resourceId: course1.id },
      { tenantId: tenant.id, actorId: student2.id, eventType: 'class_joined', resourceType: 'class_session', resourceId: session1.id },
    ],
    skipDuplicates: true,
  });
  console.log(`  ✅ Learning events created`);

  // --- AI Interaction Log ---
  await prisma.aiInteractionLog.create({
    data: {
      tenantId: tenant.id,
      userId: student.id,
      correlationId: 'seed_corr_001',
      interactionType: 'rag_query',
      inputSummary: 'هوش مصنوعی چیست؟',
      outputSummary: 'هوش مصنوعی شاخه‌ای از علوم کامپیوتر است...',
      model: 'mock-model',
      provider: 'mock',
      confidence: 0.85,
      latencyMs: 150,
      humanReviewRequired: false,
    },
  });
  console.log(`  ✅ AI interaction log created`);

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
