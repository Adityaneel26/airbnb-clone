const { ref } = require("joi");
const mongoose = require("mongoose");
const review = require("./review");
const user = require("./user");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
  // START OF THE FIX
  image:  {          // Store the URL
      url: String,
      filename: String     
    },
  
  // END OF THE FIX
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [72.5714, 23.0225]  // [longitude, latitude] - India fallback
    }
  },
  reviews:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Review"
    }
  ],
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await review.deleteMany({_id: {$in:listing.reviews}}    )
  }
})
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;