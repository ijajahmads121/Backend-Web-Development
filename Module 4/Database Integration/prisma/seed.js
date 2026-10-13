require('dotenv').config();

const prisma = require('../src/db/prisma');
const seedPosts = require('../src/data/postSeed');

async function main() {
  let author = await prisma.user.findUnique({ where: { id: 1 } });
  if (!author) {
    author = await prisma.user.create({ data: { name: 'Community member' } });
  }

  if (await prisma.post.count() === 0) {
    await prisma.post.createMany({
      data: seedPosts.map(({ title, body }) => ({
        title,
        body,
        authorId: author.id,
      })),
    });
  }
}

main()
  .catch((error) => {
    console.error('Database seed failed. Check DATABASE_URL and migration status.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
