// ================================
// CART STORAGE
// ================================

window.getCart = function () {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

window.saveCart = function (cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// ================================
// ADD TO CART
// ================================

window.addToCart = function (product) {
  let cart = getCart();
  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  updateCartCount();
  alert("Added to cart 🧶");
};

// ================================
// CART COUNT
// ================================

window.updateCartCount = function () {
  const el = document.getElementById("cartCount");
  if (!el) return;

  const count = getCart().reduce((s, i) => s + i.qty, 0);
  el.textContent = count;
};

// ================================
// TOTAL
// ================================

window.calculateTotal = function () {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
};

// ================================
// RENDER CART
// ================================

window.renderCart = function () {
  const cart = getCart();
  const container = document.getElementById("cartContainer");
  const totalEl = document.getElementById("cartTotal");

  updateCartCount();

  if (!container) return;

  if (!cart.length) {
    container.innerHTML = "<p>Your cart is empty 😔</p>";
    if (totalEl) totalEl.textContent = "₹ 0";
    return;
  }

  container.innerHTML = "";

  cart.forEach(item => {
    container.innerHTML += `
      <div class="cart-row">
        <span>${item.name} – ₹ ${item.price} × ${item.qty}</span>
        <button onclick="removeItem('${item.id}')">✕</button>
      </div>
    `;
  });

  if (totalEl) totalEl.textContent = `₹ ${calculateTotal()}`;
};

// ================================
// REMOVE ITEM
// ================================

window.removeItem = function (id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
};

// ================================
// INIT
// ================================

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
});

// ================================
// PAY NOW (UPI)
// ================================

window.payNow = function () {
  const cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty");
    return;
  }

  const total = calculateTotal();
  const orderText = cart.map(i => `${i.name} x ${i.qty}`).join(", ");

  // ✅ YOUR REAL UPI ID
  const upiId = "kunal@okaxis";
  const merchantName = "Soft Stitch Studio";

  const note = encodeURIComponent(
    `Order: ${orderText} | Total ₹${total}`
  );

  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${total}&cu=INR&tn=${note}`;

  // Save order snapshot (for reference)
  localStorage.setItem(
    "lastOrder",
    JSON.stringify({
      items: cart,
      total: total,
      paidVia: "UPI",
      time: new Date().toISOString()
    })
  );

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // 📱 Open UPI app directly
    window.location.href = upiUrl;
  } else {
    // 💻 Show QR for desktop
    showUpiQr(upiUrl, total);
  }
};

// ================================
// QR MODAL
// ================================

function showUpiQr(upiUrl, amount) {
  const qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
    encodeURIComponent(upiUrl);

  const modal = document.createElement("div");
  modal.id = "upiModal";
  modal.style = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.6);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:9999;
  `;

  modal.innerHTML = `
    <div style="background:#fff;padding:24px;border-radius:16px;text-align:center;max-width:320px;width:100%;">
      <h3>Pay ₹ ${amount}</h3>
      <p>Scan with any UPI app</p>
      <img src="${qrUrl}" style="width:100%;border-radius:12px;margin:12px 0;" />
      <button onclick="confirmPayment()" style="padding:10px 18px;border:none;border-radius:8px;background:#000;color:#fff;">
        I have paid
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

// ================================
// PAYMENT CONFIRM
// ================================

window.confirmPayment = function () {
  const modal = document.getElementById("upiModal");
  if (modal) modal.remove();

  // Clear cart
  localStorage.removeItem("cart");

  // Reset cart count
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) cartCountEl.textContent = "0";

  // Redirect
  window.location.href = "order-confirmation.html";
};
