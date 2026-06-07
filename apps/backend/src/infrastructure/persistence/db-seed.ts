import bcrypt from 'bcryptjs';
import prisma from './prisma.client';

const DEFAULT_CATEGORIES = [
  { name: 'Entrantes', slug: 'entrantes', description: 'Aperitivos y entrantes ligeros' },
  { name: 'Ensaladas', slug: 'ensaladas', description: 'Ensaladas frescas y saludables' },
  { name: 'Platos Principales', slug: 'platos-principales', description: 'Platos principales vegetarianos' },
  { name: 'Parrillas', slug: 'parrillas', description: 'Cortes premium a la parrilla' },
  { name: 'Pollos', slug: 'pollos', description: 'Especialidades de pollo' },
  { name: 'Carnes', slug: 'carnes', description: 'Cortes de carne seleccionados' },
  { name: 'Postres', slug: 'postres', description: 'Postres y dulces artesanales' },
  { name: 'Bebidas', slug: 'bebidas', description: 'Bebidas y refrescos' },
  { name: 'Bebidas Alcohólicas', slug: 'bebidas-alcoholicas', description: 'Cervezas, vinos y licores' },
];

export async function seedDatabase() {
  console.log('🌱 Checking for seed data...');

  // Seed users
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

  // Seed default categories
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      console.log(`📁 Creating category: ${cat.name}`);
      await prisma.category.create({ data: cat });
    }
  }

  // Seed default tables
  const tableCount = await prisma.table.count();
  if (tableCount === 0) {
    console.log('🪑 Creating default tables...');
    for (let i = 1; i <= 10; i++) {
      await prisma.table.create({
        data: { number: i, capacity: i <= 5 ? 2 : 4, status: 'AVAILABLE' },
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
