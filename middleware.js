const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in to access that page.");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "❌ You don't have permission to do that");
        return res.redirect("/listings/" + id);
    }

    // ✅ Only check → do not update or redirect here
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect("/listings/" + id);
    }

    // ❌ If the current user is NOT the author → block them
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "❌ You don't have permission to do that");
        return res.redirect("/listings/" + id);
    }

    // ✅ If they are the author, allow delete
    next();
};
