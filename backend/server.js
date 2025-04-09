const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const port = process.env.port; // Port that the server will run on
const app = express(); // Create an Express app

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connected");
});

// Serve static frontend files

// Serve frontend app from /frontend
app.use(express.static(path.join(__dirname, "../frontend")));
// Server node_modules from /node_modules
app.use(
  "/node_modules",
  express.static(path.join(__dirname, "../node_modules")),
);
// Serve assests from /public
app.use(express.static(path.join(__dirname, "../public")));


// Routes setup
const locationRoutes = require("./routes/locations");
app.use("/api/locations", locationRoutes);

const weatherRouter = require("./routes/weather");
app.use("/api/weather", weatherRouter);

// All other routes return to frontend index.html
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
