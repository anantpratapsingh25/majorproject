const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveReturnTo } = require("../middleware.js");
const userController = require("../controller/user.js"); // Make sure path is correct

// Signup routes
router.get("/signup", userController.renderSignup);
router.post("/signup", userController.signup);

// Login routes
router.get("/login", userController.renderLogin);
router.post(
  "/login",
  saveReturnTo,
  passport.authenticate("local", {
    failureFlash: "❌ No user exists with that username or wrong password",
    failureRedirect: "/login",
  }),
  userController.login
);

// Logout route
router.get("/logout", userController.logout);

module.exports = router;
