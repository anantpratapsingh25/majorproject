const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js"); // ✅ Go up one folder

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/stayease");
}

const initData = require("./data.js");   // ✅ use same name

async function initdb() {
    await Listing.deleteMany({});
    const dataWithOwner = initData.data.map((obj) => ({
        ...obj,
        owner: "68c390e2d5bc4e8cd23bbec2",
    }));
    await Listing.insertMany(dataWithOwner);
    console.log("✅ data is initialised");
}


main()
    .then(() => {
        console.log("working well");
        return initdb();
    })
    .catch(err => console.error(err));
