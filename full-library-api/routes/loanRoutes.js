const express = require('express');
const {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  markLoanAsReturned,
  deleteLoan
} = require('../controllers/loanController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All loan routes require authentication

router.route('/')
  .get(authorize('admin', 'user'), getLoans) // Admin can see all, user can see their own
  .post(authorize('user', 'admin'), createLoan); // User can create loans, admin too

router.route('/:id')
  .get(authorize('admin', 'user'), getLoan) // Admin can get any, user can get their own
  .put(authorize('admin'), updateLoan); // Only admin can generally update
  // DELETE /api/loans/:id is for administrative cleanup

router.patch('/:id/return', authorize('admin', 'user'), markLoanAsReturned); // User can mark their own as returned, admin can mark any

router.delete('/:id', authorize('admin'), deleteLoan); // Only admin can delete loan records

module.exports = router;