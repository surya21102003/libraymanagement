const express = require('express');
const {
  getAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = require('../controllers/authorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getAuthors)
  .post(protect, authorize('admin'), createAuthor);

router.route('/:id')
  .get(getAuthor)
  .put(protect, authorize('admin'), updateAuthor)
  .delete(protect, authorize('admin'), deleteAuthor);

module.exports = router;