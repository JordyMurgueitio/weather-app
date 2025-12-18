const API_KEY = 'ba54bb9c3687f85898cfa1521e635e64';
const weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
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
const loadingSpinner = document.getElementById('loading-spinner');
const forecastSection = document.getElementById('forecast-section');
const forecastContainer = document.getElementById('forecast-container');
const recentSearchesSection = document.getElementById('recent-searches');
const recentSearchesContainer = document.getElementById('recent-searches-container');
const weatherAlertsSection = document.getElementById('weather-alerts');
const alertsContainer = document.getElementById('alerts-container');
const pressureElement = document.getElementById('pressure');
const visibilityElement = document.getElementById('visibility');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');


// CONSTANTS
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const MAX_RECENT_SEARCHES = 5;

// STATE VARIABLES
let currentUnit = 'metric'; // default
let lastSearchedCity = ''; // updates after each search
let lastSearchType = 'city';
let lastCoords = { lat: null, lon: null }; // stores last known coordinates
let weatherCache = new Map(); // Cache for weather data
let forecastCache = new Map(); // Cache for forecast data

// UTILITY FUNCTIONS

// Function to show/hide loading spinner
const showLoading = () => {
    loadingSpinner.removeAttribute('hidden');
    weatherApp.setAttribute('hidden', true);
    forecastSection.setAttribute('hidden', true);
    errorMessage.style.display = 'none';
};

const hideLoading = () => {
    loadingSpinner.setAttribute('hidden', true);
};

// Function to check cache validity
const isCacheValid = (timestamp) => {
    return Date.now() - timestamp < CACHE_DURATION;
};

// Function to get cached data
const getCachedData = (key, cache) => {
    const cached = cache.get(key);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }
    return null;
};

// Function to set cached data
const setCachedData = (key, data, cache) => {
    cache.set(key, {
        data: data,
        timestamp: Date.now()
    });
};

// Function to save recent search to localStorage
const saveRecentSearch = (cityName) => {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recentSearches = recentSearches.filter(search => search.toLowerCase() !== cityName.toLowerCase());
    recentSearches.unshift(cityName);
    recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    displayRecentSearches();
};

// Function to display recent searches
const displayRecentSearches = () => {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (recentSearches.length > 0) {
        recentSearchesContainer.innerHTML = '';
        recentSearches.forEach(city => {
            const searchItem = document.createElement('button');
            searchItem.className = 'recent-search-item';
            searchItem.textContent = city;
            searchItem.addEventListener('click', () => {
                searchInput.value = city;
                searchButton.click();
            });
            recentSearchesContainer.appendChild(searchItem);
        });
        recentSearchesSection.removeAttribute('hidden');
    }
};

// Function to fetch weather data based on city name
const getWeather = async (city) => {
    showLoading();
    
    const cacheKey = `${city}-${currentUnit}`;
    const cachedWeather = getCachedData(cacheKey, weatherCache);
    
    if (cachedWeather) {
        updateUI(cachedWeather);
        hideLoading();
        getForecast(city);
        saveRecentSearch(city);
        return;
    }
    
    const requestParams = `?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
    const urlToFetch = `${weatherBaseUrl}${requestParams}`;
    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const weatherData = await response.json();
            setCachedData(cacheKey, weatherData, weatherCache);
            updateUI(weatherData);
            errorMessage.style.display = 'none';
            weatherApp.removeAttribute('hidden'); 
            hideLoading();
            getForecast(city);
            saveRecentSearch(city);
        } else {
            throw new Error('City not found');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        const errorMessages = {
            'City not found': '🌍 City not found. Try checking the spelling or use a different city name.',
            'Network error': '📡 Connection issue. Please check your internet and try again.',
        };
        errorMessage.textContent = error.message === 'City not found' 
            ? errorMessages['City not found']
            : errorMessages['Network error'];
        errorMessage.style.display = 'block';
        weatherApp.setAttribute('hidden', true);
        forecastSection.setAttribute('hidden', true);
        hideLoading();
    }
};

// Function to fetch 5-day forecast
const getForecast = async (city) => {
    const cacheKey = `forecast-${city}-${currentUnit}`;
    const cachedForecast = getCachedData(cacheKey, forecastCache);
    
    if (cachedForecast) {
        displayForecast(cachedForecast);
        return;
    }
    
    const requestParams = `?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
    const urlToFetch = `${forecastBaseUrl}${requestParams}`;
    
    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const forecastData = await response.json();
            setCachedData(cacheKey, forecastData, forecastCache);
            displayForecast(forecastData);
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
};

// Function to display 5-day forecast
const displayForecast = (forecastData) => {
    forecastContainer.innerHTML = '';
    
    // Group forecasts by day (taking one forecast per day around noon)
    const dailyForecasts = [];
    const processedDates = new Set();
    
    forecastData.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toDateString();
        
        if (!processedDates.has(dateString) && dailyForecasts.length < 5) {
            // Try to get forecast around noon (12:00) or the first available for the day
            if (date.getHours() >= 12 || !processedDates.has(dateString)) {
                dailyForecasts.push(forecast);
                processedDates.add(dateString);
            }
        }
    });
    
    dailyForecasts.forEach((forecast, index) => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.style.animationDelay = `${index * 0.1}s`;
        
        const date = new Date(forecast.dt * 1000);
        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconCode = forecast.weather[0].icon;
        const customIcon = iconMap[iconCode] || `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="${customIcon}" alt="${forecast.weather[0].description}" class="forecast-icon">
            <div class="forecast-temps">
                <span class="forecast-high">${Math.round(forecast.main.temp_max)}°</span>
                <span class="forecast-low">${Math.round(forecast.main.temp_min)}°</span>
            </div>
            <div class="forecast-desc">${forecast.weather[0].main}</div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
    
    forecastSection.removeAttribute('hidden');
};

// Function to fetch weather data based on geolocation
const getWeatherByCoords = async (lat, lon) => {
    showLoading();
    
    const cacheKey = `${lat}-${lon}-${currentUnit}`;
    const cachedWeather = getCachedData(cacheKey, weatherCache);
    
    if (cachedWeather) {
        updateUI(cachedWeather);
        hideLoading();
        getForecastByCoords(lat, lon);
        return;
    }
    
    const requestParams = `?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
    const urlToFetch = `${weatherBaseUrl}${requestParams}`;
    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const weatherData = await response.json();
            setCachedData(cacheKey, weatherData, weatherCache);
            updateUI(weatherData);
            errorMessage.style.display = 'none';
            weatherApp.removeAttribute('hidden');
            hideLoading();
            getForecastByCoords(lat, lon);
        } else {
            throw new Error('Location weather not found');
        }
    } catch (error) {
        console.error('Geolocation fetch error:', error);
        errorMessage.textContent = '📍 Unable to fetch weather for your location. Please try again or search manually.';
        errorMessage.style.display = 'block';
        weatherApp.setAttribute('hidden', true);
        forecastSection.setAttribute('hidden', true);
        hideLoading();
    }
};

// Function to fetch forecast by coordinates
const getForecastByCoords = async (lat, lon) => {
    const cacheKey = `forecast-${lat}-${lon}-${currentUnit}`;
    const cachedForecast = getCachedData(cacheKey, forecastCache);
    
    if (cachedForecast) {
        displayForecast(cachedForecast);
        return;
    }
    
    const requestParams = `?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
    const urlToFetch = `${forecastBaseUrl}${requestParams}`;
    
    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const forecastData = await response.json();
            setCachedData(cacheKey, forecastData, forecastCache);
            displayForecast(forecastData);
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
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
        'clouds': isNight ? './assets/clouds-night-bg.jpg' : './assets/clouds-bg.jpg',
        'rain': isNight ? './assets/rain-night-bg.jpg' : './assets/rain-bg.jpg',
        'thunderstorm': isNight ? './assets/thunderstorm-night-bg.jpg' : './assets/thunderstorm-day-bg.jpg',
        'snow': isNight ? './assets/snow-night-bg.jpg' : './assets/snow-bg.jpg',
        'drizzle': isNight ? './assets/rain-night-bg.jpg' : './assets/rain-bg.jpg',
        'mist': './assets/mist-bg.jpg',
        'haze': './assets/haze-bg.jpg',
        'fog': './assets/fog-bg.jpg',
        'smoke': './assets/fog-bg.jpg',
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

// Function to format sunrise/sunset times
const formatTime = (timestamp, timezoneOffset) => {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};
// Function to refetch weather data based on last search type
const refetchWeather = () => {
    if (lastSearchedCity && lastSearchType === 'city') {
        getWeather(lastSearchedCity);
    } else if (lastCoords.lat && lastCoords.lon && lastSearchType === 'coords') {
        getWeatherByCoords(lastCoords.lat, lastCoords.lon);
    }
};

// Function to update the UI with fetched weather data
const updateUI = (weatherData) => {
    lastSearchedCity = weatherData.name;
    lastSearchType = 'city';
    
    cityName.textContent = `${weatherData.name}, ${weatherData.sys.country}`;
    updateLocalTime(weatherData.timezone);
    temperature.textContent = Math.round(weatherData.main.temp);
    weatherDescription.textContent = weatherData.weather[0].main;
    feelsLike.textContent = Math.round(weatherData.main.feels_like * 10) / 10;
    minTemperature.textContent = Math.round(weatherData.main.temp_min * 10) / 10;
    maxTemperature.textContent = Math.round(weatherData.main.temp_max * 10) / 10;
    humidity.textContent = weatherData.main.humidity;
    windSpeed.textContent = Math.round(weatherData.wind.speed);
    
    // New fields
    pressureElement.textContent = weatherData.main.pressure;
    visibilityElement.textContent = (weatherData.visibility / 1000).toFixed(1);
    sunriseElement.textContent = formatTime(weatherData.sys.sunrise, weatherData.timezone);
    sunsetElement.textContent = formatTime(weatherData.sys.sunset, weatherData.timezone);
    
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
        errorMessage.textContent = '✍️ Please enter a city name to search.';
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
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
            errorMessage.textContent = '📍 Location access denied. Please enable location services or search manually.';
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 4000);
        });
    } else {
        errorMessage.textContent = '🚫 Geolocation is not supported by your browser.';
        errorMessage.style.display = 'block';
    }
});

toggleUnitButton.addEventListener('click', () => {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    refetchWeather(); // Refetch weather data with the new unit
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    displayRecentSearches();
});