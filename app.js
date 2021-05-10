const express = require('express');
const { Error } = require('mongoose');
const rateLimit = require('express-rate-limit')
const path = require('path')
const helmet = require('helmet')
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes')
const viewRouter = require('./routes/viewRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

/* Middlewares */
// app.use(helmet())

const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:"Too many requests on this IP, Please try again in an Hour"
})
app.use('/api', limiter)


if(process.env.NODE_ENV !== 'production'){
    app.use(morgan('dev'))
}

app.use(cors())

app.use(express.json());
app.use(express.urlencoded({extended:true, limit:'10kb'}))
app.use(cookieParser())

app.use(mongoSanitize())
app.use(xss())

app.use(express.static(path.join(__dirname,'public')))

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

app.all('*', (req, res, next) =>{
    next(new AppError(`cant able to find ${req.originalUrl} on the server`, 404))
})

app.use(globalErrorHandler)



module.exports = app

