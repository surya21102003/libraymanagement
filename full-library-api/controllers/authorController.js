const Author = require('../models/authModel');
const CustomError = require('../utils/errorHandler').CustomError;
const APIFeatures = require('../utils/apiFeature');

exports.getAuthors = async (req, res, next) => {
  try {
    const features = new APIFeatures(Author.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const authors = await features.query;
    const total = await Author.countDocuments(features.query._conditions);

    res.status(200).json({
      success: true,
      count: authors.length,
      total,
      data: authors
    });
  } catch (error) {
    next(error);
  }
};

exports.getAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return next(new CustomError(`No author with the id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
};

exports.createAuthor = async (req, res, next) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
};

exports.updateAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!author) {
      return next(new CustomError(`No author with the id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
};

exports.deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return next(new CustomError(`No author with the id of ${req.params.id}`, 404));
    }

    const Book = require('../models/bookModel'); // Require here to avoid circular dependency
    const associatedBooks = await Book.countDocuments({ author: req.params.id });
    if (associatedBooks > 0) {
      return next(new CustomError(`Cannot delete author with associated books. Please reassign or delete books first.`, 400));
    }

    await author.deleteOne(); // Mongoose 5+
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};