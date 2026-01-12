// ===============================
// AUTO-SAVE INPUT FIELDS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("input").forEach((input) => {
    const label = input.previousElementSibling;
    if (!label) return;

    const key = label.innerText.trim();

    // Load saved value
    const savedValue = localStorage.getItem(key);
    if (savedValue) {
      input.value = savedValue;
    }

    // Save on typing
    input.addEventListener("input", () => {
      localStorage.setItem(key, input.value);
    });
  });
});

// ===============================
// JOURNAL PAGE LOGIC
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const journalForm = document.getElementById("journalForm");
  if (!journalForm) return; // prevent errors on other pages

  const dateTimeInput = document.getElementById("dateTime");
  const reflectiveContainer = document.getElementById("reflectiveQuestions");

  const reflectiveQs = [
    "How would you describe your day?",
    "What emotion stayed with you the longest?",
    "What are you grateful for today?"
  ];

  const now = new Date();
  const options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  dateTimeInput.value = now.toLocaleString("en-US", options);

  // Generate reflective questions
  reflectiveQs.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "field-box";
    div.innerHTML = `
      <label>${q}</label>
      <input type="text" id="reflective${i}" placeholder="Your answer..." />
    `;
    reflectiveContainer.appendChild(div);
  });

  journalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];

    let stepAnswers = {};
    if (localStorage.getItem("onboardingCompleted") !== "true") {
      stepAnswers = {
        step1: JSON.parse(localStorage.getItem("step1")) || {},
        step2: JSON.parse(localStorage.getItem("step2")) || {},
        step3: JSON.parse(localStorage.getItem("step3")) || {}
      };
      localStorage.setItem("onboardingCompleted", "true");
    }

    const reflectiveAnswers = {};
    reflectiveQs.forEach((q, i) => {
      reflectiveAnswers[q] =
        document.getElementById(`reflective${i}`).value;
    });

    entries.push({
      date: now.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      month: now.toLocaleString("en-US", {
        month: "long",
        year: "numeric"
      }),
      stepAnswers: stepAnswers,
      journalText: document.getElementById("journalText").value,
      reflectiveAnswers: reflectiveAnswers
    });

    localStorage.setItem("journalEntries", JSON.stringify(entries));

    alert("Your entry has been saved 🌿");
    journalForm.reset();
    dateTimeInput.value = now.toLocaleString("en-US", options);
  });
});

// ===============================
// NOTEBOOK SLIDE (if used)
// ===============================
function openNotebook() {
  const cover = document.getElementById("coverPage");
  const journal = document.getElementById("journalPage");
  if (cover && journal) {
    cover.classList.add("slide-out");
    journal.classList.add("slide-in");
  }
}

// ===============================
// DAILY AFFIRMATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const affirmationBox = document.getElementById("dailyAffirmation");
  if (!affirmationBox) return;

  const affirmations = [
    "Small progress still counts.",
    "You are allowed to move at your own pace.",
    "Nothing needs to be perfect today.",
    "Pause. You’re doing enough.",
    "Gentle effort is still effort.",
    "It’s okay to take things slowly.",
    "You don’t have it all figured out — and that’s okay."
  ];

  const today = new Date().toDateString();
  const index =
    today.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    affirmations.length;

  affirmationBox.textContent = affirmations[index];
});

