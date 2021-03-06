const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const multer = require('multer')
const sharp = require('sharp')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const extension = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

const multerStorage = multer.memoryStorage()

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

exports.uploadTourPhoto = upload.single('photo')
exports.uploadTourPhotoArr = upload.array('photo', 5)

exports.uploadTourPhotos = upload.fields([
  {name:'imageCover', maxCount: 1},
  {name:'images', maxCount: 3}
])

exports.resizeTourImages = catchAsync(async(req, res, next) => {
  if(!req.files.imageCover || !req.files.images) return next()

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/tours/${req.body.imageCover}`)
    
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
  
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);
  
        req.body.images.push(filename);
      })
    );
    next()
})

exports.aliasTopTours = (req, res, next)=>{
  req.query.limit = '5'
  req.query.sort = '-ratingAverage, price'
  req.query.fields = "name, price, ratingsAverage, summary, difficulty"
  next()
}


exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      results: tours.length,
      requestedAt: req.requestTime,
      data: {
        tours,
      },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if(!tour){
      return next(new AppError("No tour found found with that ID",404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
});


exports.createTour = catchAsync(async (req, res, next) => {

  const newTour = await Tour.create(req.body)
  res.status(201).json({
    status:'success',
    data:{
      tours:newTour
    }
  })

  // try {
  //   const newTour = await Tour.create(req.body);
  //   res.status(201).json({
  //     status: 'success',
  //     data: {
  //       tour: newTour,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: err.message,
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if(!tour){
      return next(new AppError("No tour found found with that ID",404))
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
})

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if(!tour){
      return next(new AppError("No tour found found with that ID",404))
    }
    res.status(200).json({
      status: 'success',
      message: 'done..!',
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match:{ratingsAverage:{$gte:4.5}}
      },{
        $group:{
          _id:'$ratingsAverage',
          numTours:{$sum:1},
          avgRating:{$avg: '$ratingsAverage'},
          avgPrice:{$avg:'$price'},
          minPrice:{$min: '$price'},
          maxPrice:{$max: '$price'},
        }
      },{
        $sort:{maxPrice:-1}
      },{
        $match:{_id:{$ne:4.5}}
      }

    ])
    res.status(200).json({
      status:'ok',
      stats
    })

})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year*1
    const plan = await Tour.aggregate([
      {
        $unwind:'$startDates'
      },{
        $match:{startDates:{$gte:new Date(`${year}-01-01`), $lte:new Date(`${year}-12-31`)}}
      },{
        $group:{
          _id:{$month:'$startDates'},
          numTourStarts:{$sum:1},
          tours:{$push:'$name'}
        },
      },{
        $addFields:{
          month:'$_id'
        },
      },{
        $project:{
          _id:0
        }
      },{
        $sort:{numTourStarts:-1}
      }
    ])
    res.status(200).json({
      status:'ok',
      data:plan
    })
}) 

// tours-within/:distance/center/:latlong/unit/:unit

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlong, unit} = req.params

  const [lat, long] = latlong.split('.')

  if(!lat && !long){
    return next(new AppError('Please provide latitude and longitude', 400))
  }
  const radius = unit === "mi" ? (distance/ 3963.2) : (distance/ 6378.1)
  const data = await Tour.find(
    {
      startLocation:{$geoWithin:{$centerSphere:[[long,lat], radius]}}
    }
    )

  res.status(200).json({
    status:'success',
    results:data.length,
    data:{
      data
    }
  })
})

exports.getDistances = catchAsync(async (req, res, next) => {
  const {latlong, unit} = req.params

  const [lat, long] = latlong.split('.')

  const multiplier = unit === 'mi' ? 0.0000621 : 0.001

  if(!lat && !long){
    return next(new AppError('Please provide latitude and longitude', 400))
  }
  const data = await Tour.aggregate([
    {
      $geoNear:{
        near:{
          type:'Point',
          coordinates:[long *1, lat*1]
        },
        distanceField:'distance',
        distanceMultiplier:multiplier
      }
    },{
      $project:{
        distance:1,
        name:1
      }
    }
  ])
  
  res.status(200).json({
    status:'success',
    results:data.length,
    data:{
      data
    }
  })
})