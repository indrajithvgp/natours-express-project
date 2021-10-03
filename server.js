const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', err=>{
  console.log('uncaughtException, SHUTTING DOWN')
  console.log(err.message, err.name)
  process.exit(1)
})

const app = require('./app');



const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  
  })
  .then(() => {
    console.log('DB Connection Successful..!'.yellow.bold);
  });


const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port} ...`.cyan.bold.underline);
});

process.on('unhandledRejection', err=>{
  console.log('unhandledRejection, SHUTTING DOWN')
  console.log(err.message, err.name)
  server.close(()=>{
    process.exit(1)
  })
})

