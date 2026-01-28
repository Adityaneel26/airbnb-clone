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
const flash=require("connect-flash")


const sessionOptions={
    secret:"mysupersessionsecret",
    resave:false,
    saveUninitialized:false
}
const passport=require("passport")
const LocalStratgy=require("passport-local")
const User=require("./models/user.js")


app.use(flash())
app.use(session(sessionOptions))
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
    await mongoose.connect(mongo_url)
}

// app.use((req, res, next) => {
//     next(new Expresserror(404, "Page not found"));
// });

app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    next()
})

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

app.get("/",(req,res)=>{
    res.send("hello this is root")
})
app.listen(port,()=>{
    console.log("app is listenini on 8080 port")
})




app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    // res.status(status).send(message);
    res.render("error.ejs",{message})
});
