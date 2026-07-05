const { User } = require('../models');
const { hashPassword } = require('../utils/hash');

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ where: { email: 'admin@test.com' } });
    if (existing) {
      console.log('Admin user already exists.');
      return;
    }

    const passwordHash = await hashPassword('AdminPass123');

    await User.create({
      email: 'admin@test.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isActive: true,
    });

    console.log('Admin user created successfully.');
    console.log('Email: admin@test.com');
    console.log('Password: AdminPass123');
  } catch (error) {
    console.error('Admin seeding failed:', error);
  }
};

module.exports = seedAdmin;
