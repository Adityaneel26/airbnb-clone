const Listing=require("../models/listing")
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
    res.render("./listings/show.ejs",{listing})
}


//new route
module.exports.createListing=async(req,res)=>{
        const newlisting = new Listing(req.body.listing)
        newlisting.owner=req.user._id;
        await newlisting.save();
        // console.log(    )
        req.flash("success","New Listing Created")
        res.redirect("/listings")
}

//render edit form
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    
    const listing =  await Listing.findById(id)
       if(!listing){
        req.flash("error","listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("./listings/edit.ejs",{listing})
}

//update route
module.exports.updateListing=async(req,res)=>{
   
    let {id}= req.params;
    // let data=req.body;
    // console.log(data)

    await Listing.findByIdAndUpdate(id,{ ...req.body.listings })
            req.flash("success"," Listing updated")

    res.redirect(`/listings/${id}`)
}

//delete route
module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
            req.flash("success"," Listing deleted")

    res.redirect("/listings")
}
