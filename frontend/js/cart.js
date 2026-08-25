document.addEventListener("DOMContentLoaded", function () {
  const list = document.getElementById("cartItems");
  const empty = document.getElementById("emptyCart");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const checkoutMsg = document.getElementById("checkoutMsg");

  function money(value) {
    return "₹" + Number(value).toFixed(0);
  }

  function render() {
    const cart = RoyalAroma.getCart();
    if (!cart.length) {
      list.innerHTML = "";
      empty.style.display = "block";
      subtotalEl.textContent = money(0);
      totalEl.textContent = money(0);
      return;
    }

    empty.style.display = "none";
    const subtotal = cart.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);

    list.innerHTML = cart.map(function (item, index) {
      return (
        '<article class="cart-item">' +
          '<img src="' + item.image + '" alt="' + item.name + '" onerror="this.onerror=null;this.src=\'images/hero.svg\'">' +
          "<div>" +
            "<h3>" + item.name + "</h3>" +
            '<p class="price">' + money(item.price) + "</p>" +
            '<div class="qty-box">' +
              '<button type="button" data-dec="' + index + '">−</button>' +
              "<span>" + item.quantity + "</span>" +
              '<button type="button" data-inc="' + index + '">+</button>' +
            "</div>" +
          "</div>" +
          '<div>' +
            "<strong>" + money(item.price * item.quantity) + "</strong><br>" +
            '<button class="btn btn-danger btn-small" type="button" data-del="' + index + '" style="margin-top:8px">Remove</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");

    subtotalEl.textContent = money(subtotal);
    totalEl.textContent = money(subtotal);
  }

  list.addEventListener("click", function (event) {
    const cart = RoyalAroma.getCart();
    const inc = event.target.closest("[data-inc]");
    const dec = event.target.closest("[data-dec]");
    const del = event.target.closest("[data-del]");

    if (inc) {
      cart[Number(inc.getAttribute("data-inc"))].quantity += 1;
    }
    if (dec) {
      const i = Number(dec.getAttribute("data-dec"));
      cart[i].quantity -= 1;
      if (cart[i].quantity < 1) cart.splice(i, 1);
    }
    if (del) {
      cart.splice(Number(del.getAttribute("data-del")), 1);
    }
    RoyalAroma.saveCart(cart);
    render();
  });

  document.getElementById("clearCartBtn").addEventListener("click", function () {
    RoyalAroma.saveCart([]);
    render();
  });

  document.getElementById("checkoutBtn").addEventListener("click", async function () {
    checkoutMsg.classList.remove("show");
    const cart = RoyalAroma.getCart();
    if (!cart.length) {
      checkoutMsg.textContent = "Your cart is empty.";
      checkoutMsg.classList.add("show");
      return;
    }

    const user = RoyalAroma.getUser();
    if (!user) {
      sessionStorage.setItem("ra_next", "cart.html");
      window.location.href = "login.html";
      return;
    }

    try {
      const data = await RoyalAroma.api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map(function (item) {
            return { menuItemId: item.menuItemId, quantity: item.quantity, name: item.name };
          })
        })
      });
      // Live Location Button Logic
document.getElementById('detectLocationBtn')?.addEventListener('click', () => {
  const status = document.getElementById('locStatus');
  const addressField = document.getElementById('custAddress');

  if (!navigator.geolocation) {
    status.innerText = "Geolocation not supported by your browser.";
    return;
  }

  status.style.color = "#d4af37";
  status.innerText = "Fetching location...";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      document.getElementById('custLat').value = lat;
      document.getElementById('custLng').value = lng;

      try {
        // Free Reverse Geocoding to get full address automatically
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          addressField.value = data.display_name;
        }
      } catch (err) {
        console.log("Could not reverse geocode, lat/lng saved.");
      }

      status.style.color = "#28a745";
      status.innerText = `✅ GPS Captured (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    },
    (err) => {
      status.style.color = "#ff4d4d";
      status.innerText = "Permission denied. Please enter address manually.";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});
      localStorage.setItem("ra_last_order", JSON.stringify(data.order));
      RoyalAroma.saveCart([]);
      window.location.href = "order-confirmation.html";
    } catch (error) {
      checkoutMsg.textContent = error.message;
      checkoutMsg.classList.add("show");
    }
  });

  render();
});
