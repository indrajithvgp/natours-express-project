const express = require('express');
const { Error } = require('mongoose');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express();

/* Middlewares */
app.use(helmet())

const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:"Too many requests on this IP, Please try again in an Hour"
})
app.use('/api', limiter)


if(process.env.NODE_ENV !== 'production'){
    app.use(morgan('dev'))
}


app.use(express.json());

app.use(mongoSanitize())
app.use(xss())

app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) =>{
    next(new AppError(`cant able to find ${req.originalUrl} on the server`, 404))
})

app.use(globalErrorHandler)



module.exports = app

