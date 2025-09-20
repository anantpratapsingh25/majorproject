const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: String,
    description: String,
    image: {
        url: {
            type: String,
            default: "https://example.com/default.jpg",
            set: v => v === "" ? "https://example.com/default.jpg" : v
        },
        filename: String
    },
    price: Number,
    location: String,
    country: String,

    // ✅ Geometry field for storing coordinates (lng, lat)
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [77.2090, 28.6139] // fallback Delhi
        }
    },

    // ✅ Reviews array
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],

    // ✅ Owner of the listing
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

// ✅ Cascade delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

module.exports = mongoose.model("Listing", listingSchema);
