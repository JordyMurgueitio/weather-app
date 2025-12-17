@ -1,180 +0,0 @@
# 🌤️ Advanced Weather App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white&style=for-the-badge)

A modern, responsive weather application built with vanilla JavaScript, featuring real-time weather data, 5-day forecasts, intelligent caching, and Progressive Web App capabilities.

## Features

### Core Functionality

- **Real-time Weather Data**: Current weather conditions for any city worldwide
- **5-Day Weather Forecast**: Detailed daily predictions with temperature highs/lows
- **Geolocation Support**: Automatic weather detection based on user location
- **Unit Conversion**: Toggle between Celsius/Fahrenheit and metric/imperial units

### Features

- **Intelligent Caching**: 10-minute cache system to reduce API calls and improve performance
- **Recent Searches**: Local storage of last 5 searched cities for quick access
- **Loading States**: Smooth loading animations and user feedback
- **Error Handling**: Comprehensive network error handling with retry functionality
- **Progressive Web App (PWA)**: Installable app with offline capabilities

## 🚀 Live Demo

[View Live Demo](https://your-weather-app-url.com) (Update with your deployment URL)

## 📱 Screenshots

![Weather App Desktop](assets/readme-screenshot.png)
_Desktop view showing current weather and forecast_

![Weather App Mobile](assets/readme-screenshot2.png)
_Mobile responsive design_

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: OpenWeatherMap API
- **Storage**: LocalStorage, Cache API
- **PWA**: Service Workers, Web App Manifest
- **Build Tools**: Live Server (for development)
- **Version Control**: Git

## Run the application**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`

## API Reference

This app uses the OpenWeatherMap API:

- Current Weather Data API
- 5 Day Weather Forecast API
- Geocoding API for location services

## Project Structure

```
weather-app/
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── script.js           # Main application logic
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline functionality
├── package.json       # Dependencies and scripts
├── assets/            # Images and icons
│   ├── weather icons/
│   └── background images/
└── README.md          # Project documentation
```




---

_Built with ❤️ and modern web technologies_
