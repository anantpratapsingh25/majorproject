const Listing = require("../models/listing");
const Review = require("../models/review");

// Add a review
module.exports.addReview = async (req, res) => {
  const { id } = req.params; // Listing ID
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newReview = new Review({
    comment: req.body.review.comment,
    rating: req.body.review.rating,
    author: req.user._id
  });

  await newReview.save();
  listing.reviews.push(newReview._id);
  await listing.save();

  req.flash("success", "⭐ Review added!");
  res.redirect(`/listings/${listing._id}`);
};

// Delete a review
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  req.flash("success", "❌ Review deleted!");
  res.redirect(`/listings/${id}`);
};
