const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

// The mergeParams option allows us to access parameters from the parent router (e.g., bookId)
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getReviews) // Get reviews for a specific book
  .post(protect, authorize('user', 'admin'), addReview); // Add review to a book

router.route('/:id') // This 'id' refers to reviewId
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview) // User can update their own, admin can update any
  .delete(protect, authorize('user', 'admin'), deleteReview); // User can delete their own, admin can delete any

module.exports = router;