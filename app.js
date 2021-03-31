const express = require('express');
const { Error } = require('mongoose');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express();

/* Middlewares */

if(process.env.NODE_ENV !== 'production'){
    app.use(morgan('dev'))
}


app.use(express.json());

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

