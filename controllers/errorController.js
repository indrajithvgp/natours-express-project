
const AppError = require('./../utils/appError')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message)
}

const handleDuplicateFields = err => {

    const message = `Duplicate value, Please use different one`
    return new AppError(message)
}

const handleJWTError = err => new AppError('Invalid Token', 401)

const handleJWTExpiredError = err => new AppError('Your Token has expired! Please Log in again', 401)

const sendErrorDev = (err, req,res)=>{
    if(req.originalUrl.startsWith('/api')){
        res.status(err.statusCode).json({
            status:err.status,
            err:err,
            stack:err.stack,
            message:err.name
        })
    }else{
        res.status(err.statusCode).render('error',{
            title:'Something went wrong',
            msg:err.message
        })
    }
    
}

const sendErrorProd = (err, req, res)=>{
    if(req.originalUrl.startsWith('/api')){
        if(err.isOperational){
            res.status(err.statusCode).json({
                status:err.status,
                message:err.message
            })
        }else{
            return res.status(500).json({
                status:"error",
                message:"Something went wrong"
            })
        }
    }
    if(err.isOperational){
        return res.status(err.statusCode).render('error',{
            title:'Something went wrong',
            msg:err.message
        })
    }
    return res.status(err.statusCode).render('error',{
        title:'Something went wrong',
        msg:"Something went wrong, Please try again ... !"
    })
}
module.exports = (err, req, res, next) => {
    console.log(err)
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"
    if(process.env.NODE_ENV !== "production"){
        let error = {...err} 
        error.message = err.message;
        if(err.name === 'CastError') error = handleCastErrorDB(error);
        if(err.code===11000) error = handleDuplicateFields(error);
        if(err.name==='JsonWebTokenError') error = handleJWTError(error);
        if(err.name==='TokenExpiredError') error = handleJWTExpiredError(error);
        sendErrorDev(error,req, res)
    }else if(process.env.NODE_ENV === "production"){
        let error = {...err} 
        error.message = err.message;
        if(err.name === 'CastError') error = handleCastErrorDB(error);
        if(err.code===11000) error = handleDuplicateFields(error);
        if(err.name==='JsonWebTokenError') error = handleJWTError(error);
        if(err.name==='TokenExpiredError') error = handleJWTExpiredError(error);
        sendErrorProd(error,req, res)
    }
}