// API Config
const API_KEY = '1947240aeb2dc29e5e3567bc5b90dc64';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Get elements
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

// Show welcome message
document.getElementById("weather-display").innerHTML = `
    <div class="welcome-message">
        <h2>🌤️ Weather Dashboard</h2>
        <p>Enter a city name above to check the current weather.</p>
    </div>
`;

// 🔍 Handle search (reusable)
function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("⚠️ Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        showError("⚠️ City name too short.");
        return;
    }

    getWeather(city);
    cityInput.value = "";
}

// Button click
searchBtn.addEventListener("click", handleSearch);

// Enter key
cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});

// 🌦️ Fetch weather
async function getWeather(city) {

    showLoading();

    // Disable button
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        displayWeather(response.data);

    } catch (error) {
        console.error("Error:", error);

        if (error.response && error.response.status === 404) {
            showError("❌ City not found. Check spelling.");
        } else {
            showError("⚠️ Something went wrong. Try again.");
        }

    } finally {
        // Re-enable button
        searchBtn.disabled = false;
        searchBtn.textContent = "🔍 Search";
    }
}

// 🌤️ Display weather
function displayWeather(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2>${cityName}</h2>
            <img src="${iconUrl}" alt="${description}">
            <div>${temperature}°C</div>
            <p>${description}</p>
        </div>
    `;

    document.getElementById("weather-display").innerHTML = weatherHTML;

    // Focus back for next search (UX ✨)
    cityInput.focus();
}

// ❌ Show error
function showError(message) {
    const errorHTML = `
        <div class="error-message">
            <span>⚠️</span>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;

    document.getElementById("weather-display").innerHTML = errorHTML;
}

// ⏳ Loading UI
function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;

    document.getElementById("weather-display").innerHTML = loadingHTML;
}