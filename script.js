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
const weatherIcon = document.getElementById('weather-icon');
const cityName = document.getElementById('city');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('description');
const feelsLike = document.getElementById('feels-like');
const minTemperature = document.getElementById('min-temp');
const maxTemperature = document.getElementById('max-temp');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');


const getWeather = async (city) => {
    const requestParams = `?q=${city}&appid=${API_KEY}&units=metric`;
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
        console.error('Error:', error);
        errorMessage.style.display = 'block';
        weatherApp.setAttribute('hidden', true);
    }
};

const updateUI = (weatherData) => {
    cityName.textContent = `${weatherData.name}, ${weatherData.sys.country}`;
    temperature.textContent = `${Math.round(weatherData.main.temp)}°C`;
    weatherDescription.textContent = weatherData.weather[0].main;
    feelsLike.textContent = `${Math.round(weatherData.main.feels_like)}°C`;
    minTemperature.textContent = `${Math.round(weatherData.main.temp_min)}°C`;
    maxTemperature.textContent = `${Math.round(weatherData.main.temp_max)}°C`;
    humidity.textContent = `${weatherData.main.humidity} %`;
    windSpeed.textContent = `${Math.round(weatherData.wind.speed)} m/s`;
    const iconCode = weatherData.weather[0].icon;
    const customIcon = iconMap[iconCode];
    if (customIcon) {
        weatherIcon.src = customIcon; // Use custom icon if available
    };
    weatherIcon.alt = weatherData.weather[0].description;
};



searchButton.addEventListener('click', () => {
    const city = searchInput.value;
    if (city !== '') {
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