const express = require('express')
const {getOverview, getTour} = require('../controllers/viewController')

const router = express.Router()

// router.get('/', (req, res)=>{
//     res.status(200).render('base', {
//         tour:'The Forest Hiker',
//         user:'Jonas'
//     })
// })

router.get('/', getOverview)

router.get('/tour/:slug', getTour)

module.exports = router