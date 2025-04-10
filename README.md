# 3D Weather App

**Weather** is a weather visualizer that uses  **Three.js**, **Express**, and **MongoDB** to render 3D scenes based on real-time weather data from the **OpenWeather API**. Users can explore the weather around the world, with the option to save locations as they go! It features animated skies, sunlight/sunset transitions, a interactive camera, and a beautiful terrain.

![screenshot](https://github.com/user-attachments/assets/a99b115b-e8fc-46f4-83a6-fde0ee101d00)
![rainWeather](https://github.com/user-attachments/assets/319731eb-3c90-48c8-9d93-d0195c36f558)



## Installation

### Prerequisites

Ensure that you have have **Node.js** and **npm** installed. You can use `nvm` (Node Version Manager) for setup:

```bash
node -v         # Check if Node is installed
npm -v          # Check if npm is installed

# Optional setup using NVM:
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
nvm install node
```

1. **Clone this repository:**

```bash
git clone https://github.com/zyuenn/WeatherApp.git
cd Weather
```

2. **Install dependencies**

```bash
npm install
```

3. **Add the environment variables**

Create a `.env` file in the `/backend` folder

```bash
WEATHER_API_KEY=your_openweathermap_api_key
ATLAS_URI=your_mongodb_connection_string
PORT=3001
```

4. **Optional: Run the database with sample locations**

```bash
cd backend
node addLocations.js
```

5. **Start the server**

```bash
cd backend
node server.js
```
Visit the app: http://localhost:3001
