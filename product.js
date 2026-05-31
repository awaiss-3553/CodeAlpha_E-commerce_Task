import { api, money } from "./api.js";
import { setupNav } from "./auth.js";
import { loadCartBadge } from "./cart.js";

setupNav();
loadCartBadge();

const wrap = document.getElementById("productWrap");
const id = new URLSearchParams(location.search).get("id");

async function init() {
  wrap.innerHTML = `<p class="muted">Loading...</p>`;
  const { product } = await api(`/api/products/${id}`);

  wrap.innerHTML = `
    <div class="card">
      <img class="product-img" style="height:260px;" src="${product.imageUrl}" alt="${product.title}">
      <h1 style="margin:10px 0 6px;">${product.title}</h1>
      <p class="muted">${product.description}</p>
      <div class="row">
        <strong style="font-size:20px;">${money(product.price)}</strong>
        <span class="muted">Stock: ${product.stock}</span>
      </div>

      <div class="row" style="margin-top:12px;">
        <input id="qty" class="input qty" type="number" min="1" value="1" />
        <button id="addBtn" class="btn primary" ${product.stock<=0 ? "disabled":""}>Add to Cart</button>
      </div>
      <p class="muted small" id="msg"></p>
    </div>
  `;

  document.getElementById("addBtn").onclick = async () => {
    const q = Math.max(1, Number(document.getElementById("qty").value || 1));
    const msg = document.getElementById("msg");
    msg.textContent = "";
    try {
      await api("/api/cart/add", { method: "POST", body: { productId: product.id, quantity: q }, auth: true });
      msg.textContent = "Added to cart.";
      loadCartBadge();
    } catch {
      msg.textContent = "Login required to add to cart.";
    }
  };
}

init().catch((e) => {
  wrap.innerHTML = `<p class="muted">Error: ${e.message}</p>`;
});