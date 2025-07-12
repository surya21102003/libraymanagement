const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  loanDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date,
    // When a book is returned, this date will be set.
    // It's not required on creation, only when marking as returned.
  },
  dueDate: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // Default 7 days from loan date
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed'
  },
  returnedBy: { // Optional: To track who marked the book as returned (e.g., admin)
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
});

// Pre-save hook to decrement availableCopies when a book is borrowed
LoanSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'borrowed') {
    const book = await this.model('Book').findById(this.book);
    if (book && book.availableCopies > 0) {
      book.availableCopies -= 1;
      await book.save();
    } else if (book && book.availableCopies === 0) {
      return next(new Error('No copies of this book are currently available for loan.'));
    } else {
      return next(new Error('Book not found.'));
    }
  }
  next();
});

// Post-save hook to increment availableCopies when a book is returned
LoanSchema.post('findOneAndUpdate', async function(doc) {
  // 'this' refers to the query, 'doc' refers to the updated document
  if (doc && doc.status === 'returned' && this._update.$set && this._update.$set.returnDate) {
    const book = await mongoose.model('Book').findById(doc.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }
  }
});


module.exports = mongoose.model('Loan', LoanSchema);