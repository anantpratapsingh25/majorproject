const express = require("express");
const router = express.Router();
const wrap = require("../utils/wrap.js");
const { isLoggedIn, isOwner, isReviewAuthor } = require("../middleware.js");
const listingController = require("../controller/listing.js");
const reviewsController = require("../controller/review.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");  // ✅ Cloudinary storage
const upload = multer({ storage });

// Listing routes
router.route("/")
  .get(wrap(listingController.showAllListings))
  .post(isLoggedIn, upload.single("image"), wrap(listingController.createListing));

// New listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show single listing
router.get("/:id", wrap(listingController.showListing));

// Edit form
router.get("/:id/edit", isLoggedIn, isOwner, wrap(listingController.renderEditForm));

// Update listing
router.put("/:id", isLoggedIn, isOwner,upload.single("image"),  wrap(listingController.updateListing));

// Delete listing
router.delete("/:id", isLoggedIn, isOwner, wrap(listingController.deleteListing));

// Review routes (nested under listings)
router.post("/:id/reviews", isLoggedIn, wrap(reviewsController.addReview));
router.delete("/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor, wrap(reviewsController.deleteReview));

module.exports = router;
