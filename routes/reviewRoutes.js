const express = require('express')
const {createReview, getAllReviews, deleteReview, setTourUserIds, updateReview} = require('../controllers/reviewController')
const {protect, restrictTo} = require('../controllers/authController')

const router = express.Router({mergeParams:true})

router.route('/').get(getAllReviews).post(protect, restrictTo('user'), setTourUserIds, createReview)

router.route('/:id').delete(setTourUserIds, deleteReview).patch(updateReview)

module.exports = router