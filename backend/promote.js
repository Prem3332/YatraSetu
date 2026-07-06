const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.updateMany({
    data: {
      role: 'temple_admin'
    }
  });
  console.log(`Updated ${users.count} users to temple_admin role.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
