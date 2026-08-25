/* Shared helpers used by every Royal Aroma page */
(function () {
  const TOKEN_KEY = "ra_token";
  const USER_KEY = "ra_user";
  const CART_KEY = "ra_cart";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
  }

  function cartCount() {
    return getCart().reduce(function (sum, item) {
      return sum + Number(item.quantity || 0);
    }, 0);
  }

  function updateCartCount() {
    document.querySelectorAll(".cart-count").forEach(function (el) {
      el.textContent = String(cartCount());
    });
  }

  async function api(path, options) {
    const settings = options || {};
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      settings.headers || {}
    );
    const token = getToken();
    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    const response = await fetch(path, Object.assign({}, settings, { headers: headers }));
    const data = await response.json().catch(function () {
      return {};
    });
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }
    return data;
  }

  function initials(name) {
    return (name || "G")
      .split(" ")
      .map(function (part) { return part.charAt(0); })
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function renderAuth() {
    const area = document.getElementById("authArea");
    if (!area) return;

    const user = getUser();
    if (!user) {
      area.innerHTML = '<a class="login-link" href="login.html">Login / Register</a>';
      return;
    }

    const extraAdmin = user.role === "admin"
      ? '<a href="admin.html">Admin Dashboard</a>'
      : "";

    area.innerHTML =
      '<button class="profile-btn" id="profileBtn" type="button" aria-label="Open profile">' +
        initials(user.name) +
      "</button>" +
      '<div class="profile-menu" id="profileMenu">' +
        '<div class="profile-name">' + user.name + "</div>" +
        '<div class="profile-email">' + user.email + "</div>" +
        extraAdmin +
        '<a href="orders.html">My Orders</a>' +
        '<button type="button" id="logoutBtn">Logout</button>' +
      "</div>";

    const btn = document.getElementById("profileBtn");
    const menu = document.getElementById("profileMenu");
    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      menu.classList.toggle("open");
    });
    document.addEventListener("click", function () {
      menu.classList.remove("open");
    });
    menu.addEventListener("click", function (event) {
      event.stopPropagation();
    });
    document.getElementById("logoutBtn").addEventListener("click", logout);
  }

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch (error) {
      // Still clear the local session even if the network call fails.
    }
    clearSession();
    window.location.href = "index.html";
  }

  function setupNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }
  }

  window.RoyalAroma = {
    api: api,
    getUser: getUser,
    getToken: getToken,
    setSession: setSession,
    clearSession: clearSession,
    getCart: getCart,
    saveCart: saveCart,
    updateCartCount: updateCartCount,
    logout: logout
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.querySelector('link[rel="icon"]')) {
      const icon = document.createElement("link");
      icon.rel = "icon";
      icon.href = "images/hero.svg";
      document.head.appendChild(icon);
    }
    setupNav();
    renderAuth();
    updateCartCount();
  });
})();
