const mongoose = require('mongoose');
const slugify = require('slugify')
const validator = require('validator')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'Tour name must have less than or equal to 40 characters'],
    minlength:[10, 'Tour name must have more than or equal to 10 characters'],
    // validate:[validator.isAlpha, "Tour name must be characters"]
  },
  slug:String,
  duration: {
    type: Number,
    required: [true, 'Tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'Tour must have a difficulty'],
    enum:{values:['easy', 'medium', 'difficult'], message:'Difficulty is either easy, medium, hard'},
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min:[1, 'Rating must be above than 1.0'],
    max:[5, 'Rating must be less than 5.0'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'Tour must have a price'],
  },
  priceDiscount: {
    type:Number,
    validate: {
      validator:function(val){
        return val < this.price
      },
      message:'Discount price ({VALUE}) should be below regular Price'
    }

  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'Tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'Tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select:false
  },
  secretTour:{
    type:Boolean,
    default:false
  },
  startDates:[Date]
},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});

tourSchema.virtual('durationWeeks').get(function(){
  return this.duration/7
})
//DOCUMENT MIDDLEWARE -- runs before save and create
tourSchema.pre('save', function(next){
  this.slug = slugify(this.name,{lower:true})
  console.log("I am Pre Save")
  next()
})

// tourSchema.post('save', function(doc, next){
//   console.log("I am Post Save")
//   next()
// })

// tourSchema.pre(/^find/, function(next){
//   console.log("I am Post Save 1")
  
//   next()
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
