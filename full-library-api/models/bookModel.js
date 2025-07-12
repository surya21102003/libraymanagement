const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    unique: true
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'Author',
    required: [true, 'Please add an author']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Fiction',
      'Non-Fiction',
      'Science Fiction',
      'Fantasy',
      'Thriller',
      'Mystery',
      'Biography',
      'History',
      'Science',
      'Technology',
      'Self-Help'
    ]
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to not be unique
    trim: true
  },
  publishedDate: {
    type: Date
  },
  description: {
    type: String,
    maxlength: [500, 'Description can not be more than 500 characters']
  },
  coverImage: {
    type: String,
    default: 'no-cover.jpg'
  },
  availableCopies: {
    type: Number,
    required: [true, 'Please add available copies'],
    min: 0,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with reviews
BookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book',
  justOne: false
});

module.exports = mongoose.model('Book', BookSchema);