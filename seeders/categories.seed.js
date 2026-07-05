const { Category } = require('../models');

const categories = [
  { name: 'Plumbing', description: 'Pipe repair, installation, and maintenance', icon: 'wrench' },
  { name: 'Electrical', description: 'Wiring, installations, and electrical repairs', icon: 'bolt' },
  { name: 'Catering', description: 'Event catering and food services', icon: 'utensils' },
  { name: 'Restaurant', description: 'Restaurant table booking and dining', icon: 'store' },
  { name: 'Cafe', description: 'Cafe services and reservations', icon: 'coffee' },
  { name: 'Cleaning', description: 'Residential and commercial cleaning', icon: 'broom' },
  { name: 'Hairstyling', description: 'Hair cuts, styling, and treatments', icon: 'scissors' },
  { name: 'Photography', description: 'Event and portrait photography', icon: 'camera' },
  { name: 'Tutoring', description: 'Private lessons and academic tutoring', icon: 'book' },
  { name: 'Fitness Training', description: 'Personal training and fitness coaching', icon: 'dumbbell' },
];

const seedCategories = async () => {
  try {
    for (const category of categories) {
      await Category.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });
    }
    console.log('Categories seeded successfully.');
  } catch (error) {
    console.error('Category seeding failed:', error);
  }
};

module.exports = seedCategories;