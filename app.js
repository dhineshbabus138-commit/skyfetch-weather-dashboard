// Constructor
function WeatherApp(apiKey) {
    this.apiKey = apiKey;

    // ✅ दोनों API URLs
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // DOM
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    this.init();
}

// Init
WeatherApp.prototype.init = function () {

    // Click
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    // Enter key
    this.cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    });

    this.showWelcome();
};

// Handle search
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("⚠️ Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        this.showError("⚠️ City name too short.");
        return;
    }

    this.getWeather(city);
    this.cityInput.value = "";
};

// ✅ MAIN FUNCTION (current + forecast)
WeatherApp.prototype.getWeather = async function (city) {

    this.showLoading();

    this.searchBtn.disabled = true;
    this.searchBtn.textContent = "Searching...";

    const currentWeatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        // 🔥 Fetch both APIs together
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city)
        ]);

        // Show current weather
        this.displayWeather(currentWeather.data);

        // Show forecast
        this.displayForecast(forecastData);

    } catch (error) {
        console.error(error);

        if (error.response && error.response.status === 404) {
            this.showError("❌ City not found.");
        } else {
            this.showError("⚠️ Something went wrong.");
        }

    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = "🔍 Search";
    }
};

// ✅ Forecast API call
WeatherApp.prototype.getForecast = async function (city) {

    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        return response.data;

    } catch (error) {
        console.error("Forecast error:", error);
        throw error;
    }
};

// Display current weather
WeatherApp.prototype.displayWeather = function (data) {

    const cityName = data.name;
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;

    const html = `
        <div class="weather-info">
            <h2>${cityName}</h2>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
            <div class="temperature">${temp}°C</div>
            <p>${desc}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = html;
    this.cityInput.focus();
};

// Process forecast (5 days)
WeatherApp.prototype.processForecastData = function (data) {

    const dailyForecasts = data.list.filter(function (item) {
        return item.dt_txt.includes('12:00:00');
    });

    return dailyForecasts.slice(0, 5);
};

// Display forecast
WeatherApp.prototype.displayForecast = function (data) {

    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(function (day) {

        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}" alt="${description}">
                <p class="forecast-temp">${temp}°C</p>
                <p class="forecast-desc">${description}</p>
            </div>
        `;
    }).join('');

    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;

    // ✅ Append (important)
    this.weatherDisplay.innerHTML += forecastSection;
};

// Loading
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
};

// Error
WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
        </div>
    `;
};

// Welcome
WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <h2>🌤️ Welcome to SkyFetch</h2>
            <p>Enter a city name above to check the weather.</p>
        </div>
    `;
};

// ✅ Create app
const app = new WeatherApp('1947240aeb2dc29e5e3567bc5b90dc64');

function WeatherApp(apiKey) {
    this.apiKey = apiKey;

    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // Existing DOM
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    // ✅ New DOM (Recent Searches)
    this.recentSearchesSection = document.getElementById('recent-searches-section');
    this.recentSearchesContainer = document.getElementById('recent-searches-container');

    // ✅ Store recent searches
    this.recentSearches = [];

    // ✅ Limit (max 5)
    this.maxRecentSearches = 5;

    this.init();
}

WeatherApp.prototype.loadRecentSearches = function() {
    // Get data from localStorage
    const saved = localStorage.getItem('recentSearches');

    // If exists → convert string to array
    if (saved) {
        try {
            this.recentSearches = JSON.parse(saved);
        } catch (error) {
            console.error('Error parsing recent searches:', error);
            this.recentSearches = [];
        }
    }

    // Display on UI
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function(city) {

    // Convert to Title Case (e.g., "chennai" → "Chennai")
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // Check if already exists
    const index = this.recentSearches.indexOf(cityName);
    if (index > -1) {
        // Remove existing (to move it to front)
        this.recentSearches.splice(index, 1);
    }

    // Add to beginning
    this.recentSearches.unshift(cityName);

    // Limit to max (5)
    if (this.recentSearches.length > this.maxRecentSearches) {
        this.recentSearches.pop();
    }

    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));

    // Update UI
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function() {

    // Clear old buttons
    this.recentSearchesContainer.innerHTML = '';

    // If empty → hide section
    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = 'none';
        return;
    }

    // Show section
    this.recentSearchesSection.style.display = 'block';

    // Create buttons
    this.recentSearches.forEach(function(city) {

        const btn = document.createElement('button');
        btn.className = 'recent-search-btn';
        btn.textContent = city;

        // Click → search again
        btn.addEventListener('click', function() {
            this.cityInput.value = city;
            this.getWeather(city);
        }.bind(this));

        this.recentSearchesContainer.appendChild(btn);

    }.bind(this));
};

WeatherApp.prototype.getWeather = async function(city) {

    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        // Show data
        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

        // ✅ Save successful search
        this.saveRecentSearch(city);

        // ✅ Save last searched city
        localStorage.setItem('lastCity', city);

    } catch (error) {
        console.error('Error:', error);

        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check spelling and try again.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }

    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = '🔍 Search';
    }
};

WeatherApp.prototype.init = function() {

    // Event listeners
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    this.cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            this.handleSearch();
        }
    }.bind(this));

    // ✅ Load recent searches
    this.loadRecentSearches();

    // ✅ Load last searched city
    this.loadLastCity();

    // Show welcome (only if no last city)
    if (!localStorage.getItem('lastCity')) {
        this.showWelcome();
    }
};

WeatherApp.prototype.loadLastCity = function() {

    const lastCity = localStorage.getItem('lastCity');

    if (lastCity) {
        this.getWeather(lastCity);
    }
};

WeatherApp.prototype.loadLastCity = function() {
    // Get last searched city from localStorage
    const lastCity = localStorage.getItem('lastCity');

    if (lastCity) {
        // If found, fetch weather for that city
        this.getWeather(lastCity);
    } else {
        // If no last city, show welcome message
        this.showWelcome();
    }
};

WeatherApp.prototype.showWelcome = function() {
    const welcomeHTML = `
        <div class="welcome-message">
            <h2>🌤️ Welcome to SkyFetch Weather!</h2>
            <p>Search for a city to get started.</p>
            <p>Try examples: <em>London, Paris, Tokyo</em></p>
        </div>
    `;
    this.weatherDisplay.innerHTML = welcomeHTML;
};

WeatherApp.prototype.clearHistory = function() {
    if (confirm('Clear all recent searches?')) {
        this.recentSearches = [];
        localStorage.removeItem('recentSearches');
        this.displayRecentSearches();
    }
};

const clearBtn = document.getElementById('clear-history-btn');
if (clearBtn) {
    clearBtn.addEventListener('click', this.clearHistory.bind(this));
}

this.loadLastCity();
