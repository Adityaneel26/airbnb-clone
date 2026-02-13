require("dotenv").config();
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodoverride = require("method-override");
const ejsmate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Import models and utils
const Listing = require("./models/listing");
const Review = require("./models/review");
const User = require("./models/user");
const Expresserror = require("./utils/Expresserror");

// Import routes
const listingsRouters = require("./routes/listing.js");
const reviewsRouters = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Port configuration
const port = process.env.PORT || 8000;

// Database URL
const dburl = process.env.ATLAS_DB;

// Check if required environment variables are set
if (!dburl) {
    console.error("ERROR: ATLAS_DB environment variable is not set");
    process.exit(1);
}

if (!process.env.SECRET) {
    console.error("ERROR: SECRET environment variable is not set");
    process.exit(1);
}

// MongoDB connection - REMOVED deprecated options
async function main() {
    try {
        await mongoose.connect(dburl);
        console.log("Connected to DB successfully");
        return true;
    } catch (err) {
        console.log("MongoDB connection error:", err);
        return false;
    }
}

// Initialize MongoDB connection before starting server
async function initializeApp() {
    const dbConnected = await main();
    
    if (!dbConnected) {
        console.error("Failed to connect to database. Exiting...");
        process.exit(1);
    }

    // Session store configuration - FIXED for connect-mongo
    let sessionStore;
    
    try {
        // Try to use MongoDB session store
        const MongoStore = require("connect-mongo");
        console.log("MongoStore loaded successfully");
        
        sessionStore = MongoStore.create({
            mongoUrl: dburl,
            crypto: {
                secret: process.env.SECRET
            },
            touchAfter: 24 * 3600,
            collectionName: 'sessions' // Add explicit collection name
        });

        sessionStore.on("error", function(e) {
            console.log("SESSION STORE ERROR:", e);
        });
        
        console.log("Using MongoDB session store");
    } catch (err) {
        console.error("Error creating MongoDB session store:", err);
        console.log("Using MemoryStore as fallback");
        sessionStore = new session.MemoryStore();
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
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        }
    };

    // View engine setup
    app.engine("ejs", ejsmate);
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    // Middleware
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(methodoverride("_method"));

    // Session and flash middleware
    app.use(session(sessionOptions));
    app.use(flash());

    // Passport configuration
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // Global middleware for flash messages and current user
    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
    });

    // Routes
    app.use("/listings", listingsRouters);
    app.use("/listings/:id/reviews", reviewsRouters);
    app.use("/", userRouter);

    // Home route
    app.get("/", (req, res) => {
        res.redirect("/listings");
    });

    // Health check endpoint for Render
    app.get("/health", (req, res) => {
        res.status(200).send("OK");
    });

    // 404 handler
    app.use((req, res, next) => {
        next(new Expresserror(404, "Page not found"));
    });

    // Error handling middleware - FIXED to prevent header issues
    app.use((err, req, res, next) => {
        let { status = 500, message = "Something went wrong" } = err;
        
        // Log error for debugging
        console.error("Error:", {
            status,
            message,
            stack: err.stack,
            url: req.url,
            method: req.method
        });

        // Check if headers already sent
        if (res.headersSent) {
            return next(err);
        }

        // Set status and render error page
        res.status(status);
        
        // Try to render error page, fallback to JSON if template fails
        try {
            res.render("error.ejs", { message });
        } catch (renderErr) {
            console.error("Error rendering error page:", renderErr);
            res.json({ 
                error: message,
                status: status 
            });
        }
    });

    // Start server
    app.listen(port, '0.0.0.0', () => {
        console.log(`App is listening on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Server is ready to accept connections`);
    });
}

// Start the application
initializeApp().catch(err => {
    console.error("Failed to initialize app:", err);
    process.exit(1);
});