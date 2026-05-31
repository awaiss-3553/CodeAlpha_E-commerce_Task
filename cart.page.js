import { api, money } from "./api.js";
import { setupNav } from "./auth.js";
import { loadCartBadge } from "./cart.js";

setupNav();
loadCartBadge();

const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const msg = document.getElementById("msg");

function render(cart) {
  if (cart.length === 0) {
    cartList.innerHTML = `<p class="muted">Cart is empty.</p>`;
    cartTotal.textContent = money(0);
    return;
  }

  let total = 0;
  cartList.innerHTML = "";

  cart.forEach((ci) => {
    total += ci.product.price * ci.quantity;

    const row = document.createElement("div");
    row.className = "cartItem";
    row.innerHTML = `
      <img class="cartThumb" src="${ci.product.imageUrl}" alt="${ci.product.title}">
      <div style="flex:1;">
        <div class="row">
          <strong>${ci.product.title}</strong>
          <button class="btn danger" data-remove>Remove</button>
        </div>
        <div class="row" style="margin-top:6px;">
          <span class="muted">${money(ci.product.price)} each</span>
          <input class="input qty" type="number" min="1" value="${ci.quantity}">
        </div>
      </div>
    `;

    row.querySelector("[data-remove]").onclick = async () => {
      await api("/api/cart/update", { method: "POST", body: { productId: ci.productId, quantity: 0 }, auth: true });
      load();
    };

    row.querySelector("input").onchange = async (e) => {
      const q = Math.max(1, Number(e.target.value || 1));
      await api("/api/cart/update", { method: "POST", body: { productId: ci.productId, quantity: q }, auth: true });
      load();
    };

    cartList.appendChild(row);
  });

  cartTotal.textContent = money(total);
}

async function load() {
  msg.textContent = "";
  try {
    const { cart } = await api("/api/cart", { auth: true });
    render(cart);
    loadCartBadge();
  } catch (e) {
    cartList.innerHTML = `<p class="muted">Login required to view cart.</p>
      <a class="btn primary" href="./login.html">Login</a>`;
    cartTotal.textContent = money(0);
    msg.textContent = e.message;
  }
}

load();