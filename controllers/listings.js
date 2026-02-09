const Listing=require("../models/listing")
const geocoder = require("../utils/geocoder");

//index route
module.exports.index=async (req,res)=>{
    const allListings = await Listing.find({})
    res.render("./listings/index.ejs",{allListings})
}

//render new form
module.exports.renderNewForm=(req,res)=>{
        res. render("./listings/new.ejs")
}

//show route
module.exports.showListings=async(req,res)=>{
    let {id}=req.params;
    const listing =  await Listing.findById(id).populate({path:"reviews",populate:{path:"author",},}).populate("owner")
    if(!listing){
        req.flash("error","listing you requested for does not exist")
        res.redirect("/listings")
    }
    console.log(listing.owner)
    res.render("./listings/show.ejs",{listing,mapApi: process.env.MAP_API})
}


//new route
module.exports.createListing=async(req,res)=>{
        try {
            let url=req.file.path
            let filename=req.file.filename
            const newlisting = new Listing(req.body.listing)
            newlisting.owner=req.user._id;
            newlisting.image={url,filename}
            
            // Geocode the location
            if(newlisting.location && newlisting.country) {
                const fullAddress = `${newlisting.location}, ${newlisting.country}`;
                try {
                    const geoResults = await geocoder.geocode(fullAddress);
                    if(geoResults && geoResults.length > 0) {
                        newlisting.geometry = {
                            type: 'Point',
                            coordinates: [geoResults[0].longitude, geoResults[0].latitude]
                        };
                    }
                } catch(geoError) {
                    console.log("Geocoding error:", geoError);
                    // Will use default coordinates if geocoding fails
                }
            }
            
            await newlisting.save();
            req.flash("success","New Listing Created")
            res.redirect("/listings")
        } catch(err) {
            console.log(err);
            req.flash("error", "Error creating listing");
            res.redirect("/listings/new");
        }
}

//render edit form
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    
    const listing =  await Listing.findById(id)
       if(!listing){
        req.flash("error","listing you requested for does not exist")
        res.redirect("/listings")
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250")
    res.render("./listings/edit.ejs",{listing,originalImageUrl})
}

//update route
module.exports.updateListing=async(req,res)=>{
   
    let {id}= req.params;
    try {
        let listing = await Listing.findById(id);
        
        // Update listing data
        Object.assign(listing, req.body.listings);
        
        // Geocode if location or country changed
        if(req.body.listings.location || req.body.listings.country) {
            const fullAddress = `${listing.location}, ${listing.country}`;
            try {
                const geoResults = await geocoder.geocode(fullAddress);
                if(geoResults && geoResults.length > 0) {
                    listing.geometry = {
                        type: 'Point',
                        coordinates: [geoResults[0].longitude, geoResults[0].latitude]
                    };
                }
            } catch(geoError) {
                console.log("Geocoding error:", geoError);
            }
        }
        
        // Update image if new file uploaded
        if(typeof req.file !== "undefined"){
            let url=req.file.path
            let filename=req.file.filename
            listing.image={url,filename}
        }
        
        await listing.save();
        req.flash("success"," Listing updated")
        res.redirect(`/listings/${id}`)
    } catch(err) {
        console.log(err);
        req.flash("error", "Error updating listing");
        res.redirect(`/listings/${id}/edit`);
    }
}

//delete route
module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
            req.flash("success"," Listing deleted")

    res.redirect("/listings")
}
