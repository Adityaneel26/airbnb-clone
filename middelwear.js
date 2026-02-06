const Listing=require("./models/listing")
const Review=require("./models/review.js")
const Expresserror = require("./utils/Expresserror");
const {listingSchema,reviewSchema}=require("./schema.js");
const review = require("./models/review.js");

module.exports.isLoggedIn=(req,res,next)=>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl
        req.flash("error","you must be logeed in to create listings")
        return res.redirect("/login")
    }
    next()
}

module.exports.saveredirect=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl
    }
    next()
}


module.exports.isOwner=async(req,res,next)=>{
    let {id}= req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission");
return res.redirect(`/listings/${id}`);

    }
    next()
}

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new Expresserror(400, error.details[0].message);
  }
  next();
};

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
        if(error){
            throw new Expresserror(400,error)
        }else{
            next();
        }
}

module.exports.isRivewAuthor=async(req,res,next)=>{
    let {id,reviewId}= req.params;
    let review =await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        res.flash("error","You DOnt have permission  ")
        return res.redirect(`/listings/${id}`)
    }
    next()
}