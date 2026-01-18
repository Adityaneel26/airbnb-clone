const mongoose = require("mongoose");

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
      type: String,
      default:
        "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?cs=srgb&dl=pexels-simon73-1323550.jpg&fm=jpg",
      set: (v) =>
        v === ""
          ? "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?cs=srgb&dl=pexels-simon73-1323550.jpg&fm=jpg"
          : v,
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
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;