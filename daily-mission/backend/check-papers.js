const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.examPaper.findMany({ take: 5 }).then(papers => {
  console.log('Papers:', papers.map(p => ({ id: p.id, title: p.title, fileUrl: p.fileUrl })));
  return prisma.$disconnect();
}).catch(e => {
  console.error(e);
  return prisma.$disconnect();
});