if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const path = require("path");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const multer = require("multer");
const { storage } = require("./cloudConfig.js"); // make sure cloudConfig exports { storage }
const upload = multer({ storage });

// Routes
const userRoutes = require("./routes/user.js");
const listingsRoutes = require("./routes/listings.js");

const app = express();

// ============================
// Database Connection
// ============================
const dbUrl = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/your-db"; // fallback

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("✅ Connected to MongoDB Atlas");
    } catch (err) {
        console.error("❌ DB Connection Error:", err);
    }
}
main();

// ============================
// EJS Setup
// ============================
app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ============================
// Middlewares
// ============================
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ============================
// Session & Flash
// ============================
const mongoStore = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET || "supersecret"
    },
    touchAfter: 24 * 3600 // 1 day
});

mongoStore.on("error", (e) => {
    console.log("⚠️ Session Store Error:", e);
});

const sessionOptions = {
    store: mongoStore,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(expressSession(sessionOptions));
app.use(flash());

// ============================
// Passport Authentication
// ============================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ============================
// Global Middleware (locals)
// ============================
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// ============================
// Demo User Route (for testing)
// ============================
app.get("/demouser", async (req, res, next) => {
    try {
        let random = Math.floor(Math.random() * 10000);
        let user = new User({
            email: `anan${random}@mail.com`,
            username: `chuouser${random}`
        });
        let registerUser = await User.register(user, "demopassword");
        res.send(registerUser);
    } catch (err) {
        next(err);
    }
});

// ============================
// Routes
// ============================
app.use("/listings", listingsRoutes);
app.use("/", userRoutes);

// ============================
// Error Handler (last)
// ============================
app.use((err, req, res, next) => {
    console.error("🔥 ERROR:", err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).render("error", { err }); // ✅ use views/error.ejs instead of listings/error.ejs
});

// ============================
// Server Start
// ============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
