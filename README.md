# Google OAuth 2.0 Authentication with Passport.js

## 🚀 Project Overview

This project implements Google OAuth 2.0 login using **Express.js**, **Passport.js**, **MongoDB**, and **EJS** as the templating engine.

---

## 🔥 Setup Instructions

### 1. Create a Google Cloud Project

- Visit [Google Cloud Console](https://console.cloud.google.com/).
- Create a new project.
- Go to **OAuth consent screen** → Configure it (choose **External**).
- Add Application details (name, support email, etc.).
- Create **OAuth 2.0 Credentials**:

  - Application type: **Web Application**
  - Authorized Redirect URI:
    ```
    http://localhost:3000/auth/google/redirect
    ```

- Save the **Client ID** and **Client Secret**.

---

### 2. Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd <your-project-folder>
npm install
```

---

### 3. Environment Variables Setup (`config/keys.js`)

```javascript
module.exports = {
  google: {
    clientID: "<YOUR_GOOGLE_CLIENT_ID>",
    clientSecret: "<YOUR_GOOGLE_CLIENT_SECRET>",
  },
  session: {
    cookieKey: "<A_RANDOM_COOKIE_KEY>",
  },
};
```

---

### 4. Passport Setup (`config/passport-setup.js`)

```javascript
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./keys");
const User = require("../models/User"); // Your mongoose User model

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        done(null, existingUser);
      } else {
        const newUser = await new User({
          username: profile.displayName,
          googleId: profile.id,
        }).save();
        done(null, newUser);
      }
    }
  )
);
```

---

### 5. Server Setup (`app.js`)

```javascript
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const authRoutes = require("./routes/auth.routes");
require("./config/passport-setup")();

const app = express();

// Connect to MongoDB
mongoose
  .connect("<YOUR_MONGODB_URI>")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Set view engine
app.set("view engine", "ejs");

// Session middleware
app.use(
  session({
    secret: keys.session.cookieKey,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

---

### 6. Authentication Routes (`routes/auth.routes.js`)

```javascript
const express = require("express");
const passport = require("passport");
const router = express.Router();

// Logout Route
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Auth with Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Callback route for Google to redirect to
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.redirect("/dashboard");
});

module.exports = router;
```

---

## ✨ Key Features

- Login with Google account
- Session handling with `express-session`
- MongoDB user storage
- Clean and simple folder structure
- EJS rendering engine

---

## 📁 Folder Structure

```
|-- config
|   |-- keys.js
|   |-- passport-setup.js
|-- models
|   |-- User.js
|-- routes
|   |-- auth.routes.js
|-- views
|   |-- home.ejs
|-- app.js
|-- package.json
|-- README.md
```

---

## 💻 Tech Stack

- Express.js
- Passport.js
- Google OAuth 2.0
- MongoDB (Mongoose)
- EJS (templating engine)

---

## 🚀 Run the Project

```bash
npm install
npm run dev
```

(Ensure MongoDB is running and Google OAuth credentials are correct.)

---
