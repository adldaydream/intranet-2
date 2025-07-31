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

window.addEventListener("load", loadLayout);
