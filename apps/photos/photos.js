// ...existing code from script.js...
async function loadPhotos() {
  try {
    const res = await fetch('uploads/photos.json');
    const files = await res.json();

    // Parse date from filename and group
    const grouped = {};
    files.forEach(file => {
      const match = file.match(/^(\d{2})-(\d{2})-(\d{4})/);
      if (match) {
        const dateStr = `${match[1]}-${match[2]}-${match[3]}`;
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(file);
      }
    });

    // Sort by date (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('-').map(Number);
      const [dayB, monthB, yearB] = b.split('-').map(Number);
      return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
    });

    displayPhotos(grouped, sortedDates);
  } catch (err) {
    console.error('Error loading photos:', err);
    document.getElementById('gallery').innerHTML = "<p>Failed to load photos.</p>";
  }
}

function displayPhotos(grouped, sortedDates) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  sortedDates.forEach(date => {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('date-group');

    const dateTitle = document.createElement('div');
    dateTitle.classList.add('date-title');
    dateTitle.textContent = date;
    groupDiv.appendChild(dateTitle);

    const grid = document.createElement('div');
    grid.classList.add('photo-grid');

    grouped[date].forEach(filename => {
      const img = document.createElement('img');
      img.src = `uploads/${filename}`;
      img.alt = filename;
      grid.appendChild(img);
    });

    groupDiv.appendChild(grid);
    gallery.appendChild(groupDiv);
  });
}

loadPhotos();
