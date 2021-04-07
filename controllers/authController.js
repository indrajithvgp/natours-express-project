const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const signInToken = id => {
    return jwt.sign({id}, process.env.JWT_TOKEN, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signUp = catchAsync(async(req, res, next) =>{
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password, 
        passwordConfirm:req.body.passwordConfirm
    }) 
    const token = signInToken(newUser._id)
    res.status(201).json({
        status: 'success',
        token,
        data:{
            user: newUser,
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {

    const {email, password} = req.body

    if(!email || !password){
        return next(new AppError('Please provide email and password', 400))
    }   
    const user = await User.findOne({email}).select('+password')

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401))
    }
    const token = signInToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})

exports.protect = catchAsync(async(req,res,next)=>{
    let token 
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token){
        return next(new AppError("You are not logged In! Please log in to get Access", 401))
    }
    const decoded = jwt.verify(token, process.env.JWT_TOKEN)
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return next(new AppError('The User belonging to this token does not exist', 401))
    }
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed Password! Please log in again', 401))
    }
    req.user = currentUser
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403))
        }
    }
}