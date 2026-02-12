require("dotenv").config()
const express=require('express')
const app=express()
const mongoose=require("mongoose")
const path=require("path")
const methodoverride=require("method-override")
const port=8000
const mongo_url="mongodb://127.0.0.1:27017/wanderlust"
const Listing=require("./models/listing")
const ejsmate=require("ejs-mate")
const wrapAsync=require("./utils/wrapAsync")
const Expresserror = require("./utils/Expresserror");
const {listingSchema,reviewSchema}=require("./schema.js")
const Review=require("./models/review.js")
const listingsRouters=require("./routes/listing.js")
const reviewsRouters=require("./routes/review.js")
const userRouter=require("./routes/user.js")
const session= require("express-session")
const MongoStroe=require("connect-mongo")
const flash=require("connect-flash")
const dburl=process.env.ATLAS_DB
const store=MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:"mysupersessionsecret"

    },
    touchAfter:24*3600
})
store.on("error",()=>{
    console.log("Error in mongo store")
})
const sessionOptions={
    store,
    secret:"mysupersessionsecret",
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:Date.now() + 7 *24 *60 *60 *1000,
        maxAge:7 *24 *60 *60 *1000,
        httponly:true,
    }
}



const passport=require("passport")
const LocalStratgy=require("passport-local")
const User=require("./models/user.js")


app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStratgy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
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
    await mongoose.connect(dburl)
}

// app.use((req, res, next) => {
//     next(new Expresserror(404, "Page not found"));
// });
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // ✅ FIX
    next();
});

app.get("/demouser",async(req,res)=>{
    let fakeuser=new User({
        email:"adi@gmail.com"
        ,username:"Aditya"  
    })
    let newuser = await User.register(fakeuser,"helloworld")
    res.send(newuser)
})

app.use("/listings",listingsRouters)
app.use("/listings/:id/reviews",reviewsRouters)
app.use("/",userRouter)

// app.get("/",(req,res)=>{
//     res.send("hello this is root")
// })
app.listen(port,()=>{
    console.log("app is listenini on 8080 port")
})




app.use((err, req, res, next) => {
    let a=err instanceof Expresserror
    let { status = 500, message = "Something went wrong" } = err;
    // res.status(status).send(message);
    res.render("error.ejs",{message})
});
