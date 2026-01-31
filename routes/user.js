const express=require("express")
const router=express.Router({mergeParams:true});
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs")
})
router.post("/signup",wrapAsync(async(req,res)=>{
    try{
    let {username,email,password}=req.body;

    const newUser=new User({email,username})
    const reguser=await User.register(newUser,password)
    console.log(reguser)
    req.flash("success","user was register successfully")
    res.redirect("/listings")
}
catch(e){
        
            req.flash("error",e.message)
            res.redirect("/signup.ejs")
    }
}))

router.get("/login",(req,res)=>{
    res.render("users/login.ejs")
})

router.post("/login",passport.authenticate("local",{ failureRedirect : "/login",failureFlash:true}),async(req,res)=>{
    req.flash("success","welcome to wander lust you are save   ")
    res.redirect("/listings")
})

module.exports=router;