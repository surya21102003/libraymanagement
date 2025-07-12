const User = require('../models/userModel');
const CustomError = require('../utils/errorHandler').CustomError;
const APIFeatures = require('../utils/apiFeature');

exports.getUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;
    const total = await User.countDocuments(); 
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new CustomError(`No user with the id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new CustomError(`No user found with id of ${req.params.id}`, 404));
    }

    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new CustomError(`User ${req.user.id} is not authorized to update this user`, 401));
    }

    const { username, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { username, email, role }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new CustomError(`No user found with id of ${req.params.id}`, 404));
    }

    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new CustomError(`User ${req.user.id} is not authorized to delete this user`, 401));
    }

    await user.deleteOne(); 
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.uploadProfilePicture = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new CustomError(`No user found with id of ${req.params.id}`, 404));
    }

    if (user._id.toString() !== req.user.id) {
      return next(new CustomError(`User ${req.user.id} is not authorized to update this profile picture`, 401));
    }

    if (!req.file) {
      return next(new CustomError('Please upload a file', 400));
    }

    user.profilePicture = req.file.filename; 
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};