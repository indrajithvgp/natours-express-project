
const AppError = require('./../utils/appError')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message)
}

const handleDuplicateFields = err => {

    const message = `Duplicate value, Please use different one`
    return new AppError(message)
}

const sendErrorDev = (err, res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        err:err,
        stack:err.stack,
        message:err.message
    })
}

const sendErrorProd = (err, res)=>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        })
    }else{
        res.status(500).json({
            status:"error",
            message:"Something went wrong"
        })
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"
    if(process.env.NODE_ENV !== "production"){
        sendErrorDev(err, res)
    }else if(process.env.NODE_ENV === "production"){
        let errror = {...err} 
        if(err.name === 'CastError') errror = handleCastErrorDB(error);
        if(err.code===11000) error = handleDuplicateFields(error);
        sendErrorProd(error,res)
    }
}