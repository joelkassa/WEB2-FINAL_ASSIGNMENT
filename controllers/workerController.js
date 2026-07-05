const { Worker, WorkerSkill, PortfolioItem, User, Category } = require('../models');

const workerController = {
  createProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;

      if (req.user.role !== 'worker') {
        return res.status(403).json({
          success: false,
          message: 'Only workers can create a worker profile.',
        });
      }

      const existing = await Worker.findOne({ where: { userId } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Worker profile already exists.',
        });
      }

      const { categoryId, businessName, bio, hourlyRate, address, city } = req.body;

      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID.',
        });
      }

      const worker = await Worker.create({
        userId,
        categoryId,
        businessName,
        bio,
        hourlyRate,
        address,
        city,
      });

      const workerWithUser = await Worker.findByPk(worker.id, {
        include: [
          { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
          { model: Category, attributes: ['id', 'name'] },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Worker profile created successfully.',
        data: { worker: workerWithUser },
      });
    } catch (error) {
      next(error);
    }
  },

  getMyProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const worker = await Worker.findOne({
        where: { userId },
        include: [
          { model: User, attributes: { exclude: ['passwordHash'] } },
          { model: Category },
          { model: WorkerSkill },
          { model: PortfolioItem },
        ],
      });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found.',
        });
      }

      res.json({
        success: true,
        data: { worker },
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const worker = await Worker.findOne({ where: { userId } });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found.',
        });
      }

      const { businessName, bio, hourlyRate, address, city, categoryId } = req.body;

      if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Invalid category ID.',
          });
        }
        worker.categoryId = categoryId;
      }

      worker.businessName = businessName || worker.businessName;
      worker.bio = bio || worker.bio;
      worker.hourlyRate = hourlyRate !== undefined ? hourlyRate : worker.hourlyRate;
      worker.address = address || worker.address;
      worker.city = city || worker.city;

      await worker.save();

      res.json({
        success: true,
        message: 'Profile updated successfully.',
        data: { worker },
      });
    } catch (error) {
      next(error);
    }
  },

  addSkill: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const worker = await Worker.findOne({ where: { userId } });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found.',
        });
      }

      const { skillName, description, certificationUrl } = req.body;

      const skill = await WorkerSkill.create({
        workerId: worker.id,
        skillName,
        description,
        certificationUrl,
      });

      res.status(201).json({
        success: true,
        message: 'Skill added successfully.',
        data: { skill },
      });
    } catch (error) {
      next(error);
    }
  },

  removeSkill: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { skillId } = req.params;

      const worker = await Worker.findOne({ where: { userId } });
      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found.',
        });
      }

      const skill = await WorkerSkill.findOne({
        where: { id: skillId, workerId: worker.id },
      });

      if (!skill) {
        return res.status(404).json({
          success: false,
          message: 'Skill not found.',
        });
      }

      await skill.destroy();

      res.json({
        success: true,
        message: 'Skill removed successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  uploadPortfolio: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const worker = await Worker.findOne({ where: { userId } });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided.',
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const { caption } = req.body;

      const item = await PortfolioItem.create({
        workerId: worker.id,
        fileUrl,
        caption,
      });

      res.status(201).json({
        success: true,
        message: 'Portfolio item uploaded successfully.',
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  },

  removePortfolio: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;

      const worker = await Worker.findOne({ where: { userId } });
      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found.',
        });
      }

      const item = await PortfolioItem.findOne({
        where: { id: itemId, workerId: worker.id },
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio item not found.',
        });
      }

      await item.destroy();

      res.json({
        success: true,
        message: 'Portfolio item removed successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  listWorkers: async (req, res, next) => {
    try {
      const { categoryId, city, minRating, search } = req.query;

      const where = {};
      const include = [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: Category, attributes: ['id', 'name'] },
      ];

      if (categoryId) where.categoryId = categoryId;
      if (city) where.city = { [require('sequelize').Op.iLike]: `%${city}%` };
      if (minRating) where.averageRating = { [require('sequelize').Op.gte]: minRating };

      const workers = await Worker.findAll({
        where,
        include,
        order: [['averageRating', 'DESC']],
      });

      res.json({
        success: true,
        data: { workers, count: workers.length },
      });
    } catch (error) {
      next(error);
    }
  },

  getWorkerById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const worker = await Worker.findByPk(id, {
        include: [
          { model: User, attributes: { exclude: ['passwordHash'] } },
          { model: Category },
          { model: WorkerSkill },
          { model: PortfolioItem },
        ],
      });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker not found.',
        });
      }

      res.json({
        success: true,
        data: { worker },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = workerController;
