// This file can hold general configuration settings if needed beyond environment variables.
// For now, it might be less critical as most configs are in .env.
// It can be used for things like pagination defaults, file upload limits, etc.
module.exports = {
  pagination: {
    limit: 10,
    defaultPage: 1
  },
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
  }
};