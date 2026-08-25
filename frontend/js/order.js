document.addEventListener("DOMContentLoaded", function () {
  const card = document.getElementById("confirmCard");
  const raw = localStorage.getItem("ra_last_order");

  if (!raw) {
    card.innerHTML =
      "<h1>No recent order found</h1>" +
      "<p>Place an order from the cart to see confirmation details.</p>" +
      '<p style="margin-top:18px"><a class="btn btn-gold" href="index.html">Back to Home</a> ' +
      '<a class="btn btn-outline" href="menu.html">Continue Shopping</a></p>';
    return;
  }

  const order = JSON.parse(raw);
  const rows = order.items.map(function (item) {
    return (
      "<tr><td>" + item.name + "</td><td>" + item.quantity + "</td><td>₹" +
      item.price + "</td><td>₹" + (item.price * item.quantity) + "</td></tr>"
    );
  }).join("");

  card.innerHTML =
    "<h1>Order successful</h1>" +
    "<p>Thank you, <strong>" + order.customerName + "</strong>. Your vegetarian feast is with our kitchen.</p>" +
    "<p><strong>Order number:</strong> " + String(order._id).slice(-8).toUpperCase() + "</p>" +
    "<p><strong>Order date:</strong> " + new Date(order.orderDate).toLocaleString() + "</p>" +
    "<p><strong>Order status:</strong> " + order.status + "</p>" +
    '<table class="order-table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>' +
    rows +
    "</tbody></table>" +
    '<p class="price">Total amount: ₹' + order.totalAmount + "</p>" +
    '<p style="margin-top:18px"><a class="btn btn-gold" href="index.html">Back to Home</a> ' +
    '<a class="btn btn-outline" href="menu.html">Continue Shopping</a></p>';
});
