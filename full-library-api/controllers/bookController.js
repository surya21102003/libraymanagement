const Book = require('../models/bookModel');
const CustomError = require('../utils/errorHandler').CustomError;
const APIFeatures = require('../utils/apiFeature');

exports.getBooks = async (req, res, next) => {
  try {
    const features = new APIFeatures(Book.find().populate('author'), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const books = await features.query;
    const total = await Book.countDocuments(features.query._conditions); // Get total count for filtered query

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      data: books
    });
  } catch (error) {
    next(error);
  }
};

exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('author reviews');

    if (!book) {
      return next(new CustomError(`No book with the id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!book) {
      return next(new CustomError(`No book with the id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(new CustomError(`No book with the id of ${req.params.id}`, 404));
    }

    await book.deleteOne(); // Mongoose 5+

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.uploadBookCover = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(new CustomError(`No book found with id of ${req.params.id}`, 404));
    }

    if (!req.file) {
      return next(new CustomError('Please upload a file', 400));
    }

    book.coverImage = req.file.filename; // Store only the filename in the DB
    await book.save();

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};