const express = require('express')
const {getOverview, getTour, getLoginForm, getAccount, getMyTours} = require('../controllers/viewController')
const {isLoggedIn, protect} = require('../controllers/authController')
const {createBookingCheckout} = require('../contollers/bookingController')
const router = express.Router()

// router.get('/', (req, res)=>{
//     res.status(200).render('base', {
//         tour:'The Forest Hiker',
//         user:'Jonas'
//     })
// })

router.get('/', createBookingCheckout, isLoggedIn, getOverview)

router.get('/tour/:slug', isLoggedIn, getTour)

router.get('/login', isLoggedIn, getLoginForm)

router.get('/me', protect, getAccount)

router.get('/my-tours', protect, getMyTours)

module.exports = router