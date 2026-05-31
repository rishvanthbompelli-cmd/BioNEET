const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Daily Mission platform data...');

  await prisma.mcqAttempt.deleteMany();
  await prisma.mockScore.deleteMany();
  await prisma.revision.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.note.deleteMany();
  await prisma.mcq.deleteMany();
  await prisma.mockTest.deleteMany();
  await prisma.formula.deleteMany();
  await prisma.diagram.deleteMany();
  await prisma.handbook.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.announcement.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dailymission.com' },
    update: { role: 'ADMIN', streak: 12 },
    create: {
      email: 'admin@dailymission.com',
      name: 'Admin Instructor',
      password: adminPassword,
      role: 'ADMIN',
      examMode: 'NEET',
      dailyHours: 6,
      targetRank: 500,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@dailymission.com' },
    update: {
      streak: 7,
      examMode: 'NEET',
      dailyHours: 5,
      targetRank: 2000,
      weakSubjects: JSON.stringify(['Chemistry', 'Physics']),
    },
    create: {
      email: 'student@dailymission.com',
      name: 'BiPC Aspirant',
      password: studentPassword,
      role: 'STUDENT',
      streak: 7,
      examMode: 'NEET',
      dailyHours: 5,
      targetRank: 2000,
      weakSubjects: JSON.stringify(['Chemistry', 'Physics']),
    },
  });

  const chaptersData = [
    { name: 'Plant Physiology', subject: 'Botany', weightage: 8 },
    { name: 'Human Reproduction', subject: 'Zoology', weightage: 7 },
    { name: 'Organic Chemistry: Basic Principles', subject: 'Chemistry', weightage: 9 },
    { name: 'Thermodynamics', subject: 'Physics', weightage: 6 },
    { name: 'Cell: Structure and Function', subject: 'Botany', weightage: 7 },
    { name: 'Human Health and Disease', subject: 'Zoology', weightage: 6 },
    { name: 'Electrochemistry', subject: 'Chemistry', weightage: 5 },
    { name: 'Ray Optics', subject: 'Physics', weightage: 7 },
  ];

  const chapters = [];
  for (const c of chaptersData) {
    chapters.push(await prisma.chapter.create({ data: c }));
  }

  const notesData = [
    {
      title: 'Photosynthesis in Higher Plants - Short Notes',
      content: '# Photosynthesis\n\nPhotosynthesis is a physico-chemical process by which green plants use light energy to drive the synthesis of organic compounds.\n\n## Light Reaction\n* Takes place in grana thylakoids\n* Photolysis of water occurs\n* Produces ATP and NADPH\n\n## Dark Reaction (Calvin Cycle)\n* Takes place in stroma\n* CO₂ is reduced to glucose\n* Rubisco is the key enzyme',
      subject: 'Botany',
      highlights: 'C4 plants: Maize, Sugarcane | Photorespiration in C3',
      memoryTrick: 'C4 = HOT (Maize, Sugarcane, Sorghum in dry tropics)',
      chapterId: chapters[0].id,
    },
    {
      title: 'Human Reproduction - Quick Revision',
      content: '# Human Reproduction\n\n## Male Reproductive System\n* Testes produce spermatozoa\n* Leydig cells secrete testosterone\n\n## Female Reproductive System\n* Ovarian cycle: follicular, ovulatory, luteal phases\n* Menstrual cycle: 28 days average',
      subject: 'Zoology',
      highlights: 'FSH, LH, estrogen, progesterone roles',
      memoryTrick: 'FSH = Follicle Stimulating Hormone',
      chapterId: chapters[1].id,
    },
    {
      title: 'Organic Chemistry Name Reactions',
      content: '# Important Name Reactions\n\n## Friedel-Crafts Alkylation\n* Benzene + R-Cl / AlCl₃\n\n## Cannizzaro Reaction\n* Aldehydes without α-H → alcohol + acid salt',
      subject: 'Chemistry',
      highlights: 'SN1 vs SN2 | Electrophilic aromatic substitution',
      chapterId: chapters[2].id,
    },
    {
      title: 'Thermodynamics - Formula Sheet',
      content: '# Thermodynamics\n\n## First Law\nΔQ = ΔU + ΔW\n\n## Second Law\nΔS_universe ≥ 0 for spontaneous processes\n\n## Carnot Efficiency\nη = 1 - T_c/T_h',
      subject: 'Physics',
      highlights: 'Isothermal: ΔU=0 | Adiabatic: ΔQ=0',
      chapterId: chapters[3].id,
    },
  ];

  for (const n of notesData) {
    await prisma.note.create({ data: { ...n, userId: admin.id } });
  }

  const mcqsData = [
    { question: 'Which of the following is an example of a C4 plant?', optionA: 'Wheat', optionB: 'Rice', optionC: 'Sugarcane', optionD: 'Potato', correctOption: 'C', explanation: 'Sugarcane, Maize, and Sorghum are C4 plants adapted to dry tropical regions.', difficulty: 'MEDIUM', subject: 'Botany', chapterId: chapters[0].id },
    { question: 'Site of light reaction in chloroplast is:', optionA: 'Stroma', optionB: 'Grana', optionC: 'Matrix', optionD: 'Cristae', correctOption: 'B', explanation: 'Light reactions occur in grana thylakoids.', difficulty: 'EASY', subject: 'Botany', chapterId: chapters[0].id },
    { question: 'Which hormone triggers ovulation?', optionA: 'FSH', optionB: 'LH', optionC: 'Prolactin', optionD: 'Oxytocin', correctOption: 'B', explanation: 'LH surge triggers ovulation.', difficulty: 'EASY', subject: 'Zoology', chapterId: chapters[1].id },
    { question: 'Testosterone is secreted by:', optionA: 'Sertoli cells', optionB: 'Leydig cells', optionC: 'Granulosa cells', optionD: 'Pituitary', correctOption: 'B', explanation: 'Leydig (interstitial) cells secrete testosterone.', difficulty: 'MEDIUM', subject: 'Zoology', chapterId: chapters[1].id },
    { question: 'SN2 reaction is favored by:', optionA: 'Tertiary halide', optionB: 'Primary halide', optionC: 'Bulky base', optionD: 'Polar protic solvent', correctOption: 'B', explanation: 'SN2 prefers primary substrates and polar aprotic solvents.', difficulty: 'HARD', subject: 'Chemistry', chapterId: chapters[2].id },
    { question: 'Which has highest boiling point?', optionA: 'n-pentane', optionB: 'neopentane', optionC: 'isopentane', optionD: 'butane', correctOption: 'A', explanation: 'Straight chain alkanes have higher surface area for van der Waals forces.', difficulty: 'MEDIUM', subject: 'Chemistry', chapterId: chapters[2].id },
    { question: 'First law of thermodynamics is conservation of:', optionA: 'Momentum', optionB: 'Energy', optionC: 'Mass', optionD: 'Charge', correctOption: 'B', explanation: 'First law: energy cannot be created or destroyed.', difficulty: 'EASY', subject: 'Physics', chapterId: chapters[3].id },
    { question: 'Carnot engine efficiency depends on:', optionA: 'Working substance', optionB: 'Temperature of reservoirs', optionC: 'Pressure', optionD: 'Volume', correctOption: 'B', explanation: 'η = 1 - T_c/T_h', difficulty: 'MEDIUM', subject: 'Physics', chapterId: chapters[3].id },
    { question: 'Cell wall in plants is primarily made of:', optionA: 'Chitin', optionB: 'Cellulose', optionC: 'Peptidoglycan', optionD: 'Lignin only', correctOption: 'B', explanation: 'Cellulose is the primary structural polysaccharide.', difficulty: 'EASY', subject: 'Botany', chapterId: chapters[4].id },
    { question: 'HIV targets which cells?', optionA: 'RBC', optionB: 'Helper T cells', optionC: 'Neutrophils', optionD: 'Platelets', correctOption: 'B', explanation: 'HIV binds CD4 on helper T lymphocytes.', difficulty: 'MEDIUM', subject: 'Zoology', chapterId: chapters[5].id },
  ];

  const mcqs = [];
  for (const m of mcqsData) {
    mcqs.push(await prisma.mcq.create({ data: m }));
  }

  const options = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < 25; i++) {
    const mcq = mcqs[i % mcqs.length];
    const selected = options[i % 4];
    await prisma.mcqAttempt.create({
      data: {
        userId: student.id,
        mcqId: mcq.id,
        selectedOption: selected,
        isCorrect: selected === mcq.correctOption,
        timeSpentSec: 30 + (i * 5),
        createdAt: new Date(Date.now() - i * 86400000 * 0.3),
      },
    });
  }

  const formulas = [
    { subject: 'Physics', title: 'First Law of Thermodynamics', content: 'ΔQ = ΔU + ΔW', category: 'Thermodynamics', shortcut: 'Heat = Internal energy change + Work done' },
    { subject: 'Physics', title: 'Snell\'s Law', content: 'n₁ sin θ₁ = n₂ sin θ₂', category: 'Optics' },
    { subject: 'Physics', title: 'Lens Formula', content: '1/f = 1/v - 1/u', category: 'Optics', shortcut: 'Real is positive for mirrors convention' },
    { subject: 'Chemistry', title: 'Ideal Gas Equation', content: 'PV = nRT', category: 'Physical Chemistry' },
    { subject: 'Chemistry', title: 'Nernst Equation', content: 'E = E° - (0.0591/n) log Q', category: 'Electrochemistry' },
    { subject: 'Chemistry', title: 'Rate Law', content: 'Rate = k[A]^m[B]^n', category: 'Kinetics' },
  ];
  for (const f of formulas) await prisma.formula.create({ data: f });

  const diagrams = [
    { subject: 'Botany', title: 'Plant Cell Structure', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600', labels: JSON.stringify(['Cell wall', 'Chloroplast', 'Nucleus', 'Vacuole']), category: 'Cell Biology' },
    { subject: 'Zoology', title: 'Human Heart Anatomy', imageUrl: 'https://images.unsplash.com/photo-1559757175-5700eeb879ff?w=600', labels: JSON.stringify(['Aorta', 'Left ventricle', 'Right atrium', 'Pulmonary artery']), category: 'Physiology' },
    { subject: 'Botany', title: 'Photosynthesis Diagram', imageUrl: 'https://images.unsplash.com/photo-1466692476866-a1621ffd2463?w=600', labels: JSON.stringify(['Light reaction', 'Dark reaction', 'Stroma', 'Grana']), category: 'Plant Physiology' },
    { subject: 'Zoology', title: 'Neuron Structure', imageUrl: 'https://images.unsplash.com/photo-1559757175-08b1aa4c4a1e?w=600', labels: JSON.stringify(['Dendrite', 'Axon', 'Myelin sheath', 'Synapse']), category: 'Neural System' },
  ];
  for (const d of diagrams) await prisma.diagram.create({ data: d });

  const handbooks = [
    { title: 'NEET Last 30 Days Guide', subject: 'All', category: 'last-minute', content: '# Last 30 Days\n\n1. Revise NCERT line-by-line for Biology\n2. Daily 1 full mock\n3. Formula sheet revision every morning\n4. Weak topic drill: 2 hrs/day' },
    { title: 'EAPCET Speed Booster', subject: 'All', category: 'rank-booster', content: '# EAPCET Speed Strategy\n\n* 80 questions in 80 minutes mindset\n* Skip lengthy questions first\n* Chemistry: direct formula application\n* Biology: NCERT keywords' },
    { title: 'High Weightage Biology Chapters', subject: 'Botany', category: 'high-weightage', content: 'Plant Physiology, Genetics, Ecology, Morphology — combined ~25% weightage in NEET.' },
    { title: 'Organic Chemistry Rapid Revision', subject: 'Chemistry', category: 'quick-revision', content: 'GOC, Isomerism, Name reactions, Biomolecules — focus on NCERT intext questions.' },
  ];
  for (const h of handbooks) await prisma.handbook.create({ data: h });

  const mockQuestions = mcqs.slice(0, 5).map((m) => ({
    id: m.id,
    question: m.question,
    options: { A: m.optionA, B: m.optionB, C: m.optionC, D: m.optionD },
    correctOption: m.correctOption,
    subject: m.subject,
  }));

  const mockTests = [
    { title: 'NEET Full Syllabus Mock #1', mode: 'NEET', durationMinutes: 180, totalQuestions: 5, questionsJson: JSON.stringify(mockQuestions) },
    { title: 'EAPCET BiPC Rapid Mock', mode: 'EAPCET', durationMinutes: 90, totalQuestions: 5, questionsJson: JSON.stringify(mockQuestions) },
    { title: 'Botany Chapter Test', mode: 'NEET', durationMinutes: 45, subject: 'Botany', totalQuestions: 3, questionsJson: JSON.stringify(mockQuestions.filter((q) => q.subject === 'Botany')) },
  ];
  for (const t of mockTests) await prisma.mockTest.create({ data: t });

  await prisma.mockScore.create({
    data: {
      userId: student.id,
      mockTestId: 1,
      score: 4,
      totalQuestions: 5,
      timeTakenMinutes: 165,
      answersJson: JSON.stringify(['C', 'B', 'B', 'B', 'B']),
      percentile: 78,
    },
  });

  for (const ch of chapters.slice(0, 5)) {
    await prisma.revision.create({
      data: {
        userId: student.id,
        chapterId: ch.id,
        status: ch.id % 2 === 0 ? 'COMPLETED' : ch.id % 3 === 0 ? 'WEAK' : 'IN_PROGRESS',
        revisionCount: ch.id % 2 === 0 ? 2 : 1,
        lastRevisedAt: new Date(),
      },
    });
  }

  const subjects = ['Botany', 'Zoology', 'Chemistry', 'Physics'];
  for (let i = 0; i < 14; i++) {
    await prisma.studySession.create({
      data: {
        userId: student.id,
        subject: subjects[i % 4],
        durationMinutes: 45 + (i * 10),
        date: new Date(Date.now() - i * 86400000),
      },
    });
  }

  const studyPlan = {
    goal: 'NEET 2026 — Target Rank 2000',
    dailyMissions: [
      'Revise Plant Physiology NCERT (45 min)',
      'Solve 40 Chemistry MCQs — focus on Organic',
      'Review mock test mistakes from last week',
      'Practice 5 assertion-reason Biology questions',
    ],
    weeklySchedule: [
      { day: 'Mon', subjects: ['Botany'], hours: 5 },
      { day: 'Tue', subjects: ['Chemistry'], hours: 5 },
      { day: 'Wed', subjects: ['Physics'], hours: 4 },
      { day: 'Thu', subjects: ['Zoology'], hours: 5 },
      { day: 'Fri', subjects: ['Mixed MCQs'], hours: 5 },
      { day: 'Sat', subjects: ['Full Mock'], hours: 6 },
      { day: 'Sun', subjects: ['Revision'], hours: 4 },
    ],
    revisionPlan: chapters.slice(0, 4).map((c) => c.name),
    mockSchedule: ['Full NEET mock every Saturday', 'Chapter test every Wednesday'],
    weakTopicFocus: ['Organic Chemistry', 'Ray Optics'],
  };

  await prisma.studyPlan.create({
    data: {
      userId: student.id,
      goal: studyPlan.goal,
      planJson: JSON.stringify(studyPlan),
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'NEET 2026 Mock Series Live!',
      content: 'Full syllabus mock tests are now available. Complete 2 mocks this week to stay on track.',
    },
  });

  console.log('Seeding completed!');
  console.log('Admin: admin@dailymission.com / admin123');
  console.log('Student: student@dailymission.com / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
