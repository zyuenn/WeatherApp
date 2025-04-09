import * as THREE from "/node_modules/three/build/three.module.js";

import {
  initScene,
  getSceneComponents,
  setScene,
} from "./sceneManager.js";
import {
  applyWeatherMain,
  applyWeatherTemperature,
  applySun,
  applyRain,
  animateClouds,
  animateRain,
} from "./weatherVisuals.js";

// Initialize the scene
const canvas = document.getElementById("canvas");
initScene(canvas);

// Access scene components
const { scene, camera, renderer, controls } = getSceneComponents();

let selectedCity = null; // Holds the city selected from suggestions

// City Search
// This function listens for input events on the city search field and fetches
// city suggestions from the server. It updates the suggestion box with the
// fetched cities. When a city is selected, it updates the selectedCity variable
// and clears the suggestion box.
document.getElementById("citySearch").addEventListener(
  "input",
  async function (e) {
    const query = e.target.value.trim();
    const suggestionBox = document.getElementById("citySuggestions");
    suggestionBox.innerHTML = "";

    if (query.length < 2) return;

    // Fetch city suggestions from the server
    const res = await fetch(`/api/locations/search?q=${query}`);
    const cities = await res.json();

    // Display suggested cities
    cities.forEach((city) => {
      const btn = document.createElement("button");
      btn.textContent = `${city.name}, ${city.state || ""}, ${city.country}`;
      btn.onclick = () => {
        selectedCity = city;
        document.getElementById("citySearch").value =
          `${city.name}, ${city.country}`;
        suggestionBox.innerHTML = "";
      };
      suggestionBox.appendChild(btn);
    });
  },
  300,
);

// Load saved locations
// This function fetches saved locations from the server and displays them
// in the savedLocationsList. Each location has a "view" button to update the
// weather scene and a "del" button to delete the location.
async function loadSavedLocations() {
  const res = await fetch("/api/locations");
  const locations = await res.json();

  const list = document.getElementById("savedLocationsList");
  list.innerHTML = "";

  // For each saved location, add it to savedLocationsList
  locations.forEach((loc) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <p id="text-block">${loc.city}, ${loc.countryCode}</p>
      <div id="location-buttons">
      <button onclick="updateWeatherScene('${loc.city}', '', '${loc.countryCode}')">view</button>
      <button onclick="deleteSavedLocation('${loc._id}')">del</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Save a selected city
// This function saves the selected city to the server when the "Save Location"
// button is clicked. It sends a POST request with the city name and country code.
// If the request is successful, it reloads the saved locations.
// If no city is selected, it alerts the user to select a city.
document
  .getElementById("saveLocationBtn")
  .addEventListener("click", async () => {
    if (!selectedCity) {
      alert("Please select a city from the suggestions.");
      return;
    }

    const { name, country } = selectedCity;

    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: name, countryCode: country }),
    });

    if (res.ok) {
      alert("Location saved!");
      document.getElementById("citySearch").value = "";
      selectedCity = null;
      loadSavedLocations();
    } else {
      alert("Failed to save location.");
    }
  });

// Delete a saved location
// This function deletes a saved location from the server when the "del" button
// is clicked. It sends a DELETE request with the location ID. 
async function deleteSavedLocation(id) {
  await fetch(`/api/locations/${id}`, { method: "DELETE" });
  loadSavedLocations(); // reload list
}

// Fetch weather and update the scene
// This function fetches weather data for a given city and updates the scene
// with the current weather conditions. It uses the OpenWeatherMap API to get the weather data.
async function updateWeatherScene(cityName, stateCode, countryCode) {
  try {
    const res = await fetch(
      `/api/weather?cityName=${cityName}&stateCode=${stateCode}&countryCode=${countryCode}`,
    );
    const current = await res.json();

    // console.log("Current weather data:", current);

    // Format UTC timestamp to HH:MM
    var date = new Date(current.dt * 1000); // Convert seconds to milliseconds
    var hours = "0" + date.getHours();
    var minutes = "0" + date.getMinutes();
    var formattedTime = hours.substr(-2) + ":" + minutes.substr(-2); // Format time as HH:MM

    // Get weather data
    const mainData = current.weather[0].main;
    const temp = current.main.temp;
    const dt = current.dt;
    const sunrise = current.sys.sunrise;
    const sunset = current.sys.sunset;

    // Update HTML elements with weather data
    document.getElementById("location").textContent =
      cityName + ", " + current.sys.country;
    document.getElementById("temperature").textContent = temp + "°C";
    document.getElementById("condition").textContent =
      current.weather[0].description;
    document.getElementById("feelsLike").textContent =
      "feels like " + current.main.feels_like + "°C";
    document.getElementById("local").textContent = formattedTime;

    // Update scene with weather data
    applyWeatherMain(mainData, scene);
    applyWeatherTemperature(temp, scene);
    applySun(dt, sunrise, sunset, scene);
    setScene(scene);

    console.log("Scene updated with weather data.");
  } catch (err) {
    console.error("Error fetching weather:", err);
  }
}

// Expose functions to the global scope for use in HTML buttons
window.updateWeatherScene = updateWeatherScene;
window.deleteSavedLocation = deleteSavedLocation;

// Load locations when page loads
window.addEventListener("DOMContentLoaded", () => {
  loadSavedLocations();
});

// Animation loop
// This function creates an animation loop that updates the scene and
// renders it continuously. It uses requestAnimationFrame for smooth animation.
// It also updates the controls for camera movement.
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  animateClouds(scene, deltaTime);
  animateRain(deltaTime);

  controls.update(); //orbit controls
  renderer.render(scene, camera);
}
animate();