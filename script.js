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
  
  // Also save which widgets are currently on the dashboard
  const widgetTypes = {};
  [...dashboard.children].forEach(widget => {
    const id = widget.dataset.id;
    if (widget.querySelector('.todo-container')) {
      widgetTypes[id] = 'todo';
    } else if (widget.querySelector('.timer-container')) {
      widgetTypes[id] = 'timer';
    } else if (widget.querySelector('textarea') && id.startsWith('widget-')) {
      widgetTypes[id] = 'custom-note';
    } else if (widget.querySelector('ul') && widget.querySelector('h2').textContent.includes('My Links')) {
      widgetTypes[id] = 'links';
    }
  });
  localStorage.setItem("widgetTypes", JSON.stringify(widgetTypes));
}

function loadLayout() {
  const saved = JSON.parse(localStorage.getItem("dashboardOrder"));
  const widgetTypes = JSON.parse(localStorage.getItem("widgetTypes")) || {};
  
  if (!saved) return;

  const widgets = {};
  [...dashboard.children].forEach(w => widgets[w.dataset.id] = w);
  dashboard.innerHTML = "";
  
  saved.forEach(id => {
    if (widgets[id]) {
      // Existing default widget
      dashboard.appendChild(widgets[id]);
    } else if (widgetTypes[id]) {
      // Custom widget that needs to be recreated
      const widgetType = widgetTypes[id];
      addNewWidget(widgetType, id); // Pass the ID to maintain consistency
    }
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
      <p><strong>Adelaide:</strong> ${temp}°C, ${description}<br>
      <small>High: ${maxTemp}°C, Low: ${minTemp}°C</small><br>
      <small>Humidity: ${humidity}% • Wind: ${windSpeed} km/h</small></p>
    `;
    
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    // Fallback to static content
    weatherContent.innerHTML = `
      <p><strong>Adelaide:</strong> 23°C, Sunny<br>
      <small>Weather data temporarily unavailable</small></p>
    `;
  }
}

function getWeatherEmoji(weatherCode) {
  const code = parseInt(weatherCode);
  if (code === 113) return ''; // Sunny
  if (code === 116) return ''; // Partly cloudy
  if (code === 119 || code === 122) return ''; // Cloudy
  if (code === 143 || code === 248) return ''; // Mist/fog
  if (code >= 176 && code <= 200) return ''; // Rain
  if (code >= 227 && code <= 264) return ''; // Snow
  if (code >= 266 && code <= 284) return ''; // Light rain
  if (code >= 293 && code <= 299) return ''; // Rain
  if (code >= 302 && code <= 359) return ''; // Heavy rain
  if (code >= 362 && code <= 392) return ''; // Snow
  if (code >= 395 && code <= 399) return ''; // Heavy snow
  return ''; // Default
}

// Fetch weather when page loads
window.addEventListener("load", () => {
  loadLayout();
  fetchWeather();
  setupToolbar();
  setupExistingWidgets();
  
  // Refresh weather every 30 minutes
  setInterval(fetchWeather, 30 * 60 * 1000);
});

// Setup functionality for existing widgets on page load
function setupExistingWidgets() {
  document.querySelectorAll('.widget').forEach(widget => {
    const widgetId = widget.dataset.id;
    
    // Setup note widgets (including the default notes widget)
    if (widget.querySelector('textarea')) {
      setupNoteWidget(widget);
    }
    
    // Setup any existing todo widgets
    if (widget.querySelector('.todo-container')) {
      setupTodoWidget(widget);
    }
    
    // Setup any existing timer widgets
    if (widget.querySelector('.timer-container')) {
      setupTimerWidget(widget);
    }
  });
}

// Toolbar functionality
function setupToolbar() {
  const addWidgetBtn = document.getElementById('add-widget-btn');
  const resetLayoutBtn = document.getElementById('reset-layout-btn');
  const addWidgetModal = document.getElementById('add-widget-modal');
  
  // Add widget button
  addWidgetBtn.addEventListener('click', () => {
    addWidgetModal.style.display = 'flex';
  });
  
  // Reset layout button
  resetLayoutBtn.addEventListener('click', () => {
    if (confirm('Reset dashboard to default layout? This will remove any custom widgets.')) {
      resetToDefaultLayout();
    }
  });
  
  // Widget option buttons
  document.querySelectorAll('.widget-option').forEach(option => {
    option.addEventListener('click', () => {
      const widgetType = option.dataset.type;
      addNewWidget(widgetType);
      addWidgetModal.style.display = 'none';
    });
  });
  
  // Setup remove widget functionality
  setupRemoveButtons();
}

function setupRemoveButtons() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-widget')) {
      const widget = e.target.closest('.widget');
      if (widget && confirm('Remove this widget?')) {
        widget.remove();
        saveLayout();
      }
    }
  });
}

function addNewWidget(type, existingId = null) {
  const dashboard = document.getElementById('dashboard');
  const widgetId = existingId || generateUniqueId();
  
  let widgetHTML = '';
  
  switch (type) {
    case 'custom-note':
      widgetHTML = `
        <div class="widget" data-id="${widgetId}" draggable="true">
          <button class="remove-widget" aria-label="Remove widget">&times;</button>
          <h2>My Notes</h2>
          <textarea placeholder="Your custom notes here..."></textarea>
        </div>
      `;
      break;
      
    case 'links':
      widgetHTML = `
        <div class="widget" data-id="${widgetId}" draggable="true">
          <button class="remove-widget" aria-label="Remove widget">&times;</button>
          <h2>My Links</h2>
          <ul>
            <li><a href="https://github.com" target="_blank">GitHub</a></li>
            <li><a href="https://stackoverflow.com" target="_blank">Stack Overflow</a></li>
            <li><a href="#" onclick="editLinks(this)">+ Add Link</a></li>
          </ul>
        </div>
      `;
      break;
      
    case 'todo':
      widgetHTML = `
        <div class="widget" data-id="${widgetId}" draggable="true">
          <button class="remove-widget" aria-label="Remove widget">&times;</button>
          <h2>Tasks</h2>
          <div class="todo-container">
            <div class="todo-input-section">
              <input type="text" placeholder="What needs to be done?" class="todo-input">
              <div class="todo-options">
                <select class="todo-priority">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                </select>
                <button class="add-todo-btn">Add</button>
              </div>
            </div>
            <div class="todo-filters">
              <button class="filter-btn active" data-filter="all">All</button>
              <button class="filter-btn" data-filter="pending">Pending</button>
              <button class="filter-btn" data-filter="completed">Done</button>
            </div>
            <ul class="todo-list"></ul>
            <div class="todo-stats">
              <span class="todo-count">0 tasks</span>
              <button class="clear-completed">Clear completed</button>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'timer':
      widgetHTML = `
        <div class="widget" data-id="${widgetId}" draggable="true">
          <button class="remove-widget" aria-label="Remove widget">&times;</button>
          <h2>Timer</h2>
          <div class="timer-container">
            <div class="timer-display">25:00</div>
            <div class="timer-controls">
              <button class="timer-btn start">Start</button>
              <button class="timer-btn pause">Pause</button>
              <button class="timer-btn reset">Reset</button>
            </div>
          </div>
        </div>
      `;
      break;
  }
  
  dashboard.insertAdjacentHTML('beforeend', widgetHTML);
  
  // Setup functionality for new widget
  const newWidget = dashboard.lastElementChild;
  setupWidgetFunctionality(newWidget, type);
  
  if (!existingId) {
    saveLayout();
    
    // Animate in only for new widgets (not restored ones)
    newWidget.style.opacity = '0';
    newWidget.style.transform = 'translateY(30px)';
    setTimeout(() => {
      newWidget.style.transition = 'all 0.3s ease';
      newWidget.style.opacity = '1';
      newWidget.style.transform = 'translateY(0)';
    }, 100);
  }
}

function setupWidgetFunctionality(widget, type) {
  switch (type) {
    case 'todo':
      setupTodoWidget(widget);
      break;
    case 'timer':
      setupTimerWidget(widget);
      break;
    case 'custom-note':
      setupNoteWidget(widget);
      break;
  }
}

function setupNoteWidget(widget) {
  const textarea = widget.querySelector('textarea');
  const widgetId = widget.dataset.id;
  const storageKey = `note-content-${widgetId}`;
  
  // Load saved content
  const savedContent = localStorage.getItem(storageKey);
  if (savedContent) {
    textarea.value = savedContent;
  }
  
  // Save content on input with debouncing
  let saveTimeout;
  textarea.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem(storageKey, textarea.value);
    }, 500); // Save after 500ms of no typing
  });
  
  // Save immediately on blur
  textarea.addEventListener('blur', () => {
    clearTimeout(saveTimeout);
    localStorage.setItem(storageKey, textarea.value);
  });
}

function setupTodoWidget(widget) {
  const input = widget.querySelector('.todo-input');
  const list = widget.querySelector('.todo-list');
  const prioritySelect = widget.querySelector('.todo-priority');
  const addBtn = widget.querySelector('.add-todo-btn');
  const filterBtns = widget.querySelectorAll('.filter-btn');
  const todoCount = widget.querySelector('.todo-count');
  const clearCompleted = widget.querySelector('.clear-completed');
  
  const widgetId = widget.dataset.id;
  const storageKey = `todo-tasks-${widgetId}`;
  const filterKey = `todo-filter-${widgetId}`;
  
  let tasks = JSON.parse(localStorage.getItem(storageKey)) || [];
  let currentFilter = localStorage.getItem(filterKey) || 'all';
  
  // Set the active filter button on load
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });
  
  function saveTasks() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }
  
  function saveFilter() {
    localStorage.setItem(filterKey, currentFilter);
  }
  
  function addTask() {
    const text = input.value.trim();
    if (!text) return;
    
    const task = {
      id: Date.now(),
      text: text,
      completed: false,
      priority: prioritySelect.value,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    input.value = '';
    saveTasks();
    renderTasks();
    updateStats();
  }
  
  function renderTasks() {
    const filteredTasks = tasks.filter(task => {
      if (currentFilter === 'completed') return task.completed;
      if (currentFilter === 'pending') return !task.completed;
      return true;
    });
    
    // Sort by priority (high -> medium -> low) then by creation time
    filteredTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    
    list.innerHTML = '';
    
    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
      
      li.innerHTML = `
        <div class="todo-main">
          <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
          <span class="todo-text">${task.text}</span>
          <div class="todo-badges">
            ${getPriorityBadge(task.priority)}
          </div>
        </div>
        <button class="todo-remove" data-id="${task.id}">×</button>
      `;
      
      list.appendChild(li);
      
      // Add event listeners
      const checkbox = li.querySelector('.todo-checkbox');
      const removeBtn = li.querySelector('.todo-remove');
      
      checkbox.addEventListener('change', () => {
        toggleTask(task.id);
      });
      
      removeBtn.addEventListener('click', () => {
        removeTask(task.id);
      });
    });
  }
  
  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
      updateStats();
    }
  }
  
  function removeTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
  }
  
  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    if (currentFilter === 'all') {
      todoCount.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    } else if (currentFilter === 'pending') {
      todoCount.textContent = `${pending} pending`;
    } else {
      todoCount.textContent = `${completed} completed`;
    }
    
    clearCompleted.style.display = completed > 0 ? 'block' : 'none';
  }
  
  function getPriorityBadge(priority) {
    const badges = {
      high: '<span class="priority-badge high">High</span>',
      medium: '<span class="priority-badge medium">Med</span>',
      low: '<span class="priority-badge low">Low</span>'
    };
    return badges[priority] || '';
  }
  
  // Event listeners
  addBtn.addEventListener('click', addTask);
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      saveFilter();
      renderTasks();
      updateStats();
    });
  });
  
  clearCompleted.addEventListener('click', () => {
    if (confirm('Clear all completed tasks?')) {
      tasks = tasks.filter(t => !t.completed);
      saveTasks();
      renderTasks();
      updateStats();
    }
  });
  
  // Initial render
  renderTasks();
  updateStats();
}

function setupTimerWidget(widget) {
  const display = widget.querySelector('.timer-display');
  const startBtn = widget.querySelector('.start');
  const pauseBtn = widget.querySelector('.pause');
  const resetBtn = widget.querySelector('.reset');
  
  const widgetId = widget.dataset.id;
  const storageKey = `timer-state-${widgetId}`;
  
  // Load saved timer state
  const savedState = JSON.parse(localStorage.getItem(storageKey)) || {
    timeLeft: 25 * 60,
    isRunning: false,
    lastUpdate: Date.now()
  };
  
  let timeLeft = savedState.timeLeft;
  let timerInterval = null;
  let isRunning = false;
  
  // Adjust time if timer was running when page was closed
  if (savedState.isRunning) {
    const elapsed = Math.floor((Date.now() - savedState.lastUpdate) / 1000);
    timeLeft = Math.max(0, savedState.timeLeft - elapsed);
    if (timeLeft <= 0) {
      timeLeft = 0;
      isRunning = false;
    }
  }
  
  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify({
      timeLeft: timeLeft,
      isRunning: isRunning,
      lastUpdate: Date.now()
    }));
  }
  
  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update button states
    startBtn.textContent = isRunning ? 'Running...' : 'Start';
    startBtn.disabled = isRunning;
    pauseBtn.disabled = !isRunning;
  }
  
  startBtn.addEventListener('click', () => {
    if (!isRunning && timeLeft > 0) {
      isRunning = true;
      saveState();
      timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        saveState();
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          isRunning = false;
          saveState();
          alert('Timer finished!');
        }
      }, 1000);
      updateDisplay();
    }
  });
  
  pauseBtn.addEventListener('click', () => {
    if (isRunning) {
      clearInterval(timerInterval);
      isRunning = false;
      saveState();
      updateDisplay();
    }
  });
  
  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 25 * 60;
    saveState();
    updateDisplay();
  });
  
  // Initial display update
  updateDisplay();
  
  // Resume timer if it was running
  if (savedState.isRunning && timeLeft > 0) {
    startBtn.click();
  }
}

function resetToDefaultLayout() {
  // Clear all widget-related localStorage data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('todo-') || key.startsWith('timer-') || 
        key.startsWith('note-') || key === 'dashboardOrder' || 
        key === 'widgetTypes') {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  const dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = `
    <div class="widget" data-id="announcements" draggable="true">
      <button class="remove-widget" aria-label="Remove widget">&times;</button>
      <h2>Announcements</h2>
      <p>Welcome to Daydream Adelaide! Stay tuned for updates and exciting news throughout the event.</p>
    </div>
    <div class="widget" data-id="schedule" draggable="true">
      <button class="remove-widget" aria-label="Remove widget">&times;</button>
      <h2>Schedule</h2>
      <ul>
        <li>10:00 AM - Opening Ceremony</li>
        <li>11:00 AM - Workshops</li>
        <li>4:00 PM - Demos</li>
        <li>6:00 PM - Networking & Dinner</li>
      </ul>
    </div>
    <div class="widget" data-id="weather" draggable="true">
      <button class="remove-widget" aria-label="Remove widget">&times;</button>
      <h2>Weather</h2>
      <div id="weather-content">
        <p>Loading Adelaide weather...</p>
      </div>
    </div>
    <div class="widget" data-id="quicklinks" draggable="true">
      <button class="remove-widget" aria-label="Remove widget">&times;</button>
      <h2>Quick Links</h2>
      <ul>
        <li><a href="#" class="open-overlay" data-target="wifi">WiFi Info</a></li>
        <li><a href="#" class="open-overlay" data-target="map">Venue Map</a></li>
        <li><a href="#" class="open-overlay" data-target="conduct">Code of Conduct</a></li>
      </ul>
    </div>
    <div class="widget" data-id="notes" draggable="true">
      <button class="remove-widget" aria-label="Remove widget">&times;</button>
      <h2>Notes</h2>
      <textarea placeholder="Write your notes here... 
• Ideas for your project
• People you've met  
• Things to remember"></textarea>
    </div>
  `;
  
  fetchWeather(); // Reload weather
  setupExistingWidgets(); // Setup the default widgets
  window.loadSchedule(); // Reload schedule
}

function generateUniqueId() {
  return 'widget-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function parseTimeToDate(timeStr) {
  // Parse times like "10:00 AM" or "4:00 PM" into Date objects for today
  const now = new Date();
  const [time, meridiem] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;

  const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  return eventDate;
}

async function loadSchedule() {
  try {
    const response = await fetch('schedule.json');
    if (!response.ok) throw new Error('Could not fetch schedule.json');

    const scheduleItems = await response.json();
    const list = document.getElementById('schedule-list');
    list.innerHTML = '';

    const now = new Date();

    // Map each event to an object with its Date for today
    const eventsWithDates = scheduleItems.map(item => ({
      ...item,
      date: parseTimeToDate(item.time)
    }));

    // Filter future events
    let upcomingEvents = eventsWithDates.filter(item => item.date >= now);

    if (upcomingEvents.length === 0) {
      // No events left today, so just show the first 4 events anyway (e.g. for tomorrow)
      upcomingEvents = eventsWithDates.slice(0, 4);
    } else {
      // Otherwise, take up to 4 upcoming
      upcomingEvents = upcomingEvents.slice(0, 4);
    }

    upcomingEvents.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.time} - ${item.event}`;
      list.appendChild(li);
    });

  } catch (error) {
    console.error(error);
    const list = document.getElementById('schedule-list');
    list.innerHTML = '<li>Failed to load schedule.</li>';
  }
}
window.loadSchedule = loadSchedule; // Expose for global access