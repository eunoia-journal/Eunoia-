/* ======================================================
   USER NAME
====================================================== */

let userName = localStorage.getItem("pomodoro-name");

if (!userName) {
  userName = prompt("What should we call you?");
  if (!userName || userName.trim() === "") userName = "Guest";
  localStorage.setItem("pomodoro-name", userName);
}

/* ======================================================
   AUDIO ENGINE
====================================================== */

const focusAudio = document.createElement("audio");
focusAudio.loop = true;
focusAudio.volume = 0.8;
document.body.appendChild(focusAudio);

const bellSound = new Audio("assets/sounds/bell.mp3");

/* ======================================================
   FIREBASE INIT
====================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyDYFUR-K3pp9gsPQaP8n6P48tlgYfXs3Hw",
  authDomain: "pomodoro-focus-c5e65.firebaseapp.com",
  databaseURL: "https://pomodoro-focus-c5e65-default-rtdb.firebaseio.com",
  projectId: "pomodoro-focus-c5e65",
  storageBucket: "pomodoro-focus-c5e65.firebasestorage.app",
  messagingSenderId: "413357785500",
  appId: "1:413357785500:web:90a64ba732d8e90cb00859"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

/* ======================================================
   ROOM HANDLING
====================================================== */

const params = new URLSearchParams(window.location.search);
let roomId = params.get("room");

if (!roomId) {
  roomId = Math.random().toString(36).substring(2, 8);
  history.replaceState({}, "", `?room=${roomId}`);
}

const userId = Date.now() + "_" + Math.random().toString(36).slice(2);

/* ======================================================
   PRESENCE
====================================================== */

const userRef = database.ref(`rooms/${roomId}/users/${userId}`);
userRef.set({
  name: userName,
  joinedAt: Date.now()
});
userRef.onDisconnect().remove();

database.ref(`rooms/${roomId}/users`).on("value", snapshot => {
  const users = snapshot.val() || {};
  const box = document.getElementById("chatUsers");
  if (!box) return;

  box.innerHTML = "";
  Object.values(users).forEach(u => {
    const span = document.createElement("span");
    span.className = "user-pill";
    span.innerText = u.name;
    box.appendChild(span);
  });
});

/* ======================================================
   CHAT
====================================================== */

const msgRef = database.ref(`rooms/${roomId}/messages`);

msgRef.on("child_added", snapshot => {
  const msg = snapshot.val();
  const box = document.getElementById("chatMessages");
  if (!box) return;

  const p = document.createElement("p");

  if (msg.system) {
    p.className = "system";
    p.innerText = msg.text;
  } else {
    p.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;
  }

  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
});

function sendMessage() {
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;

  msgRef.push({
    name: userName,
    text: input.value.trim(),
    time: Date.now()
  });

  input.value = "";
}

function sendSystemMessage(text) {
  msgRef.push({
    name: "SYSTEM",
    text,
    time: Date.now(),
    system: true
  });
}

/* ======================================================
   TIMER
====================================================== */

let mode = "focus";
let focusMinutes = 25;
let breakMinutes = 5;

let minutes = focusMinutes;
let seconds = 0;
let running = false;
let interval = null;

const display = document.getElementById("timerDisplay");

function updateDisplay() {
  display.innerText =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function adjustTime(val) {
  if (running) return;
  minutes = Math.max(1, minutes + val);
  updateDisplay();
}

/* ======================================================
   SOUND SELECTION
====================================================== */

if (!localStorage.getItem("focusSound")) {
  localStorage.setItem("focusSound", "none");
}

const soundSelect = document.getElementById("soundSelect");
if (soundSelect) {
  soundSelect.value = localStorage.getItem("focusSound");

  soundSelect.addEventListener("change", () => {
    localStorage.setItem("focusSound", soundSelect.value);
  });
}

function openSound() {
  document.getElementById("soundDialog").style.display = "block";
}

function closeSound() {
  document.getElementById("soundDialog").style.display = "none";
}

function playFocusSound() {
  const choice = localStorage.getItem("focusSound");
  if (!choice || choice === "none") return;

  focusAudio.src = `assets/sounds/${choice}.mp3`;
  focusAudio.currentTime = 0;
  focusAudio.play().catch(() => {});
}

function stopFocusSound() {
  focusAudio.pause();
  focusAudio.currentTime = 0;
}

/* ======================================================
   TIMER CONTROL
====================================================== */

function startTimer() {
  if (running) return;

  running = true;
  interval = setInterval(tick, 1000);

  if (mode === "focus") {
    playFocusSound();
    sendSystemMessage(`🟢 Focus started by ${userName}`);
  } else {
    sendSystemMessage(`🌱 Break started by ${userName}`);
  }
}

function stopTimer() {
  if (!running) return;

  running = false;
  clearInterval(interval);
  stopFocusSound();

  sendSystemMessage(`⏸️ ${mode} paused by ${userName}`);
}

function tick() {
  if (seconds === 0) {
    if (minutes === 0) {
      clearInterval(interval);
      running = false;
      stopFocusSound();
      bellSound.play();
      return;
    }
    minutes--;
    seconds = 59;
  } else {
    seconds--;
  }
  updateDisplay();
}

/* ======================================================
   INVITE & REPORT
====================================================== */

function invite() {
  navigator.clipboard.writeText(window.location.href);
  alert("Invite link copied 🤍");
}

function goReport() {
  window.location.href = "report.html";
}

/* ======================================================
   INIT
====================================================== */

updateDisplay();
function enterPomodoro() {
  window.location.href = "focus.html";
}
