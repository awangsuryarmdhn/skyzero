import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Hash Password
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('admin123', salt); // Password: admin123

  // 2. Buat User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skylaundry.com' },
    update: {},
    create: {
      email: 'admin@skylaundry.com',
      name: 'Super Admin',
      password: hashedPassword, // Simpan yang sudah di-hash
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());