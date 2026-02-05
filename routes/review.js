const express=require("express")
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync")
const Expresserror = require("../utils/Expresserror");
const {listingSchema,reviewSchema}=require("../schema.js")
const Review=require("../models/review.js")
const Listing=require("../models/listing.js")
const {isLoggedIn,validateReview, isRivewAuthor}=require("../middelwear.js")
const reviewController=require("../controllers/reviews.js")
//reviews
//post rout of review
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview))

//Delete rout
router.delete("/:reviewid",isLoggedIn,isRivewAuthor,wrapAsync(reviewController.destroyReview))

module.exports=router
