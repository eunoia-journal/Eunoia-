const calendar = document.getElementById("calendar");
const report = JSON.parse(localStorage.getItem("pomodoro-report") || {});

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();

const firstDay = new Date(year, month, 1).getDay();
const daysInMonth = new Date(year, month + 1, 0).getDate();

// Empty slots before month starts
for (let i = 0; i < firstDay; i++) {
  const empty = document.createElement("div");
  empty.className = "day empty";
  calendar.appendChild(empty);
}

// Actual days
for (let day = 1; day <= daysInMonth; day++) {
  const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const seconds = report[dateKey] || 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const cell = document.createElement("div");
  cell.className = "day";

  cell.innerHTML = `
    <strong>${day}</strong>
    ${seconds > 0 ? `${hours}h ${minutes}m` : ""}
  `;

  calendar.appendChild(cell);
}

function goHome() {
  window.location.href = "index.html";
}
