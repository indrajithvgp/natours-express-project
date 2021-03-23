const Tour = require('../models/tourModel')


exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  
};

exports.createTour = async (req, res) => {

  try{
    const newTour = await Tour.create(req.body)
    res.status(201).json({
    status:"success",
    data:{
      tour: newTour
    }
 })
  }catch(err){
    res.status(400).json({
      status:"failed",
      message:"error"
    })
  }
 
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated Tour... >',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};



// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf8')
// );



// exports.checkParamsID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       data: {
//         message: 'Invalid ID',
//       },
//     });
//   }
//   next();
// };


  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour,
  //       },
  //     });
  //   }
  // );


  // exports.checkBody = (req, res, next) => {
  //   if (!req.body.name || !req.body.price) {
  //     return res.status(404).json({
  //       status: 'fail',
  //       message: 'missing name or price',
  //     });
  //   }
  //   next();
  // };