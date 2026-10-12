const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const WX = 'https://api.open-meteo.com/v1/forecast';


const form = document.querySelector('#search-form');
const input = document.querySelector('#city-input');
const searchBtn = document.querySelector('#search-btn');
const retryBtn = document.querySelector('#retry-btn');
const statusEl = document.querySelector('#status');
const spinnerEl = document.querySelector('#spinner');
const resultsEl = document.querySelector('#results');
const cityEl = document.querySelector('#city-name');
const iconEl = document.querySelector('#weather-icon');
const tempEl = document.querySelector('#temperature');
const conditionsEl = document.querySelector('#conditions');
const feelsEl = document.querySelector('#feels-like');
const humidityEl = document.querySelector('#humidity');
const windEl = document.querySelector('#wind');
const forecastEl = document.querySelector('#forecast');


async function getJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}


async function loadWeather(city) {
  const q = new URLSearchParams({ name: city, count: 1 });
  const geo = await getJSON(`${GEO}?${q}`);
  if (!geo.results?.length) throw new Error('not-found');

  const { latitude, longitude, name } = geo.results[0];
  const p = new URLSearchParams({
    latitude, longitude, forecast_days: 3,
    current: 'temperature_2m,wind_speed_10m,relative_humidity_2m,apparent_temperature,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
  });
  return { name, ...(await getJSON(`${WX}?${p}`)) };
}


function describeWeather(code) {
  if (code === 0) return ['☀️', 'Clear sky' ];
  if (code <= 2) return ['⛅', 'Partly cloudy' ];
  if (code === 3) return ['☁️', 'Cloudy' ];
  if (code <= 48) return ['🌫️', 'Fog' ];
  if (code <= 57) return ['🌦️', 'Drizzle' ];
  if (code <= 67) return ['🌧️', 'Rain' ];
  if (code <= 77) return ['❄️', 'Snow' ];
  if (code <= 82) return ['🌧️', 'Rain showers' ];
  if (code <= 86) return ['🌨️', 'Snow showers' ];
  return ['⛈️', 'Thunderstorm' ];
}


function setStatus(state, message = '') {
  statusEl.dataset.state = state;
  statusEl.textContent = message;
  searchBtn.disabled = state === 'loading';
  spinnerEl.hidden = state !== 'loading';
  retryBtn.hidden = state !== 'error';
}


function renderWeather(data) {
  const { current, daily } = data;
  const [icon, text] = describeWeather(current.weather_code);

  cityEl.textContent = data.name;
  iconEl.textContent = icon;
  conditionsEl.textContent = text;
  tempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
  feelsEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  windEl.textContent = `${current.wind_speed_10m} km/h`;

  forecastEl.replaceChildren(
    ...daily.time.map((day, i) => {
      const [dayIcon, dayText] = describeWeather(daily.weather_code[i]);
      const card = document.createElement('li');
      card.textContent =
        `${day}: ${dayIcon} ${dayText}, ${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°`;
      return card;
    })
  );
  resultsEl.hidden = false;
}


function friendly(err) {
  if (err.message === 'not-found') return 'City not found. Check the spelling.';
  if (err.message === 'HTTP 429') return 'Too many requests. Wait a minute and try again.';
  return "Couldn't reach the server. Please try again.";
}


async function onSearch() {
  const city = input.value.trim();
  setStatus('loading', `Loading ${city}…`);
  resultsEl.hidden = true;
  try {
    const data = await loadWeather(city);
    renderWeather(data);
    setStatus('success', `Showing the weather for ${data.name}`);
  } catch (err) {
    console.warn(err);
    setStatus('error', friendly(err));
  }
}


form.addEventListener('submit', (event) => {
  event.preventDefault();
  onSearch();
});

retryBtn.addEventListener('click', onSearch);

setStatus('idle', 'Search for a city');
