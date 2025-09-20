const User = require("../models/user.js");
const passport = require("passport");

// Render signup form
module.exports.renderSignup = (req, res) => {
  res.render("users/signup");
};

// Handle signup
module.exports.signup = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "✅ Successfully signed up!");
      res.redirect(req.session.returnTo || "/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Render login form
module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

// Handle login
module.exports.login = (req, res) => {
  req.flash("success", "✅ Welcome back!");
  console.log("✅ Logged in user:", req.user);
  res.redirect(res.locals.returnTo || "/listings");
};

// Handle logout
module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "👋 Logged you out!");
    res.redirect("/listings");
  });
};
