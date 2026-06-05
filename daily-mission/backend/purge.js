const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Purging old data...');
  const [papers, diagrams, notes] = await Promise.all([
    prisma.examPaper.deleteMany({}),
    prisma.diagram.deleteMany({}),
    prisma.note.deleteMany({}),
  ]);
  console.log(`Purged ${papers.count} papers, ${diagrams.count} diagrams, and ${notes.count} notes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
