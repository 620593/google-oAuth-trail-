const express = require("express");
const cookieSession = require("cookie-session");
const passport = require("passport");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const passportSetup = require("./config/passport-setup");
const connectDB = require("./config/db");
const keys = require("./config/keys");

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Set view engine
app.set("view engine", "ejs");

// 3. Setup cookie-session middleware
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    keys: [keys.session.cookieKey],
    secure: process.env.NODE_ENV === "production", // cookies only over HTTPS in production
    httpOnly: true, // cookie not accessible from JavaScript
  })
);

// 4. Patch for cookie-session to fix Passport expectations
app.use((req, res, next) => {
  if (req.session) {
    if (!req.session.regenerate) {
      req.session.regenerate = function (cb) {
        cb();
      };
    }
    if (!req.session.destroy) {
      req.session.destroy = function (cb) {
        req.session = null;
        cb();
      };
    }
    if (!req.session.save) {
      req.session.save = function (cb) {
        cb();
      };
    }
  }
  next();
});

// 5. Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 6. Setup Routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
// 7. Home Route
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

// 8. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
