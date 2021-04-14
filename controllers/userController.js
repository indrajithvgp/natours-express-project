const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')

const filteredBody = (obj, ...allowedFields)=>{
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

exports.getAllUsers = catchAsync(async(req, res)=>{
    const users = await User.find()
    res.status(200).json({
        status:"success",
        results:users.length,
        data:{
            users
        }
    })
})

exports.getUser = (req, res)=>{
    res.status(500).json({
        status:"failure",
        message:"ROUTE is NOT yet implemented"
    })
}

exports.createUser = (req, res)=>{
    res.status(500).json({
        status:"failure",
        message:"ROUTE is NOT yet implemented"
    })
}
exports.updateUser = (req, res)=>{
    res.status(500).json({
        status:"failure",
        message:"ROUTE is NOT yet implemented"
    })
}

exports.deleteUser = (req, res)=>{
    res.status(500).json({
        status:"failure",
        message:"ROUTE is NOT yet implemented"
    })
}

exports.updateMe = catchAsync(async (req, res, next)=>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError("This route is not for password updates. Please use/updateMyPassword", 400))
    }

    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new:true,
        runValidators:true
    })
    res.status(200).json({
        status:'success',
        data:{
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active:false})
    res.status(204).json({
        status:'success',
        data:null
    })
    next()

})