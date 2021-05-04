const AppError = require('../utils/appError')
const multer = require('multer')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const {deleteOne, updateOne} = require('../controllers/handlerFactory')

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users')
    },
    filename: (req, file, cb) => {
        const extension = file.mimetype.split('/')[1]
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
    }
})

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an Image, Please upload only image', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

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

// exports.getUser = (req, res)=>{
//     res.status(500).json({
//         status:"failure",
//         message:"ROUTE is NOT yet implemented"
//     })
// }

exports.getUser = catchAsync(async(req, res, next)=>{
    const user = await User.findById(req.user.id)
    res.status(201).json({
        status:"success",
        data:user
    })
})

exports.createUser = (req, res)=>{
    res.status(500).json({
        status:"failure",
        message:"ROUTE is NOT yet implemented"
    })
}
exports.updateUser = updateOne(User)

exports.deleteUser = deleteOne(User)

exports.updateMe = catchAsync(async (req, res, next)=>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError("This route is not for password updates. Please use/updateMyPassword", 400))
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo = req.file.filename

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

exports.getMe = catchAsync(async (req, res, next) => {
    req.params.id = req.user.id
    next()
})