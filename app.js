require("dotenv").config()
const express = require('express')
const app = express()
const mongoose = require("mongoose")
const path = require("path")
const methodoverride = require("method-override")
const ejsmate = require("ejs-mate")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")

// Import models and utils
const Listing = require("./models/listing")
const Review = require("./models/review")
const User = require("./models/user")
const Expresserror = require("./utils/Expresserror")
const { listingSchema, reviewSchema } = require("./schema.js")

// Import routes
const listingsRouters = require("./routes/listing.js")
const reviewsRouters = require("./routes/review.js")
const userRouter = require("./routes/user.js")

// Port configuration
const port = process.env.PORT || 8000

// Database URL
const dburl = process.env.ATLAS_DB

// Check if required environment variables are set
if (!dburl) {
    console.error("ERROR: ATLAS_DB environment variable is not set");
    process.exit(1);
}

if (!process.env.SECRET) {
    console.error("ERROR: SECRET environment variable is not set");
    process.exit(1);
}

// MongoDB connection
async function main() {
    try {
        await mongoose.connect(dburl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to DB successfully");
    } catch (err) {
        console.log("MongoDB connection error:", err);
        process.exit(1);
    }
}

main().catch(err => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
});

// Session store configuration - FIXED for connect-mongo v4+
let sessionStore;
try {
    sessionStore = MongoStore.create({
        mongoUrl: dburl,
        crypto: {
            secret: process.env.SECRET
        },
        touchAfter: 24 * 3600 // time period in seconds
    });

    sessionStore.on("error", function(e) {
        console.log("SESSION STORE ERROR:", e);
    });
} catch (err) {
    console.error("Error creating session store:", err);
    process.exit(1);
}

const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true for production with HTTPS
        sameSite: "lax"
    }
}

// View engine setup
app.engine("ejs", ejsmate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Middleware
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodoverride("_method"))

// Session and flash middleware - ORDER MATTERS!
app.use(session(sessionOptions))
app.use(flash())

// Passport configuration
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Global middleware for flash messages and current user
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
app.use("/listings", listingsRouters)
app.use("/listings/:id/reviews", reviewsRouters)
app.use("/", userRouter)

// Home route
app.get("/", (req, res) => {
    res.redirect("/listings");
})

// 404 handler
app.use((req, res, next) => {
    next(new Expresserror(404, "Page not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    console.error("Error:", err);
    res.status(status).render("error.ejs", { message });
});

// Start server
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});