const express = require('express')
const {getAllUsers, createUser, getUser, updateUser, deleteUser} = require('../controllers/userController')
const router = express.Router()

/* Route configurations */

{
    // app.get('/api/v1/tours', getAllTours);
    
    // app.get('/api/v1/tours/:id', getTour);
    
    // app.post('/api/v1/tours', createTour);
    
    // app.patch('/api/v1/tours/:id', updateTour);
    
    // app.delete('/api/v1/tours/:id', deleteTour);
    }

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