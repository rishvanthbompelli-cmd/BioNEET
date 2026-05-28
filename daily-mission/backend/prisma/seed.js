const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample BiPC data...');

  // 1. Create an Admin & Student user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dailymission.com' },
    update: {},
    create: {
      email: 'admin@dailymission.com',
      name: 'Admin Instructor',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@dailymission.com' },
    update: {},
    create: {
      email: 'student@dailymission.com',
      name: 'BiPC Aspirant',
      password: studentPassword,
      role: 'STUDENT',
      streak: 5,
    },
  });

  // 2. Create Chapters
  const chaptersData = [
    { name: 'Plant Physiology', subject: 'Botany', description: 'Study of plant function and behavior.' },
    { name: 'Human Reproduction', subject: 'Zoology', description: 'Biological process of human reproduction.' },
    { name: 'Organic Chemistry: Basic Principles', subject: 'Chemistry', description: 'Introduction to organic compounds.' },
    { name: 'Thermodynamics', subject: 'Physics', description: 'Laws of thermodynamics and energy transfer.' }
  ];

  for (const c of chaptersData) {
    await prisma.chapter.create({ data: c });
  }

  const botanyChapter = await prisma.chapter.findFirst({ where: { name: 'Plant Physiology' } });

  // 3. Create Notes
  await prisma.note.create({
    data: {
      title: 'Photosynthesis in Higher Plants - Short Notes',
      content: '# Photosynthesis\n\nPhotosynthesis is a physico-chemical process by which green plants use light energy to drive the synthesis of organic compounds.\n\n## Light Reaction\n* Takes place in grana thylakoids\n* Photolysis of water occurs\n\n## Dark Reaction\n* Takes place in stroma\n* CO2 is reduced to glucose',
      subject: 'Botany',
      chapterId: botanyChapter.id,
      userId: admin.id,
    }
  });

  // 4. Create MCQs
  await prisma.mcq.create({
    data: {
      question: 'Which of the following is an example of a C4 plant?',
      optionA: 'Wheat',
      optionB: 'Rice',
      optionC: 'Sugarcane',
      optionD: 'Potato',
      correctOption: 'C',
      explanation: 'Sugarcane, Maize, and Sorghum are classic examples of C4 plants that are adapted to dry tropical regions.',
      difficulty: 'MEDIUM',
      subject: 'Botany',
      chapterId: botanyChapter.id,
    }
  });

  // 5. Create Formulas
  await prisma.formula.create({
    data: {
      subject: 'Physics',
      title: 'First Law of Thermodynamics',
      content: 'ΔQ = ΔU + ΔW\nWhere:\nΔQ = Heat supplied to the system\nΔU = Change in internal energy\nΔW = Work done by the system',
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
