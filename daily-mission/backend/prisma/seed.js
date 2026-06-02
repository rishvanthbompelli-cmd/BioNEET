const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { ALL_CHAPTERS, STUDY_ORDER } = require('../data/interSyllabus');
const { copyPapersAndBuildSeed } = require('../scripts/copyPapers');

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
  await prisma.examPaper.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordReset.deleteMany();

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
      role: 'USER',
      streak: 7,
      examMode: 'NEET',
      dailyHours: 5,
      targetRank: 2000,
      weakSubjects: JSON.stringify(['Chemistry', 'Physics']),
    },
  });

  const chapterByName = {};
  const chapterByKey = {};
  const chapters = [];
  for (const c of ALL_CHAPTERS) {
    const created = await prisma.chapter.create({ data: c });
    chapters.push(created);
    chapterByKey[`${c.year}|${c.subject}|${c.name}`] = created;
    chapterByName[c.name] = created;
  }
  console.log(`Seeded ${chapters.length} chapters (Inter 1st: ${ALL_CHAPTERS.filter(c => c.year === 'INTER_1').length}, Inter 2nd: ${ALL_CHAPTERS.filter(c => c.year === 'INTER_2').length})`);

  const findChapter = (name, subject, year) => {
    if (year && subject) return chapterByKey[`${year}|${subject}|${name}`];
    if (subject) return chapters.find((c) => c.name === name && c.subject === subject) || chapterByName[name];
    return chapterByName[name];
  };

  const notesData = [
    {
      title: 'Photosynthesis in Higher Plants - Short Notes',
      content: '# Photosynthesis\n\nPhotosynthesis is a physico-chemical process by which green plants use light energy to drive the synthesis of organic compounds.\n\n## Light Reaction\n* Takes place in grana thylakoids\n* Photolysis of water occurs\n* Produces ATP and NADPH\n\n## Dark Reaction (Calvin Cycle)\n* Takes place in stroma\n* CO₂ is reduced to glucose\n* Rubisco is the key enzyme',
      subject: 'Botany',
      highlights: 'C4 plants: Maize, Sugarcane | Photorespiration in C3',
      memoryTrick: 'C4 = HOT (Maize, Sugarcane, Sorghum in dry tropics)',
      chapterId: findChapter('Photosynthesis').id,
    },
    {
      title: 'Human Reproduction - Quick Revision',
      content: '# Human Reproduction\n\n## Male Reproductive System\n* Testes produce spermatozoa\n* Leydig cells secrete testosterone\n\n## Female Reproductive System\n* Ovarian cycle: follicular, ovulatory, luteal phases\n* Menstrual cycle: 28 days average',
      subject: 'Zoology',
      highlights: 'FSH, LH, estrogen, progesterone roles',
      memoryTrick: 'FSH = Follicle Stimulating Hormone',
      chapterId: findChapter('Human Reproduction').id,
    },
    {
      title: 'Organic Chemistry Name Reactions (GOC)',
      content: '# Important Name Reactions\n\n## Friedel-Crafts Alkylation\n* Benzene + R-Cl / AlCl₃\n\n## Cannizzaro Reaction\n* Aldehydes without α-H → alcohol + acid salt',
      subject: 'Chemistry',
      highlights: 'SN1 vs SN2 | Electrophilic aromatic substitution',
      chapterId: findChapter('Organic Chemistry: Basic Principles (GOC)').id,
    },
    {
      title: 'Thermodynamics - Formula Sheet',
      content: '# Thermodynamics\n\n## First Law\nΔQ = ΔU + ΔW\n\n## Second Law\nΔS_universe ≥ 0 for spontaneous processes\n\n## Carnot Efficiency\nη = 1 - T_c/T_h',
      subject: 'Physics',
      highlights: 'Isothermal: ΔU=0 | Adiabatic: ΔQ=0',
      chapterId: findChapter('Thermodynamics', 'Physics', 'INTER_1').id,
    },
    {
      title: 'Principles of Inheritance - Genetics Notes',
      content: '# Genetics\n\n## Mendel\'s Laws\n* Law of Segregation\n* Law of Independent Assortment\n\n## Monohybrid cross ratio 3:1\n## Dihybrid cross ratio 9:3:3:1',
      subject: 'Botany',
      highlights: 'Test cross | Back cross | Incomplete dominance',
      chapterId: findChapter('Principles of Inheritance & Variation').id,
    },
    {
      title: 'Cell Structure - NCERT Quick Notes',
      content: '# Cell Structure\n\n* Prokaryotic vs Eukaryotic\n* Cell organelles: ER, Golgi, Mitochondria, Plastids\n* Endosymbiotic theory',
      subject: 'Botany',
      highlights: 'Very High weightage for NEET/EAPCET',
      chapterId: findChapter('Cell: Structure & Function').id,
    },
  ];

  for (const n of notesData) {
    await prisma.note.create({ data: { ...n, userId: admin.id, isShared: true } });
  }

  for (const ch of ALL_CHAPTERS) {
    const chapter = chapterByKey[`${ch.year}|${ch.subject}|${ch.name}`];
    if (!chapter) continue;
    const existing = notesData.find((n) => n.chapterId === chapter.id);
    if (existing) continue;

    await prisma.note.create({
      data: {
        title: `${ch.name} — Quick Notes`,
        content: `# ${ch.name}\n\n**Subject:** ${ch.subject}\n**Year:** ${ch.year === 'INTER_1' ? 'Inter 1st Year' : 'Inter 2nd Year'}\n**Weightage:** ${ch.weightageLevel}\n**Difficulty:** ${ch.difficulty}\n\n## Key Points\n- Revise NCERT thoroughly for this chapter\n- Focus on high-yield diagrams and definitions\n- Practice ${ch.subject} MCQs after reading notes\n\n## Exam Tips\n- ${ch.isHighPriority ? '⭐ High priority for NEET/EAPCET' : 'Standard chapter — complete after high priority topics'}\n- ${ch.isRankBooster ? '⚡ Rank booster — scoring chapter' : 'Build strong fundamentals here'}`,
        subject: ch.subject,
        highlights: `${ch.weightageLevel} weightage · ${ch.difficulty} difficulty`,
        memoryTrick: ch.isMostDifficult ? 'Break into subtopics and revise daily' : null,
        chapterId: chapter.id,
        userId: admin.id,
        isShared: true,
      },
    });
  }
  console.log(`Seeded notes for all ${ALL_CHAPTERS.length} chapters`);

  const mcqsData = [
    { question: 'Which of the following is an example of a C4 plant?', optionA: 'Wheat', optionB: 'Rice', optionC: 'Sugarcane', optionD: 'Potato', correctOption: 'C', explanation: 'Sugarcane, Maize, and Sorghum are C4 plants.', difficulty: 'MEDIUM', subject: 'Botany', chapterId: findChapter('Photosynthesis').id },
    { question: 'Site of light reaction in chloroplast is:', optionA: 'Stroma', optionB: 'Grana', optionC: 'Matrix', optionD: 'Cristae', correctOption: 'B', explanation: 'Light reactions occur in grana thylakoids.', difficulty: 'EASY', subject: 'Botany', chapterId: findChapter('Photosynthesis').id },
    { question: 'Which hormone triggers ovulation?', optionA: 'FSH', optionB: 'LH', optionC: 'Prolactin', optionD: 'Oxytocin', correctOption: 'B', explanation: 'LH surge triggers ovulation.', difficulty: 'EASY', subject: 'Zoology', chapterId: findChapter('Human Reproduction').id },
    { question: 'Testosterone is secreted by:', optionA: 'Sertoli cells', optionB: 'Leydig cells', optionC: 'Granulosa cells', optionD: 'Pituitary', correctOption: 'B', explanation: 'Leydig cells secrete testosterone.', difficulty: 'MEDIUM', subject: 'Zoology', chapterId: findChapter('Human Reproduction').id },
    { question: 'SN2 reaction is favored by:', optionA: 'Tertiary halide', optionB: 'Primary halide', optionC: 'Bulky base', optionD: 'Polar protic solvent', correctOption: 'B', explanation: 'SN2 prefers primary substrates.', difficulty: 'HARD', subject: 'Chemistry', chapterId: findChapter('Organic Chemistry: Basic Principles (GOC)').id },
    { question: 'First law of thermodynamics is conservation of:', optionA: 'Momentum', optionB: 'Energy', optionC: 'Mass', optionD: 'Charge', correctOption: 'B', explanation: 'First law: energy cannot be created or destroyed.', difficulty: 'EASY', subject: 'Physics', chapterId: findChapter('Thermodynamics', 'Physics', 'INTER_1').id },
    { question: 'Cell wall in plants is primarily made of:', optionA: 'Chitin', optionB: 'Cellulose', optionC: 'Peptidoglycan', optionD: 'Lignin only', correctOption: 'B', explanation: 'Cellulose is the primary structural polysaccharide.', difficulty: 'EASY', subject: 'Botany', chapterId: findChapter('Cell: Structure & Function').id },
    { question: 'Mendel\'s law of segregation applies to:', optionA: 'Two traits', optionB: 'Single trait monohybrid cross', optionC: 'Linked genes', optionD: 'Polygenic traits', correctOption: 'B', explanation: 'Segregation explains 3:1 ratio in monohybrid cross.', difficulty: 'MEDIUM', subject: 'Botany', chapterId: findChapter('Principles of Inheritance & Variation').id },
    { question: 'Semiconductor used in solar cells is mainly:', optionA: 'Ge', optionB: 'Si', optionC: 'Cu', optionD: 'Fe', correctOption: 'B', explanation: 'Silicon is widely used in solar cells.', difficulty: 'EASY', subject: 'Physics', chapterId: findChapter('Semiconductor Electronics').id },
    { question: 'Coordination number of [Fe(CN)6]4- is:', optionA: '4', optionB: '6', optionC: '8', optionD: '2', correctOption: 'B', explanation: 'Six CN- ligands coordinate to Fe.', difficulty: 'MEDIUM', subject: 'Chemistry', chapterId: findChapter('Coordination Compounds').id },
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
    { title: 'Best Order to Study — Biology', subject: 'Botany', category: 'study-order', content: `# Best Study Order — Biology\n\n${STUDY_ORDER.biology.map((c, i) => `${i + 1}. ${c}`).join('\n')}` },
    { title: 'Best Order to Study — Chemistry', subject: 'Chemistry', category: 'study-order', content: `# Best Study Order — Chemistry\n\n${STUDY_ORDER.chemistry.map((c, i) => `${i + 1}. ${c}`).join('\n')}` },
    { title: 'Best Order to Study — Physics', subject: 'Physics', category: 'study-order', content: `# Best Study Order — Physics\n\n${STUDY_ORDER.physics.map((c, i) => `${i + 1}. ${c}`).join('\n')}` },
    { title: 'NEET Rank Booster Chapters', subject: 'All', category: 'rank-booster', content: '# NEET Rank Boosters\n\nGenetics, Human Physiology, Ecology, Reproduction, Biotechnology, Electrostatics, Thermodynamics, Organic Chemistry (GOC)' },
    { title: 'EAPCET Rank Booster Chapters', subject: 'All', category: 'rank-booster', content: '# EAPCET Rank Boosters\n\nPlant Physiology, Human Physiology, Genetics, Reproduction, Semiconductors, Communication Systems, p-Block, Solutions, Biomolecules' },
    { title: 'Inter 1st Year — High Priority Chapters', subject: 'All', category: 'high-weightage', content: '# Inter 1 High Priority\n\n**Botany:** Cell Biology, Photosynthesis, Respiration, Plant Growth, Anatomy\n\n**Zoology:** Animal Kingdom, Circulation, Neural Control, Endocrine\n\n**Chemistry:** Chemical Bonding, Equilibrium, Thermodynamics, GOC\n\n**Physics:** Rotational Motion, Thermodynamics, Waves, SHM' },
    { title: 'Inter 2nd Year — Highest Weightage', subject: 'All', category: 'high-weightage', content: '# Inter 2 Highest Weightage\n\n**Botany:** Genetics, Molecular Biology, Reproduction, Biotechnology\n\n**Zoology:** Human Reproduction, Human Health\n\n**Physics:** Semiconductors (easy scoring)\n\n**Chemistry:** p-Block, Coordination, Solutions, Organic' },
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
  const mockTestIds = [];
  for (const t of mockTests) {
    const created = await prisma.mockTest.create({ data: t });
    mockTestIds.push(created.id);
  }

  await prisma.mockScore.create({
    data: {
      userId: student.id,
      mockTestId: mockTestIds[0],
      score: 4,
      totalQuestions: 5,
      timeTakenMinutes: 165,
      answersJson: JSON.stringify(['C', 'B', 'B', 'B', 'B']),
      percentile: 78,
    },
  });

  const sampleRevisions = [
    findChapter('Photosynthesis'),
    findChapter('Cell: Structure & Function'),
    findChapter('Principles of Inheritance & Variation'),
    findChapter('Human Reproduction'),
    findChapter('Chemical Bonding & Molecular Structure'),
    findChapter('Semiconductor Electronics'),
  ];
  for (const ch of sampleRevisions) {
    if (!ch) continue;
    await prisma.revision.create({
      data: {
        userId: student.id,
        chapterId: ch.id,
        status: ['MASTERED', 'REVISED', 'IN_PROGRESS', 'NOT_STARTED'][sampleRevisions.indexOf(ch) % 4],
        revisionCount: sampleRevisions.indexOf(ch) % 2 === 0 ? 2 : 1,
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

  const paperEntries = copyPapersAndBuildSeed();
  for (const p of paperEntries) {
    await prisma.examPaper.create({ data: p });
  }
  console.log(`Seeded ${paperEntries.length} EAPCET previous papers`);

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
