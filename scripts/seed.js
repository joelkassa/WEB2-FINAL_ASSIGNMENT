require('../config/env');
const { sequelize } = require('../models');
const seedCategories = require('../seeders/categories.seed');

const runSeeders = async () => {
  try {
    await sequelize.sync({ alter: true });
    await seedCategories();
    console.log('All seeders completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();