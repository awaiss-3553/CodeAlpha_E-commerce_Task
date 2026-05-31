import { api, money } from "./api.js";
import { setupNav } from "./auth.js";
import { loadCartBadge } from "./cart.js";

setupNav();
loadCartBadge();

const wrap = document.getElementById("ordersWrap");

function orderCard(o) {
  const div = document.createElement("div");
  div.className = "card";
  div.style.marginBottom = "12px";

  const itemsHtml = o.items.map(i =>
    `<li>${i.quantity} × ${i.product.title} — ${money(i.unitPrice)}</li>`
  ).join("");

  div.innerHTML = `
    <div class="row">
      <strong>Order #${o.id}</strong>
      <span class="muted small">${new Date(o.createdAt).toLocaleString()}</span>
    </div>
    <p class="muted small">Status: ${o.status}</p>
    <ul class="muted small">${itemsHtml}</ul>
    <div class="row">
      <span class="muted">Total</span>
      <strong>${money(o.totalAmount)}</strong>
    </div>
  `;
  return div;
}

async function load() {
  wrap.innerHTML = `<p class="muted">Loading...</p>`;
  try {
    const { orders } = await api("/api/orders/my", { auth: true });
    if (orders.length === 0) {
      wrap.innerHTML = `<p class="muted">No orders yet.</p><a class="btn primary" href="./index.html">Shop now</a>`;
      return;
    }
    wrap.innerHTML = "";
    orders.forEach(o => wrap.appendChild(orderCard(o)));
  } catch (e) {
    wrap.innerHTML = `<p class="muted">Login required to view orders.</p>
      <a class="btn primary" href="./login.html">Login</a>`;
  }
}

load();