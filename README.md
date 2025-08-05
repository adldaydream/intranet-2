# Daydream Adelaide Intranet

A simple, clean intranet dashboard for the Daydream Adelaide hackathon event.

## What's this?

Just a basic web dashboard that shows useful info for attendees - schedule, announcements, WiFi details, that sort of thing. Built it to be lightweight and easy to use on phones/laptops during the event.

## Features

- **Drag & drop widgets** - rearrange the dashboard however you like
- **Quick links** - WiFi info, venue map, code of conduct in handy popups  
- **Note taking** - jot down ideas or contacts right in the browser
- **Responsive** - works on desktop, tablet, phone
- **No backend needed** - just static files, dead simple

## Running locally

```bash
# Clone it
git clone https://github.com/adldaydream/intranet.git
cd intranet

# Serve it (Python 3)
python3 -m http.server 8000

# Or if you prefer Node
npx serve .

# Then open http://localhost:8000
```

## Structure

```
├── index.html      # Main page
├── style.css       # All the styling
├── script.js       # Drag/drop + overlay logic
└── README.md       # This file
```

## Customizing

Want to change something? It's all straightforward HTML/CSS/JS. No build process, no frameworks - just edit the files directly.

- Update content in `index.html`
- Tweak colors/layout in `style.css` 
- Modify interactions in `script.js`

## Deployment

Since it's static files, you can host this anywhere:
- GitHub Pages (already set up with CNAME)
- Netlify 
- Vercel
- Any web server

---

Built for Daydream Adelaide 2025 🚀
