const express = require('express');
const reportController = require('../controllers/report.controller');

const router = express.Router();

// Base API Route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the WhistleCare API!' });
});

// Domain entities routes
router
  .route('/reports')
  .get(reportController.getAllReports)
  .post(reportController.createReport);

module.exports = router;
