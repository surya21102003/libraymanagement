const express = require('express');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCover
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingleImage } = require('../middleware/multerMiddleware');

const router = express.Router();

// Re-route into other resource routers (e.g., reviews for a book)
// This makes the review routes accessible via /api/books/:bookId/reviews
const reviewRouter = require('./reviewRoutes');
router.use('/:bookId/reviews', reviewRouter);

router.route('/')
  .get(getBooks)
  .post(protect, authorize('admin'), createBook);

router.route('/:id')
  .get(getBook)
  .put(protect, authorize('admin'), updateBook)
  .delete(protect, authorize('admin'), deleteBook);

router.patch(
  '/:id/upload-cover',
  protect,
  authorize('admin'),
  uploadSingleImage('coverImage'), // 'coverImage' is the field name in the form data
  uploadBookCover
);

module.exports = router;