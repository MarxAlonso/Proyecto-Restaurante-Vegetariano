import bcrypt from 'bcryptjs';
import prisma from './prisma.client.js';

export async function seedDatabase() {
  console.log('🌱 Checking for seed data...');

  const roles = ['ADMIN', 'KITCHEN', 'CLIENT'] as const;
  
  for (const role of roles) {
    const email = `${role.toLowerCase()}@restveg.com`;
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      console.log(`👤 Creating ${role} user...`);
      const hashedPassword = await bcrypt.hash(`${role.toLowerCase()}123`, 10);
      
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${role.charAt(0) + role.slice(1).toLowerCase()} User`,
          role: role,
        },
      });
    }
  }

  console.log('✅ Seeding check complete.');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error('❌ Error during seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
