const API_KEY = 'ba54bb9c3687f85898cfa1521e635e64';
const weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';

/* Custom weather icons */
const iconMap  = {
    '01n': './assets/moon.png',
    '01d': './assets/sun.png',
    '02n': './assets/clouds-night.png',
    '02d': './assets/clouds-day.png',
    '03n': './assets/cloud.png',
    '03d': './assets/cloud.png',
    '04n': './assets/cloud.png',
    '04d': './assets/cloud.png',
    '09n': './assets/shower-rain.png',
    '09d': './assets/rain-day.png',
    '10n': './assets/heavy-rain.png',
    '10d': './assets/heavy-rain.png',
    '11n': './assets/thunderstorm.png',
    '11d': './assets/thunderstorm.png',
    '13n': './assets/snow.png',
    '13d': './assets/snow.png',
    '50d': './assets/fog.png',
    '50n': './assets/fog.png',
};


/* Selecting html elements */
const errorMessage = document.getElementById('error-message');
const weatherApp = document.getElementById('weather-app');
const searchInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const myLocationButton = document.getElementById('geo-location-button');
const weatherIcon = document.getElementById('weather-icon');
const cityName = document.getElementById('city');
const temperature = document.getElementById('temperature');
const toggleUnitButton = document.getElementById('unit-toggle');
const weatherDescription = document.getElementById('description');
const feelsLike = document.getElementById('feels-like');
const minTemperature = document.getElementById('min-temp');
const maxTemperature = document.getElementById('max-temp');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const degreeSymbols = document.querySelectorAll('.degree-symbol');
const speedSymbol = document.querySelector('.speed-symbol');


// STATE VARIABLES
let currentUnit = 'metric'; // default
let lastSearchedCity = ''; // updates after each search
let lastSearchType = 'city';
let lastCoords = { lat: null, lon: null }; // stores last known coordinates

// Function to fetch weather data based on city name
const getWeather = async (city) => {
    const requestParams = `?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
    const urlToFetch = `${weatherBaseUrl}${requestParams}`;
    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const weatherData = await response.json();
            updateUI(weatherData);
            errorMessage.style.display = 'none';
            weatherApp.removeAttribute('hidden'); 
        } else {
            errorMessage.style.display = 'block';
            weatherApp.setAttribute('hidden', true);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        errorMessage.style.display = 'block';
        weatherApp.setAttribute('hidden', true);
    }
};

// Function to fetch weather data based on geolocation
const getWeatherByCoords = async (lat, lon) => {
    const requestParams = `?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
    const urlToFetch = `${weatherBaseUrl}${requestParams}`;
    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const weatherData = await response.json();
            updateUI(weatherData);
            errorMessage.style.display = 'none';
            weatherApp.removeAttribute('hidden'); 
        } else {
            errorMessage.style.display = 'block';
            weatherApp.setAttribute('hidden', true);
        }
    } catch (error) {
        console.error('Geolocation fetch error:', error);
        errorMessage.style.display = 'block';
        weatherApp.setAttribute('hidden', true);
    }
};

// Function to update unit symbols based on the current unit
const updateUnitSymbols = () => {
    const degree = currentUnit === 'metric' ? '°C' : '°F';
    const speed = currentUnit === 'metric' ? 'm/s' : 'mph';
    degreeSymbols.forEach(symbol => {
        symbol.textContent = degree;
    });
    speedSymbol.textContent = speed;
    toggleUnitButton.innerHTML = currentUnit === 'metric' 
        ? '<span class="active">°C</span> | <span>°F</span>' 
        : '<span>°C</span> | <span class="active">°F</span>';
};


// function to update the background image depending on the weather condition
const setDynamicBackground = (condition, iconCode) => {
    const isNight = iconCode.endsWith('n');
    const backgroundMap = {
        'clear': isNight ? './assets/clear-night-bg.jpg' : './assets/clear-day-bg.jpg',
        'clouds': './assets/clouds-bg.jpg',
        'rain': './assets/rain-bg.jpg',
        'thunderstorm': './assets/thunderstorm-bg.jpg',
        'snow': './assets/snow-bg.jpg',
        'drizzle': './assets/rain-bg.jpg',
        'mist': './assets/haze-bg.jpg',
        'haze': './assets/haze-bg.jpg',
        'fog': './assets/haze-bg.jpg',
        'smoke': './assets/haze-bg.jpg',
    };
    const key = condition.toLowerCase();
    const backgroundImage = backgroundMap[key] || './assets/bg-image.jpg';
    document.querySelector('.content-wrapper').style.backgroundImage = `url(${backgroundImage})`;
};

// function to get the local time 
const updateLocalTime = (timezoneOffset) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const localTime = utc + timezoneOffset * 1000;
    const localDate = new Date(localTime);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    const timeString = localDate.toLocaleTimeString(undefined, options);
    document.getElementById('local-time').textContent = timeString;
};


// Function to update the UI with fetched weather data
const updateUI = (weatherData) => {
    cityName.textContent = `${weatherData.name}, ${weatherData.sys.country}`;
    updateLocalTime(weatherData.timezone);
    temperature.textContent = Math.round(weatherData.main.temp); // Round to one decimal place
    weatherDescription.textContent = weatherData.weather[0].main;
    feelsLike.textContent = Math.round(weatherData.main.feels_like * 10) / 10;
    minTemperature.textContent = Math.round(weatherData.main.temp_min * 10) / 10;
    maxTemperature.textContent = Math.round(weatherData.main.temp_max * 10) / 10;
    humidity.textContent = weatherData.main.humidity;
    windSpeed.textContent = Math.round(weatherData.wind.speed);
    const iconCode = weatherData.weather[0].icon;
    const customIcon = iconMap[iconCode];
    if (customIcon) {
        weatherIcon.src = customIcon; 
    };
    weatherIcon.alt = weatherData.weather[0].description;
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    setDynamicBackground(weatherCondition, iconCode);
    updateUnitSymbols(); // Update unit symbols based on current unit
};


/* EVENT LISTENERS */
searchButton.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city !== '') {
        lastSearchedCity = city; // Update last searched city
        lastSearchType = 'city'; // Update last search type
        getWeather(city);
        searchInput.value = ''; // Clear the input field after search
    } else {
        console.log('Please enter a city name');
    };
    errorMessage.style.display = 'none'; // Hide error message on new search
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});

myLocationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            lastCoords = { lat, lon }; // Update last known coordinates
            lastSearchType = 'coords'; // Update last search type
            getWeatherByCoords(lat, lon);
        }, (error) => {
            console.error('Geolocation error:', error.message);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
});

const refetchWeather = () => {
    if (lastSearchedCity && lastSearchType === 'city') {
        getWeather(lastSearchedCity);
    } else if (lastCoords.lat && lastCoords.lon && lastSearchType === 'coords') {
        getWeatherByCoords(lastCoords.lat, lastCoords.lon);
    }
};

toggleUnitButton.addEventListener('click', () => {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    refetchWeather(); // Refetch weather data with the new unit
});