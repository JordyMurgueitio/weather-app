const API_KEY = 'ba54bb9c3687f85898cfa1521e635e64';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather?q=Berlin&appid=ba54bb9c3687f85898cfa1521e635e64&units=metric';


function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('City not found');
            return response.json();
        });
}

// Example usage:
getWeather('London')
    .then(data => console.log(data))
    .catch(error => console.error(error));
