const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadProfilePicture
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingleImage } = require('../middleware/multerMiddleware');

const router = express.Router();



router.use(protect); 

router.route('/')
  .get(authorize('admin'), getUsers); 

router.route('/:id')
  .get(authorize('admin', 'user'), getUser) 
  .put(authorize('admin', 'user'), updateUser) 
  .delete(authorize('admin', 'user'), deleteUser); 

router.patch(
  '/:id/upload-profile-picture',
  authorize('admin', 'user'), 
  uploadSingleImage('profilePicture'), 
  uploadProfilePicture
);

module.exports = router;