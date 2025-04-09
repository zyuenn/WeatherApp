const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/location.js");

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data to add
const locations = [
  { city: "Toronto", countryCode: "CA", createdAt: new Date() },
  { city: "London", countryCode: "GB", createdAt: new Date() },
  { city: "New York", countryCode: "US", createdAt: new Date() },
  { city: "Tokyo", countryCode: "JP", createdAt: new Date() },
  { city: "Sydney", countryCode: "AU", createdAt: new Date() },
  { city: "Cape Town", countryCode: "ZA", createdAt: new Date() },
];

// Insert sample data into the database
// Note: This will add duplicates if you run it multiple times
User.insertMany(locations).then(() => {
  console.log("Test locations added");
  mongoose.disconnect();
});
