const express = require('express')
const {getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe} = require('../controllers/userController')
const {signUp, login, forgotPassword, resetPassword, updatePassword, protect} = require('../controllers/authController')

const router = express.Router()

router.route('/signup').post(signUp)
router.route('/login').post(login)

router.patch('/updateMyPassword', protect, updatePassword)

router.patch('/updateMe', protect, updateMe)
router.delete('/deleteMe', protect, deleteMe)

router.route('/forgotPassword').post(forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router.
    route('/')
    .get(getAllUsers)
    .post(createUser)
router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);



module.exports = router;