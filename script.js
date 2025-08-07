const dashboard = document.getElementById("dashboard");
let draggedItem = null;

dashboard.addEventListener("dragstart", e => {
  if (e.target.classList.contains("widget")) {
    draggedItem = e.target;
    e.dataTransfer.setData("text/plain", "");
  }
});

dashboard.addEventListener("dragover", e => {
  e.preventDefault();
  const widget = e.target.closest(".widget");
  if (widget && widget !== draggedItem) {
    const rect = widget.getBoundingClientRect();
    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
    dashboard.insertBefore(draggedItem, next ? widget.nextSibling : widget);
  }
});

dashboard.addEventListener("drop", () => {
  saveLayout();
});

document.querySelectorAll(".widget").forEach(widget => {
  widget.setAttribute("draggable", true);
});

function saveLayout() {
  const order = [...dashboard.children].map(w => w.dataset.id);
  localStorage.setItem("dashboardOrder", JSON.stringify(order));
}

function loadLayout() {
  const saved = JSON.parse(localStorage.getItem("dashboardOrder"));
  if (!saved) return;

  const widgets = {};
  [...dashboard.children].forEach(w => widgets[w.dataset.id] = w);
  dashboard.innerHTML = "";
  saved.forEach(id => {
    if (widgets[id]) dashboard.appendChild(widgets[id]);
  });
}

// Overlay logic
document.querySelectorAll(".open-overlay").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = link.dataset.target;
    const overlay = document.getElementById(`overlay-${target}`);
    if (overlay) overlay.style.display = "flex";
  });
});

document.querySelectorAll(".close-overlay").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.closest(".overlay").style.display = "none";
  });
});

window.addEventListener("click", e => {
  if (e.target.classList.contains("overlay")) {
    e.target.style.display = "none";
  }
});

// Weather functionality
async function fetchWeather() {
  const weatherContent = document.getElementById("weather-content");
  
  try {
    // Using OpenWeatherMap API with Adelaide coordinates
    // You can get a free API key from openweathermap.org
    const API_KEY = "demo"; // Replace with your actual API key
    const lat = -34.9285;
    const lon = 138.6007;
    
    // For demo purposes, we'll use a free weather service
    // Using wttr.in which doesn't require an API key
    const response = await fetch(`https://wttr.in/Adelaide?format=j1`);
    
    if (!response.ok) {
      throw new Error('Weather service unavailable');
    }
    
    const data = await response.json();
    const current = data.current_condition[0];
    const today = data.weather[0];
    
    const temp = Math.round(current.temp_C);
    const description = current.weatherDesc[0].value;
    const humidity = current.humidity;
    const windSpeed = current.windspeedKmph;
    const maxTemp = Math.round(today.maxtempC);
    const minTemp = Math.round(today.mintempC);
    
    // Get weather emoji
    const weatherEmoji = getWeatherEmoji(current.weatherCode);
    
    weatherContent.innerHTML = `
      <p><strong>Adelaide:</strong> ${temp}°C, ${description} ${weatherEmoji}<br>
      <small>High: ${maxTemp}°C, Low: ${minTemp}°C</small><br>
      <small>Humidity: ${humidity}% • Wind: ${windSpeed} km/h</small></p>
    `;
    
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    // Fallback to static content
    weatherContent.innerHTML = `
      <p><strong>Adelaide:</strong> 23°C, Sunny ☀️<br>
      <small>Weather data temporarily unavailable</small></p>
    `;
  }
}

function getWeatherEmoji(weatherCode) {
  const code = parseInt(weatherCode);
  if (code === 113) return '☀️'; // Sunny
  if (code === 116) return '⛅'; // Partly cloudy
  if (code === 119 || code === 122) return '☁️'; // Cloudy
  if (code === 143 || code === 248) return '🌫️'; // Mist/fog
  if (code >= 176 && code <= 200) return '🌧️'; // Rain
  if (code >= 227 && code <= 264) return '🌨️'; // Snow
  if (code >= 266 && code <= 284) return '🌦️'; // Light rain
  if (code >= 293 && code <= 299) return '🌧️'; // Rain
  if (code >= 302 && code <= 359) return '🌧️'; // Heavy rain
  if (code >= 362 && code <= 392) return '🌨️'; // Snow
  if (code >= 395 && code <= 399) return '❄️'; // Heavy snow
  return '🌤️'; // Default
}

// Fetch weather when page loads
window.addEventListener("load", () => {
  loadLayout();
  fetchWeather();
  
  // Refresh weather every 30 minutes
  setInterval(fetchWeather, 30 * 60 * 1000);
});
