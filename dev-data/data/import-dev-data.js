const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: './config.env' });
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');


mongoose
  .connect('mongodb+srv://Indrajith:BqQzvX6ZKi5E5Tz@natours.4qvig.mongodb.net/natours?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(' DB Connected Successfully'));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave:false});
    await Review.create(reviews);
    console.log('Data successfully loaded...');
    process.exit()
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted....');
    process.exit()
  } catch (err) {
    console.log(err);
  }
};
if(process.argv[2]==='--import'){
    importData()
}else if(process.argv[2]==='--delete'){
    deleteData()
}

