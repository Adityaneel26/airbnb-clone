const express=require("express")
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync")
const Expresserror = require("../utils/Expresserror");
const {listingSchema,reviewSchema}=require("../schema.js")
const Review=require("../models/review.js")
const Listing=require("../models/listing.js")
const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
        if(error){
            throw new Expresserror(400,error)
        }else{
            next();
        }
}
//reviews
//post rout of review
router.post("/",validateReview,wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id)
    let newReview=new Review(req.body.review);
    listing.reviews.push(newReview)
    await newReview.save()
    await listing.save()
            req.flash("success","New review added")

    console.log("new review saved")
    res.redirect(`/listings/${req.params.id}`)
}))

//Delete rout
router.delete("/:reviewid",wrapAsync(async(req,res)=>{
    let {id,reviewid}=req.params
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}})
    await Review.findByIdAndDelete(reviewid)
            req.flash("success","review Deleted")

    res.redirect(`/listings/${id}`)
}))

module.exports=router
