const express=require("express")
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync")
const Expresserror = require("../utils/Expresserror");
const {listingSchema,reviewSchema}=require("../schema.js")
const Listing=require("../models/listing")
const {isLoggedIn,isOwner,validateListing}=require("../middelwear.js")
const listingController=require("../controllers/listings.js")
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


router.route("/")
.get(wrapAsync(listingController.index))
.post(upload.single('listing[image]'),isLoggedIn,validateListing,wrapAsync(listingController.createListing))

router.get("/new",isLoggedIn,listingController.renderNewForm)

router.route("/:id")
.get(wrapAsync(listingController.showListings))
.put(isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))


/////////////////////////////show rout


////////////////////////////new rout



////////////////////////////////edit rout
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm))


//////////////////////////////update rout


//////////////////////////////delete route


module.exports=router