const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);
    const query = Tour.find(queryObj)
    const tours = await query
    res.status(200).json({
      status: 'success',
      results: tours.length,
      requestedAt: req.requestTime,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'could not update',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'done..!',
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
};
