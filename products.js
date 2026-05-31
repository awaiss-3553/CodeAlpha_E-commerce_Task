import { api, money } from "./api.js";
import { setupNav } from "./auth.js";
import { loadCartBadge } from "./cart.js";

setupNav();
loadCartBadge();

const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const resultsText = document.getElementById("resultsText");

let state = { q: "", category: "", page: 1, limit: 8, total: 0 };

function productCard(p) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img class="product-img" src="${p.imageUrl}" alt="${p.title}">
    <h3>${p.title}</h3>
    <p class="muted">${p.description}</p>
    <div class="row">
      <strong>${money(p.price)}</strong>
      <span class="muted">Stock: ${p.stock}</span>
    </div>
    <div class="row" style="margin-top:10px;">
      <a class="btn" href="./product.html?id=${p.id}">Details</a>
      <button class="btn primary" ${p.stock<=0 ? "disabled":""}>Add to Cart</button>
    </div>
    <p class="muted small" id="msg-${p.id}"></p>
  `;

  const btn = div.querySelector("button");
  btn.addEventListener("click", async () => {
    const msg = div.querySelector(`#msg-${p.id}`);
    msg.textContent = "";
    try {
      await api("/api/cart/add", { method: "POST", body: { productId: p.id, quantity: 1 }, auth: true });
      msg.textContent = "Added to cart.";
      loadCartBadge();
    } catch (e) {
      msg.textContent = "Login required to add to cart.";
    }
  });

  return div;
}

function renderPagination() {
  const pages = Math.ceil(state.total / state.limit) || 1;
  const wrap = document.createElement("div");
  wrap.className = "row";
  wrap.style.marginTop = "12px";

  const prev = document.createElement("button");
  prev.className = "btn";
  prev.textContent = "Prev";
  prev.disabled = state.page <= 1;

  const next = document.createElement("button");
  next.className = "btn";
  next.textContent = "Next";
  next.disabled = state.page >= pages;

  const info = document.createElement("div");
  info.className = "muted small";
  info.textContent = `Page ${state.page} / ${pages}`;

  prev.onclick = () => { state.page--; load(); };
  next.onclick = () => { state.page++; load(); };

  wrap.appendChild(prev);
  wrap.appendChild(info);
  wrap.appendChild(next);

  grid.parentElement.appendChild(wrap);
}

async function load() {
  grid.innerHTML = `<p class="muted">Loading...</p>`;
  // remove old pagination if any
  [...grid.parentElement.querySelectorAll(".row")].forEach((el) => {
    if (el.textContent.includes("Page ")) el.remove();
  });

  const qs = new URLSearchParams({
    q: state.q,
    category: state.category,
    page: String(state.page),
    limit: String(state.limit)
  });

  const data = await api(`/api/products?${qs.toString()}`);
  state.total = data.total;

  // categories
  categorySelect.innerHTML = `<option value="">All Categories</option>`;
  data.categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    if (c === state.category) opt.selected = true;
    categorySelect.appendChild(opt);
  });

  resultsText.textContent = `${data.total} product(s)`;

  grid.innerHTML = "";
  data.items.forEach((p) => grid.appendChild(productCard(p)));
  renderPagination();
}

searchInput.addEventListener("input", () => {
  state.q = searchInput.value.trim();
  state.page = 1;
  load();
});
categorySelect.addEventListener("change", () => {
  state.category = categorySelect.value;
  state.page = 1;
  load();
});

load().catch((e) => {
  grid.innerHTML = `<p class="muted">Error: ${e.message}</p>
  <p class="muted small">Make sure backend is running on http://localhost:4000</p>`;
});