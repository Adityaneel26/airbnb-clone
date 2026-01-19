const express=require('express')
const app=express()
const mongoose=require("mongoose")
const path=require("path")
const methodoverride=require("method-override")
const port=8080
const mongo_url="mongodb://127.0.0.1:27017/wanderlust"
const Listing=require("./models/listing")
const ejsmate=require("ejs-mate")
const wrapAsync=require("./utils/wrapAsync")
const Expresserror = require("./utils/Expresserror");
const {listingschema}=require("./schema.js")

app.engine("ejs",ejsmate)
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"views")))
// app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))
app.use(express.urlencoded({ extended:true}))
app.use(express.json())
app.use(methodoverride("_method"))

main().then(()=>{
    console.log("connected to db successfuly")
}).catch((err)=>{
    console.log(err)
})
async function main() {
    await mongoose.connect(mongo_url)
}

// app.use((req, res, next) => {
//     next(new Expresserror(404, "Page not found"));
// });
const validateListing=(req,res,next)=>{
    let {error}=listingschema.validate(req.body);
        if(error){
            throw new Expresserror(400,error)
        }else{
            next();
        }
}

app.get("/",(req,res)=>{
    res.send("hello this is root")
})
app.listen(port,()=>{
    console.log("app is listenini on 8080 port")
})


app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({})
    res.render("./listings/index.ejs",{allListings})
}))

app.get("/listings/new",(req,res)=>{
    res.render("./listings/new.ejs")
})
/////////////////////////////show rout
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing =  await Listing.findById(id)
    res.render("./listings/show.ejs",{listing})
}))

////////////////////////////new rout
app.post("/listings",validateListing,wrapAsync(async(req,res)=>{
   
        
        const newlisting = new Listing(req.body.listing)
   
        await newlisting.save();
        // console.log(    )
        res.redirect("/listings")
    
}))


////////////////////////////////edit rout
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing =  await Listing.findById(id)
    res.render("./listings/edit.ejs",{listing})
}))


//////////////////////////////update rout
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
   
    let {id}= req.params;
    // let data=req.body;
    // console.log(data)
    await Listing.findByIdAndUpdate(id,{ ...req.body.listings })
    res.redirect(`/listings/${id}`)
}))

//////////////////////////////delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
    res.redirect("/listings")
}))



app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    // res.status(status).send(message);
    res.render("error.ejs",{message})
});
