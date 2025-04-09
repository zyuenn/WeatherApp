const mongoose = require("mongoose");

// Define the schema for saved locations
const savedLocationSchema = new mongoose.Schema({
  city: String,
  countryCode: String,
  createdAt: { type: Date, default: Date.now },
});

// Create a model for saved locations
module.exports = mongoose.model("SavedLocation", savedLocationSchema);
