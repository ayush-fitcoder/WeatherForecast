// Personal API Key from Openweathermap
const API_KEY = "b048eafcad311b784943231fc826a09a"; 

const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const cityInput = document.getElementById("cityInput");
const weatherDetails = document.getElementById("weatherDetails");
const forecastCards = document.getElementById("forecastCards");
const recentDropdown = document.getElementById("recentDropdown");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

function updateRecentDropdown() {
  if (recentCities.length > 0) {
    recentDropdown.classList.remove("hidden");
    recentDropdown.innerHTML = `<option disabled selected>Select a recent city</option>`;
    recentCities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      recentDropdown.appendChild(option);
    });
  }
}

function addCityToHistory(city) {
  if (!recentCities.includes(city)) {
    recentCities.unshift(city);
    if (recentCities.length > 5) recentCities.pop();
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    updateRecentDropdown();
  }
}

function displayCurrentWeather(data) {
  weatherDetails.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-6">
      <!-- Left: Main Weather -->
      <div class="text-center sm:text-left">
        <h3 class="text-3xl font-bold text-white">${data.name}</h3>
        <p class="text-lg text-purple-300 mt-1 capitalize">${data.weather[0].description}</p>
        <div class="flex items-center justify-center sm:justify-start gap-3 mt-3">
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].main}" class="w-24 h-24">
          <span class="text-5xl font-extrabold text-blue-400">${data.main.temp.toFixed(1)}°C</span>
        </div>
      </div>

      <!-- Right: Extra Details -->
      <div class="bg-gray-800/80 rounded-lg p-4 w-full sm:w-1/2 text-center sm:text-left space-y-2 text-gray-200 shadow-inner border border-gray-600">
        <p><span class="font-semibold text-blue-400">💧 Humidity:</span> ${data.main.humidity}%</p>
        <p><span class="font-semibold text-blue-400">🌬️ Wind:</span> ${data.wind.speed} m/s</p>
        <p><span class="font-semibold text-blue-400">📈 Pressure:</span> ${data.main.pressure} hPa</p>
        <p><span class="font-semibold text-blue-400">🌡️ Feels Like:</span> ${data.main.feels_like.toFixed(1)}°C</p>
      </div>
    </div>
  `;
}



function displayForecast(forecastList) {
  forecastCards.innerHTML = "";
  const dailyData = {};

  forecastList.forEach(entry => {
    const date = entry.dt_txt.split(" ")[0];
    if (!dailyData[date]) {
      dailyData[date] = entry;
    }
  });

  Object.entries(dailyData).slice(0, 5).forEach(([date, data]) => {
    const card = document.createElement("div");
    card.className =
      "bg-blue-900/70 text-white p-4 rounded-xl shadow-md border border-blue-700 text-center space-y-1";

    card.innerHTML = `
      <h4 class="font-semibold text-lg">${date}</h4>
      <img class="mx-auto w-12 h-12" src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].main}" />
      <p class="capitalize">${data.weather[0].description}</p>
      <p>🌡️ <span class="font-medium">${data.main.temp.toFixed(1)}°C</span></p>
      <p>💧 ${data.main.humidity}%</p>
      <p>🌬️ ${data.wind.speed} m/s</p>
    `;

    forecastCards.appendChild(card);
  });
}


async function fetchWeather(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayCurrentWeather(data);
    addCityToHistory(city);

    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const forecastData = await forecastRes.json();
    displayForecast(forecastData.list);
  } catch (error) {
    alert("Error: " + error.message);
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    cityInput.value = "";
  } else {
    alert("Please enter a city.");
  }
});

recentDropdown.addEventListener("change", () => {
  const selectedCity = recentDropdown.value;
  fetchWeather(selectedCity);
});

locationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      const data = await res.json();
      displayCurrentWeather(data);
      addCityToHistory(data.name);

      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      const forecastData = await forecastRes.json();
      displayForecast(forecastData.list);
    } catch (err) {
      alert("Location-based fetch failed.");
    }
  }, () => {
    alert("Location access denied.");
  });
});

// Init
updateRecentDropdown();
