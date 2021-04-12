const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

const filteredBody = (obj, ...allowedFields)=>{
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

exports.getAllUsers = (req, res)=>{
    res.status(500).json({
        status:"failure",
        message:"not yet implemented"
    })
}

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