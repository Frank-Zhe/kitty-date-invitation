const steps = [...document.querySelectorAll(".stage")];
const heartLayer = document.querySelector("#heartLayer");
const choiceZone = document.querySelector("#choiceZone");
const yesBtn = document.querySelector("#yesBtn");
const noBtn = document.querySelector("#noBtn");
const dateTimeInput = document.querySelector("#dateTime");
const createInviteBtn = document.querySelector("#createInviteBtn");
const moodMeter = document.querySelector("#moodMeter");

const state = {
  activity: null,
  food: null,
  time: null,
  surprise: "见面时会掉落一枚只属于你的粉色小惊喜",
};

const noTexts = ["先不要", "再想想嘛", "系统不允许", "跑走咯", "点愿意嘛", "拒绝键害羞了"];

const activityNotes = [
  "收到！今天的小程序已经开始冒粉色小花。",
  "这个选择很会，心动值偷偷加二十。",
  "约会路线已保存，系统判断：非常可爱。",
];

const foodNotes = [
  "菜单已确认，甜蜜指数继续上升。",
  "这一口我先记下，绝不让你饿着。",
  "选得漂亮，这顿饭已经开始偷偷变香了。",
];

const surprises = [
  "我会提前查好拍照好看的位置",
  "你可以拥有当天点单优先权",
  "附赠一杯按你口味来的饮料",
  "路上看到漂亮小店就陪你进去逛",
  "见面第一件事：认真夸你今天好看",
  "准备一张像素贴纸风合照纪念",
  "如果天气好，就加一段慢慢走的路",
];

function showStep(stepName) {
  steps.forEach((step) => {
    step.classList.toggle("active", step.dataset.step === stepName);
  });

  if (stepName === "time") {
    updateMood(78);
  }

  if (stepName === "result") {
    updateInvite();
  }
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function createFloatingCharm(x, y) {
  const charm = document.createElement("span");
  const charms = ["♥", "♡", "🎀", "✦"];
  charm.className = "heart";
  charm.textContent = randomFrom(charms);
  charm.style.left = `${x}px`;
  charm.style.top = `${y}px`;
  charm.style.setProperty("--drift", `${Math.random() * 90 - 45}px`);
  heartLayer.appendChild(charm);
  window.setTimeout(() => charm.remove(), 1700);
}

function heartBurst(origin) {
  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  for (let i = 0; i < 18; i += 1) {
    window.setTimeout(() => {
      createFloatingCharm(x + Math.random() * 80 - 40, y + Math.random() * 30 - 15);
    }, i * 28);
  }
}

function moveNoButton(event) {
  const zoneRect = choiceZone.getBoundingClientRect();
  const buttonRect = noBtn.getBoundingClientRect();
  const maxX = Math.max(0, zoneRect.width - buttonRect.width);
  const maxY = Math.max(0, zoneRect.height - buttonRect.height);
  const pointerX = event?.clientX ?? zoneRect.left + zoneRect.width / 2;
  const pointerY = event?.clientY ?? zoneRect.top + zoneRect.height / 2;

  let best = { x: 0, y: 0, distance: -1 };

  for (let i = 0; i < 18; i += 1) {
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    const centerX = zoneRect.left + x + buttonRect.width / 2;
    const centerY = zoneRect.top + y + buttonRect.height / 2;
    const distance = Math.hypot(centerX - pointerX, centerY - pointerY);

    if (distance > best.distance) {
      best = { x, y, distance };
    }
  }

  noBtn.style.left = `${best.x}px`;
  noBtn.style.top = `${best.y}px`;
  noBtn.style.right = "auto";
  noBtn.textContent = randomFrom(noTexts);
}

function setMinDateTime() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  dateTimeInput.min = local.toISOString().slice(0, 16);
}

function updateMood(value) {
  moodMeter.style.width = `${value}%`;
}

function selectOption(card) {
  const kind = card.dataset.kind;
  const icon = card.dataset.icon;
  const value = card.dataset.value;
  const feedback = document.querySelector(`#${kind}Feedback`);
  const group = document.querySelectorAll(`[data-kind="${kind}"]`);

  group.forEach((item) => item.classList.toggle("selected", item === card));
  state[kind] = { icon, value };
  feedback.textContent = kind === "activity" ? randomFrom(activityNotes) : randomFrom(foodNotes);
  heartBurst(card);

  window.setTimeout(() => {
    showStep(kind === "activity" ? "food" : "time");
  }, 620);
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][date.getDay()];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  return `${year}年${month}月${day}日 ${weekday} ${hour}:00`;
}

function validateTime() {
  state.time = dateTimeInput.value;
  createInviteBtn.disabled = !state.time;

  if (state.time) {
    document.querySelector("#timeHint").textContent = `${formatDateTime(state.time)}，已经被系统用粉色笔圈起来啦。`;
    updateMood(92);
  }
}

function updateInvite() {
  if (!state.activity || !state.food || !state.time) return;

  document.querySelector("#resultActivity").textContent = `${state.activity.icon} ${state.activity.value}`;
  document.querySelector("#resultFood").textContent = `${state.food.icon} ${state.food.value}`;
  document.querySelector("#resultTime").textContent = formatDateTime(state.time);
  document.querySelector("#resultSurprise").textContent = state.surprise;
}

function invitationText() {
  return [
    "Dating with me~",
    `约会活动：${state.activity.icon} ${state.activity.value}`,
    `想吃美食：${state.food.icon} ${state.food.value}`,
    `约会时间：${formatDateTime(state.time)}`,
    `隐藏惊喜：${state.surprise}`,
    "我会准时来接你，带好胃口，也带好路线。",
  ].join("\n");
}

yesBtn.addEventListener("click", () => {
  heartBurst(yesBtn);
  window.setTimeout(() => showStep("activity"), 480);
});

noBtn.addEventListener("pointerenter", moveNoButton);
noBtn.addEventListener("focus", moveNoButton);
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton(event);
  heartBurst(noBtn);
});
noBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton(event.touches[0]);
});
choiceZone.addEventListener("pointermove", (event) => {
  const rect = noBtn.getBoundingClientRect();
  const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
  if (distance < 120) moveNoButton(event);
});

document.querySelectorAll(".option-card").forEach((card) => {
  card.addEventListener("click", () => selectOption(card));
});

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => showStep(button.dataset.back));
});

dateTimeInput.addEventListener("change", validateTime);
dateTimeInput.addEventListener("input", validateTime);

document.querySelector("#luckyBtn").addEventListener("click", (event) => {
  state.surprise = randomFrom(surprises);
  document.querySelector("#luckyFeedback").textContent = `抽到了：${state.surprise}`;
  updateMood(100);
  heartBurst(event.currentTarget);
});

createInviteBtn.addEventListener("click", () => {
  state.time = dateTimeInput.value;
  if (!state.time) return;
  heartBurst(createInviteBtn);
  window.setTimeout(() => showStep("result"), 420);
});

document.querySelector("#copyBtn").addEventListener("click", async () => {
  const feedback = document.querySelector("#copyFeedback");
  try {
    await navigator.clipboard.writeText(invitationText());
    feedback.textContent = "小请柬已经复制好啦，可以留作甜甜的小纪念。";
  } catch {
    feedback.textContent = "复制没有成功，不过可以直接截图这张小请柬。";
  }
});

document.querySelector("#printBtn").addEventListener("click", () => {
  window.print();
});

document.querySelector("#restartBtn").addEventListener("click", () => {
  showStep("intro");
  updateMood(0);
});

setMinDateTime();
