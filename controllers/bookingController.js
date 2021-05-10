const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')


exports.getCheckoutSession = catchAsync(async(req, res, next)=>{

    const tour = await Tour.findById(req.params.tourId)

    const session = await stripe.checkout.session.create({
        payment_method_types:['card'],
        success_url:`${req.protocol}://${req.get('host')}/`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items:[
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                // images: ,
                amount: tour.amount * 100,
                currency: 'usd',
                quantity: 1
            }
        ]

    })

    res.status(200).json({
        status: 'success',
        session
    })


})