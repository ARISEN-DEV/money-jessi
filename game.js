const DENOMS = [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
// Colores de respaldo si falta la imagen en images/
const COLORS = { 2000: "#6a4c93", 1000: "#d1495b", 500: "#8d5a3b", 200: "#2e86ab", 100: "#c0392b", 50: "#e0a800", 20: "#6aa84f" };
const isCoin = (d) => d < 20;

function moneyImg(d) {
  const wrap = document.createElement("span");
  const img = new Image();
  img.alt = fmt(d);
  img.className = isCoin(d) ? "coin-img" : "bill-img";
  img.src = `images/${isCoin(d) ? "moneda" : "billete"}-${d}.jpg`;
  img.onerror = () => {
    const f = document.createElement("span");
    f.className = isCoin(d) ? "coin-img fallback" : "bill-img fallback";
    f.style.background = isCoin(d) ? "#c9a227" : COLORS[d];
    f.textContent = d;
    img.replaceWith(f);
  };
  wrap.appendChild(img);
  return wrap;
}
const CUSTOMER_BILLS = [2000, 1000, 500, 200, 100];
const EASY_AMOUNTS = [100, 120, 150, 200, 250, 300, 350, 400, 420, 450, 500, 550, 600, 700, 750, 800, 900, 950, 1000, 1200, 1500];

const $ = (id) => document.getElementById(id);
const fmt = (n) => "$" + n.toLocaleString("es");
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

let level = null;
let price = 0;
let paid = 0;
let change = 0;
let counts = {};
let answered = false;
let score = 0;
let streak = 0;

function newCustomer() {
  price = level === "facil" ? pick(EASY_AMOUNTS) : randInt(20, 1500);
  // El cliente paga con un billete que cubra el monto y sea mayor (para que haya vuelto)
  const options = CUSTOMER_BILLS.filter((b) => b > price);
  paid = pick(options.length ? options : [2000]);
  change = paid - price;
  counts = Object.fromEntries(DENOMS.map((d) => [d, 0]));
  answered = false;

  $("price").textContent = fmt(price);
  $("paid").textContent = fmt(paid);
  $("feedback").textContent = "";
  $("feedback").className = "";
  $("next").hidden = true;
  $("check").disabled = false;
  renderDenoms();
}

function renderDenoms() {
  const box = $("denoms");
  box.innerHTML = "";
  for (const d of DENOMS) {
    const row = document.createElement("div");
    row.className = "denom";
    row.innerHTML = `
      <span class="img-slot"></span>
      <span class="label ${isCoin(d) ? "coin" : ""}">${isCoin(d) ? "Moneda" : "Billete"} ${fmt(d)}</span>
      <span>
        <button data-d="${d}" data-delta="-1">-</button>
        <span class="qty" id="qty-${d}">${counts[d]}</span>
        <button data-d="${d}" data-delta="1">+</button>
      </span>`;
    row.querySelector(".img-slot").appendChild(moneyImg(d));
    box.appendChild(row);
  }
  updateTotal();
}

function updateTotal() {
  const total = DENOMS.reduce((s, d) => s + d * counts[d], 0);
  $("total").textContent = fmt(total);
  return total;
}

function changeCount(d, delta) {
  if (answered) return;
  counts[d] = Math.max(0, counts[d] + delta);
  $(`qty-${d}`).textContent = counts[d];
  updateTotal();
}

function checkAnswer() {
  const total = updateTotal();
  answered = true;
  $("check").disabled = true;
  const fb = $("feedback");
  if (total === change) {
    score++;
    streak++;
    fb.textContent = "¡Correcto! El vuelto era " + fmt(change) + ".";
    fb.className = "ok";
  } else {
    streak = 0;
    const diff = total - change;
    fb.textContent = `Incorrecto. El vuelto correcto era ${fmt(change)} (${fmt(paid)} - ${fmt(price)}). ` +
      (diff > 0 ? `Te pasaste por ${fmt(diff)}.` : `Te faltaron ${fmt(-diff)}.`);
    fb.className = "bad";
  }
  $("score").textContent = score;
  $("streak").textContent = streak;
  $("next").hidden = false;
}

function startGame(lvl) {
  level = lvl;
  score = 0;
  streak = 0;
  $("score").textContent = 0;
  $("streak").textContent = 0;
  $("level").textContent = lvl === "facil" ? "Fácil" : "Difícil";
  $("menu").hidden = true;
  $("game").hidden = false;
  newCustomer();
}

document.querySelectorAll("#menu button").forEach((b) =>
  b.addEventListener("click", () => startGame(b.dataset.level))
);
$("denoms").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) changeCount(Number(btn.dataset.d), Number(btn.dataset.delta));
});
$("check").addEventListener("click", checkAnswer);
$("clear").addEventListener("click", () => {
  if (answered) return;
  DENOMS.forEach((d) => (counts[d] = 0));
  renderDenoms();
});
$("next").addEventListener("click", newCustomer);
$("back").addEventListener("click", () => {
  $("game").hidden = true;
  $("menu").hidden = false;
});
