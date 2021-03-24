const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: './config.env' });
const Tour = require('../../models/tourModel');


mongoose
  .connect('mongodb+srv://Indrajith:BqQzvX6ZKi5E5Tz@natours.4qvig.mongodb.net/natours?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(' DB Connected Successfully'));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded...');
    process.exit()
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
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

