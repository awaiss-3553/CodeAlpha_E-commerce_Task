import { api } from "./api.js";

export async function loadCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  try {
    const { cart } = await api("/api/cart", { auth:true });
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    badge.textContent = String(count);
  } catch {
    badge.textContent = "0";
  }
}