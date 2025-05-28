function formatDate(timestamp) {
    const datetime = new Date(timestamp);
    const year = String(datetime.getUTCFullYear());
    let month = String(datetime.getUTCMonth() + 1);
    let day = String(datetime.getUTCDate());
    let hour = String(datetime.getUTCHours());
    
    month = month.padStart(2, '0');
    day = day.padStart(2, '0');
    hour = hour.padStart(2, '0');
    
    return `${day}.${month}.${year} ${hour}:00`;
}

function formatTemperature(temperature) {
    return Math.round(temperature);
}

const domElements = {
    cityInput: document.getElementById('city-input'),
    resultsContainer: document.getElementById('autocomplete-results'),
    submitButton: document.getElementById('submit'),
    weatherTable: document.getElementById('weathe-table'),
    weatherBlock: document.getElementById('weather-block'),
    cityTitle: document.getElementById('city-title') || document.createElement('h2'),
    form: document.getElementById("myForm")
};

function handleInput() {
    const query = domElements.cityInput.value.trim();
    
    if (query.length < 2) {
        domElements.resultsContainer.innerHTML = '';
        return;
    }
    
    fetchCitySuggestions(query);
}

function handleSubmit(event) {
    event.preventDefault();
    const query = domElements.cityInput.value.trim();
    
    if (query.length < 2) {
        alert('Пожалуйста, введите название города (минимум 2 символа)');
        return;
    }
    
    fetchWeatherData(query);
}

function handleDocumentClick(event) {
    if (!domElements.cityInput.contains(event.target) && 
        !domElements.resultsContainer.contains(event.target)) {
        domElements.resultsContainer.innerHTML = '';
    }
}

async function fetchCitySuggestions(query) {
    try {
        const response = await fetch(`/city-autocomplite/?city=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (!data.suggestions) throw new Error('Invalid data format');
        
        displayCitySuggestions(data.suggestions);
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
        domElements.resultsContainer.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
    }
}

function displayCitySuggestions(suggestions) {
    domElements.resultsContainer.innerHTML = '';
    
    suggestions.forEach(item => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'autocomplete-item';
        suggestionElement.textContent = item.name;
        suggestionElement.addEventListener('click', () => {
            domElements.cityInput.value = item.name;
            domElements.resultsContainer.innerHTML = '';
        });
        domElements.resultsContainer.appendChild(suggestionElement);
    });
}

async function fetchWeatherData(cityQuery) {
    try {
        domElements.weatherTable.innerHTML = '<tr><td colspan="2">Загрузка данных...</td></tr>';
        
        const cityResponse = await fetch(`/city-autocomplite/?city=${encodeURIComponent(cityQuery)}`);
        if (!cityResponse.ok) throw new Error('City API response was not ok');
        
        const cityData = await cityResponse.json();
        
        if (!cityData.suggestions || cityData.suggestions.length === 0) {
            throw new Error('Город не найден');
        }
        
        const city = cityData.suggestions[0];
        domElements.cityTitle.textContent = city.name;
        
        const weatherResponse = await fetch(`/weather-prediction/?lat=${encodeURIComponent(city.lat)}&lon=${encodeURIComponent(city.lon)}&city=${city.name}`);
        if (!weatherResponse.ok) throw new Error('Weather API response was not ok');
        
        const weatherData = await weatherResponse.json();
        
        if (!weatherData.weather_data) {
            throw new Error('Неверный формат данных о погоде');
        }
        
        const parsedData = JSON.parse(weatherData.weather_data);
        if (!parsedData.date || !parsedData.temperature_2m) {
            throw new Error('Отсутствуют необходимые данные о погоде');
        }
        
        renderWeatherTable(parsedData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        domElements.weatherTable.innerHTML = `<tr><td colspan="2" class="error">${error.message}</td></tr>`;
    }
}

function renderWeatherTable(weatherData) {
    console.log(sessionStorage)
    domElements.weatherTable.innerHTML = '';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    ['Время', 'Температура (°C)', 'Ощущается как', 'Вероятность осадков (%)'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    domElements.weatherTable.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    if (!weatherData.date || !weatherData.temperature_2m || 
        weatherData.date.length !== weatherData.temperature_2m.length) {
        const errorRow = document.createElement('tr');
        errorRow.innerHTML = '<td colspan="2" class="error">Некорректные данные о погоде</td>';
        tbody.appendChild(errorRow);
        domElements.weatherTable.appendChild(tbody);
        return;
    }
    
    console.log(weatherData)
    for (let i = 0; i < Object.keys(weatherData.date).length; i++) {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.className = 'date-block';
        dateCell.textContent = formatDate(weatherData.date[`${i}`]);
        row.appendChild(dateCell);
        
        const tempCell = document.createElement('td');
        tempCell.className = 'temp-block';
        tempCell.textContent = formatTemperature(weatherData.temperature_2m[`${i}`]);
        row.appendChild(tempCell);
        
        const tempFelsCell = document.createElement('td');
        tempFelsCell.className = 'temp-feels-block';
        tempFelsCell.textContent = formatTemperature(weatherData.apparent_temperature[`${i}`]);
        row.appendChild(tempFelsCell);
        
        const precipitationProbabilityCell = document.createElement('td');
        precipitationProbabilityCell.className = 'temp-block';
        precipitationProbabilityCell.textContent = formatTemperature(weatherData.precipitation_probability[`${i}`]);
        row.appendChild(precipitationProbabilityCell);
        tbody.appendChild(row);
    }
    
    domElements.weatherTable.appendChild(tbody);
}

function initWeatherApp() {
    if (!domElements.cityInput || !domElements.weatherTable) {
        console.error('Required DOM elements not found');
        return;
    }
    
    if (!document.querySelector('h2')) {
        domElements.weatherBlock.prepend(domElements.cityTitle);
    }
    
    domElements.cityInput.addEventListener('input', handleInput);
    domElements.form?.addEventListener('submit', handleSubmit);
    domElements.submitButton.addEventListener('click', handleSubmit);
    document.addEventListener('click', handleDocumentClick);
}

document.addEventListener('DOMContentLoaded', initWeatherApp);