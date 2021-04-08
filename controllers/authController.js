const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const {promisify} = require('util')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

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
        role:req.body.role,
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
    console.log(token)
    if(!token){
        return next(new AppError("You are not logged In! Please log in to get Access", 401))
    }
    const decoded =  await promisify(jwt.verify(token, process.env.JWT_TOKEN))
    console.log(decoded)
    const currentUser = await User.findById(decoded.id)
    console.log(currentUser)
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

exports.forgotPassword = catchAsync(async(req,res, next) => {
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return next(new AppError('No user with email ' + req.body.email, 404))
    }

    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave:false})

    const resetURL = 
    `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    try{
        const message = `Forgot your password? Submit a PATCH request to reset your password on this link ${resetURL}`
        await sendEmail({
            email:user.email,
            subject:'Your Password reset',
            message
        })
        res.status(201).json({
            status: 'success',
            message:"Token sent to mail.!"
        })
    }catch(err){
        console.log(err)
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({validateBeforeSave:false})
        return next(new AppError('Something went wrong. Please try again later', 500))
    }
    

})

exports.resetPassword = catchAsync(async(req,res, next)=>{
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
    const user = await User.findOne({passwordResetToken:hashedToken, 
        passwordResetExpires:{$gt:Date.now()}})
    if(!user){
        return next(new Error('Token is invalid or expired', 400))
    }
    user.password = req.body.password
    user.passwordResetExpires =  undefined
    user.passwordResetToken = undefined
    await user.save({validateBeforeSave:false})

    const token = signInToken(user._id)
    res.status(201).json({
        status:'success',
        token
    })

})