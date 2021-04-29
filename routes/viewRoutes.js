const express = require('express')
const {getOverview, getTour, getLoginForm} = require('../controllers/viewController')
const {isLoggedIn} = require('../controllers/authController')

const router = express.Router()

// router.get('/', (req, res)=>{
//     res.status(200).render('base', {
//         tour:'The Forest Hiker',
//         user:'Jonas'
//     })
// })

router.use(isLoggedIn)

router.get('/', getOverview)

router.get('/tour/:slug', getTour)

router.get('/login', getLoginForm)

module.exports = router