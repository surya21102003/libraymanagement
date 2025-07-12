const multer = require('multer');
const CustomError = require('../utils/errorHandler');
const config = require('../config/config'); // Import general config for file upload limits

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  if (config.fileUpload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new CustomError('Invalid file type! Only JPEG, PNG, GIF are allowed.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.fileUpload.maxSize // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
exports.uploadSingleImage = (fieldName) => (req, res, next) => {
  const uploadMiddleware = upload.single(fieldName);

  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new CustomError(`File too large! Max size is ${config.fileUpload.maxSize / (1024 * 1024)}MB`, 400));
      }
      return next(new CustomError(err.message, 400));
    } else if (err) {
      return next(err); // Pass custom errors from fileFilter
    }
    next();
  });
};