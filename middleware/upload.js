const multer = require('multer');
const path = require('path');
const env = require('../config/env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.upload.dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'portfolio-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: env.upload.maxSize },
  fileFilter,
});

module.exports = upload;