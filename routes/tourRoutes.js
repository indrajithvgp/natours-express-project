const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan
} = require('../controllers/tourController');

const {protect, restrictTo} = require('../controllers/authController')
// const {createReview} = require('../controllers/reviewController')
const reviewRouter = require('../routes/reviewRoutes')
const router = express.Router();

router.route('/tour-stats')
  .get(getTourStats)

router.route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide'), getMonthlyPlan)

router.route('/top-5-cheap')
  .get(aliasTopTours, getAllTours)

router.route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router.route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'),updateTour)
  .delete(protect,restrictTo('admin', 'lead-guide'),deleteTour);

// router.route('/:tourId/reviews')
//     .post(protect, restrictTo('user'),createReview)


router.use('/:tourId/review', reviewRouter )

module.exports = router;
