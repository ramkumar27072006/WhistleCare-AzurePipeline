const Report = require('../models/report.model');
const AppError = require('../utils/appError');

exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find();
    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: { reports },
    });
  } catch (error) {
    next(new AppError('Failed to fetch reports', 500));
  }
};

exports.createReport = async (req, res, next) => {
  try {
    const newReport = await Report.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { report: newReport },
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
