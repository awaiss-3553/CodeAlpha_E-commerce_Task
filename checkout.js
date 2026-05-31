import { api, money } from "./api.js";
import { setupNav } from "./auth.js";
import { loadCartBadge } from "./cart.js";

setupNav();
loadCartBadge();

const btn = document.getElementById("placeOrderBtn");
const msg = document.getElementById("msg");

btn.onclick = async () => {
  msg.textContent = "Placing order...";
  try {
    const { order } = await api("/api/orders", { method: "POST", auth: true });
    msg.textContent = `Order placed: #${order.id} • Total: ${money(order.totalAmount)}`;
    loadCartBadge();
    setTimeout(() => location.href = "./orders.html", 900);
  } catch (e) {
    msg.textContent = `Checkout failed: ${e.message} (Login required)`;
  }
};