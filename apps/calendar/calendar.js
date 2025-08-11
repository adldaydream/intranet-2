// ...existing code from script.js...
async function loadSchedule() {
  try {
    const response = await fetch('/schedule.json'); // Root file
    const events = await response.json();
    displaySchedule(events);
  } catch (err) {
    console.error("Error loading schedule:", err);
    document.getElementById('schedule').innerHTML = "<p>Failed to load schedule.</p>";
  }
}

function displaySchedule(events) {
  const scheduleDiv = document.getElementById('schedule');
  scheduleDiv.innerHTML = '';

  events.forEach(e => {
    const eventDiv = document.createElement('div');
    eventDiv.classList.add('event');

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('time');
    timeDiv.textContent = e.time;

    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('details');
    detailsDiv.textContent = e.event;

    eventDiv.appendChild(timeDiv);
    eventDiv.appendChild(detailsDiv);
    scheduleDiv.appendChild(eventDiv);
  });
}

loadSchedule();
