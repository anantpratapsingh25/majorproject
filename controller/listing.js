// controller/listing.js
const Listing = require("../models/listing");

// Show all listings
module.exports.showAllListings = async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot load listings");
    res.redirect("/");
  }
};

// Render form for new listing
module.exports.renderNewForm = (req, res) => {
  res.render("listings/form");
};

// Show single listing
module.exports.showListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
  }
};

// Create new listing
module.exports.createListing = async (req, res) => {
  try {
    const { title, description, price, location, country } = req.body;

    // 🌍 Get coordinates from MapTiler
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.MAPTILER_API_KEY}`
    );
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const geoData = await response.json();

    const newListing = new Listing({
      title,
      description,
      price,
      location,
      country,
      geometry: geoData.features[0]?.geometry || { type: "Point", coordinates: [0, 0] },
      owner: req.user._id
    });

    // 📸 Save image from Cloudinary
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error("🔥 ERROR in createListing:", err);
    req.flash("error", "Cannot create listing. Something went wrong.");
    res.redirect("/listings/new");
  }
};

// Render edit form
module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot load edit form");
    res.redirect("/listings");
  }
};

// Update listing
module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true, new: true });

    // 📸 Update image if new one uploaded
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
      await listing.save();
    }

    req.flash("success", "✅ Listing updated successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot update listing");
    res.redirect("/listings");
  }
};

// Delete listing
module.exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "🗑️ Listing deleted successfully!");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot delete listing");
    res.redirect("/listings");
  }
};
