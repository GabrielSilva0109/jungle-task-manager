import { INestApplication } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

export default async function seedAdminUser(app: INestApplication) {
  const userRepository = app.get('UserRepository');
  const adminEmail = 'adminuser@mail.com';
  const adminUsername = 'adminuser';
  const adminPassword = 'admin123';
  const adminRole = 'admin';

  const existing = await userRepository.findOne({ where: { email: adminEmail } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = userRepository.create({
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      role: adminRole,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('Admin user created:', adminEmail);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }
}
