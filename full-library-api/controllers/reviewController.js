const Review = require('../models/reviewModel');
const Book = require('../models/bookModel');
const CustomError = require('../utils/errorHandler').CustomError;
const APIFeatures = require('../utils/apiFeature');


exports.getReviews = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Review.find({ book: req.params.bookId }).populate({
        path: 'user',
        select: 'username'
      }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const reviews = await features.query;
    const total = await Review.countDocuments(features.query._conditions);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'book',
      select: 'title author'
    }).populate({
      path: 'user',
      select: 'username'
    });

    if (!review) {
      return next(new CustomError(`No review found with the id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  req.body.book = req.params.bookId;
  req.body.user = req.user.id; 

  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return next(new CustomError(`No book with the id of ${req.params.bookId}`, 404));
    }

    const existingReview = await Review.findOne({ book: req.params.bookId, user: req.user.id });
    if (existingReview) {
        return next(new CustomError('You have already submitted a review for this book.', 400));
    }

    const review = await Review.create(req.body);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return next(new CustomError(`No review with the id of ${req.params.id}`, 404));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new CustomError(`Not authorized to update this review`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new CustomError(`No review with the id of ${req.params.id}`, 404));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new CustomError(`Not authorized to delete this review`, 401));
    }

    await review.deleteOne(); 
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};