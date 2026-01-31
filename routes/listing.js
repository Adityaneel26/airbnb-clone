const express=require("express")
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync")
const Expresserror = require("../utils/Expresserror");
const {listingSchema,reviewSchema}=require("../schema.js")
const Listing=require("../models/listing")


const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new Expresserror(400, error.details[0].message);
  }
  next();
};


router.get("/",wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({})
    res.render("./listings/index.ejs",{allListings})
}))

router.get("/new",(req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("error","you must be logeed in to create listings")
        res.redirect("/login")
    }
    res.render("./listings/new.ejs")
})
/////////////////////////////show rout
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing =  await Listing.findById(id).populate("reviews")
    if(!listing){
        req.flash("error","listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("./listings/show.ejs",{listing})
}))

////////////////////////////new rout
router.post("/",validateListing,wrapAsync(async(req,res)=>{
   
        
        const newlisting = new Listing(req.body.listing)

        await newlisting.save();
        // console.log(    )
        req.flash("success","New Listing Created")
        res.redirect("/listings")

}))


////////////////////////////////edit rout
router.get("/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    
    const listing =  await Listing.findById(id)
       if(!listing){
        req.flash("error","listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("./listings/edit.ejs",{listing})
}))


//////////////////////////////update rout
router.put("/:id",validateListing,wrapAsync(async(req,res)=>{
   
    let {id}= req.params;
    // let data=req.body;
    // console.log(data)
    await Listing.findByIdAndUpdate(id,{ ...req.body.listings })
            req.flash("success"," Listing updated")

    res.redirect(`/listings/${id}`)
}))

//////////////////////////////delete route
router.delete("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
            req.flash("success"," Listing deleted")

    res.redirect("/listings")
}))

module.exports=router