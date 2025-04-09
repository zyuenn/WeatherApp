const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Handles weather requests for a specific city
router.get("/", async (req, res) => {
    // Get city name from query parameters
  const cityName = req.query.cityName || "Vancouver"; // Default city
  const stateCode = req.query.stateCode || ""; // Optional
  const countryCode = req.query.countryCode || "";

  // Return error if city name is not provided
  if (!cityName) return res.status(400).json({ error: "City is required" });

  try {
    // 1. Get coordinates from city name using OpenWeatherMap API
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&appid=${WEATHER_API_KEY}`,
    );
    const geoData = await response.json();

    // Check if geoData is empty
    if (!geoData.length)
      return res.status(404).json({ error: "City not found" });

    const { lat, lon } = geoData[0];
    console.log(`Coordinates for ${cityName}: lat=${lat}, lon=${lon}`);

    // 2. Get weather data using coordinates
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`,
    );
    const weatherData = await weatherRes.json();

    // Send weather data as response
    res.json(weatherData);
  } catch (err) {
    console.error("Weather API error:", err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Export router so it can be mounted in server.js
module.exports = router;
