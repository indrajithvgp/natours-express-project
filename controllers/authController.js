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

const createTokenAndSend = (user, statusCode, res)=> {
    const token = signInToken(user._id)
    res.cookie('TOKEN', token,{
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly:true
    })
    user.password = undefined
    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user,
        }
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

    createTokenAndSend(newUser, 201, res)
    
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
    createTokenAndSend(user, 200, res)
})

exports.protect = catchAsync(async(req,res,next)=>{
    let token 
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.TOKEN){
        token = req.cookies.TOKEN
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

exports.logout = (req, res) => {
    res.cookie('TOKEN', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };


exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.TOKEN) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.TOKEN,
          process.env.JWT_TOKEN
        );
  
        // 2) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next();
        }
  
        // 3) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next();
        }
  
        // THERE IS A LOGGED IN USER
        res.locals.user = currentUser;
        
        return next();
      } catch (err) {
        return next();
      }
    }
    next();
  };


exports.restrictTo = (...roles) => {
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next()
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

    createTokenAndSend(user, 200, res)

})

exports.updatePassword = catchAsync(async(req, res, next) =>{
    const user = await User.findById(req.user.id).select('+password')

    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your currnt password is incorrect', 401))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm

    await user.save()
    console.log(user)


})