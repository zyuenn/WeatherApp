const express = require("express");
const router = express.Router();

// Import savedLocation mongoose model
const SavedLocation = require("../models/location.js");

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// GET /api/locations/search?q=city
// Searches for a city using OpenWeatherMap API
// Returns an array of locations matching the query
router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  try {
    const apiRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${WEATHER_API_KEY}`,
    );
    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    console.error("Geo search error:", err);
    res.status(500).json({ error: "Failed to search for city" });
  }
});

// Get all saved locations in the database
// Sorted by createdAt in descending order
router.get("/", async (req, res) => {
  const locations = await SavedLocation.find().sort({ createdAt: -1 });
  res.json(locations);
});

// Add a new location
router.post("/", async (req, res) => {
  const { city, countryCode } = req.body;
  if (!city || !countryCode)
    return res.status(400).json({ error: "City and countryCode required" });

  // Create a new SaveLocation instance
  const newLoc = new SavedLocation({ city, countryCode });
  await newLoc.save();
  // Return the saved location
  res.json(newLoc);
});

// Delete a location by ID
router.delete("/:id", async (req, res) => {
  await SavedLocation.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
