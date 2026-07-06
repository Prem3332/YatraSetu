const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Revert existing users to 'devotee' since we accidentally promoted them
  await prisma.user.updateMany({
    where: { phone: { not: '9999999999' } },
    data: { role: 'devotee' }
  });

  // Create a new dedicated admin account
  const phone = '9999999999';
  const passwordStr = 'Admin@123';
  const passwordHash = await bcrypt.hash(passwordStr, 10);

  const existingAdmin = await prisma.user.findUnique({ where: { phone } });
  
  if (existingAdmin) {
    await prisma.user.update({
      where: { phone },
      data: {
        role: 'temple_admin',
        passwordHash,
      }
    });
    console.log("Admin account updated.");
  } else {
    await prisma.user.create({
      data: {
        name: 'System Admin',
        phone: phone,
        passwordHash: passwordHash,
        role: 'temple_admin',
        gender: 'Other',
        age: 30,
        email: 'admin@yatrasetu.com'
      }
    });
    console.log("Admin account created.");
  }

  console.log(`\n--- ADMIN CREDENTIALS ---`);
  console.log(`Mobile Number: ${phone}`);
  console.log(`Password: ${passwordStr}`);
  console.log(`-------------------------\n`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
