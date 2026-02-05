const User=require("../models/user")


module.exports.renderSignupform=(req,res)=>{
    res.render("users/signup.ejs")
}
module.exports.singup=async(req,res)=>{
    try{
    let {username,email,password}=req.body;

    const newUser=new User({email,username})
    const reguser=await User.register(newUser,password)
    console.log(reguser)
    req.login(reguser,(err)=>{
        if(err){
            return next(err)
        }
         req.flash("success","user was register successfully")
    res.redirect("/listings")
})
}
   
catch(e){
        
            req.flash("error",e.message)
            res.redirect("/signup.ejs")
    }
}

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs")
}

module.exports.login=async(req,res)=>{
    req.flash("success","welcome to wander lust you are save   ")
    let redirectUrl=res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl)
}

module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err)
        }
        req.flash("success","you are logout Now")
        res.redirect("/listings")
    })
}