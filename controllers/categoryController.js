const { Category } = require('../models');

const categoryController = {
  listAll: async (req, res, next) => {
    try {
      const categories = await Category.findAll({
        order: [['name', 'ASC']],
      });

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, description, icon } = req.body;

      const category = await Category.create({
        name,
        description,
        icon,
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = categoryController;
