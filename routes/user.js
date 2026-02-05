const express=require("express")
const router=express.Router({mergeParams:true});
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveredirect } = require("../middelwear.js");
const userController=require("../controllers/users.js")

router.route("/signup")
.get(userController.renderSignupform)
.post(wrapAsync(userController.singup))

router.route("/login")
.get(userController.renderLoginForm)
.post(saveredirect,passport.authenticate("local",{ failureRedirect : "/login",failureFlash:true}),userController.login)

router.get("/logout",userController.logout)
module.exports=router;