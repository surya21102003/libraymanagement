const Loan = require('../models/loanModel');
const Book = require('../models/bookModel');
const CustomError = require('../utils/errorHandler').CustomError;
const APIFeatures = require('../utils/apiFeature');

exports.getLoans = async (req, res, next) => {
  try {
    let query = Loan.find().populate({
      path: 'user',
      select: 'username email'
    }).populate({
      path: 'book',
      select: 'title author isbn'
    });

    if (req.user.role !== 'admin') {
      query = query.where('user').equals(req.user.id);
    }

    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const loans = await features.query;
    const total = await Loan.countDocuments(features.query._conditions);

    res.status(200).json({
      success: true,
      count: loans.length,
      total,
      data: loans
    });
  } catch (error) {
    next(error);
  }
};

exports.getLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate({
      path: 'user',
      select: 'username email'
    }).populate({
      path: 'book',
      select: 'title author isbn'
    });

    if (!loan) {
      return next(new CustomError(`No loan with the id of ${req.params.id}`, 404));
    }

    if (req.user.role !== 'admin' && loan.user._id.toString() !== req.user.id) {
      return next(new CustomError(`User ${req.user.id} is not authorized to view this loan`, 401));
    }

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};


exports.createLoan = async (req, res, next) => {
  req.body.user = req.user.id;

  try {
    const { user, book, dueDate } = req.body;

    if (!book) {
      return next(new CustomError('Please specify a book to borrow', 400));
    }

    const bookDoc = await Book.findById(book);
    if (!bookDoc) {
      return next(new CustomError(`Book with ID ${book} not found`, 404));
    }

    if (bookDoc.availableCopies <= 0) {
      return next(new CustomError('No copies of this book are currently available for loan.', 400));
    }

    const existingLoan = await Loan.findOne({ user: req.user.id, book: book, status: 'borrowed' });
    if (existingLoan) {
      return next(new CustomError('You have already borrowed this book and have not yet returned it.', 400));
    }

    const loan = await Loan.create({ user, book, dueDate });

    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};


exports.updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return next(new CustomError(`No loan with the id of ${req.params.id}`, 404));
    }

    if (req.user.role !== 'admin' && loan.user.toString() !== req.user.id) {
      return next(new CustomError(`User ${req.user.id} is not authorized to update this loan`, 401));
    }

    const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: updatedLoan });
  } catch (error) {
    next(error);
  }
};

exports.markLoanAsReturned = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return next(new CustomError(`No loan with the id of ${req.params.id}`, 404));
    }

    if (req.user.role !== 'admin' && loan.user.toString() !== req.user.id) {
      return next(new CustomError(`User ${req.user.id} is not authorized to mark this loan as returned`, 401));
    }

    if (loan.status === 'returned') {
      return next(new CustomError('This loan has already been marked as returned.', 400));
    }

    loan.status = 'returned';
    loan.returnDate = Date.now();
    loan.returnedBy = req.user.id; 
    await loan.save(); 

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

exports.deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return next(new CustomError(`No loan with the id of ${req.params.id}`, 404));
    }

    if (req.user.role !== 'admin') {
      return next(new CustomError(`User ${req.user.id} is not authorized to delete this loan record`, 403));
    }

    if (loan.status === 'borrowed') {
        const book = await Book.findById(loan.book);
        if (book) {
            book.availableCopies += 1;
            await book.save();
        }
    }

    await loan.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};