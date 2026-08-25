document.addEventListener("DOMContentLoaded", async function () {
  const categories = [
    "All",
    "Starters",
    "Indian Main Course",
    "Punjabi",
    "Gujarati",
    "Italian",
    "Chinese",
    "Desserts",
    "Drinks"
  ];

  let items = [];
  let activeCategory = "All";
  const grid = document.getElementById("menuGrid");
  const empty = document.getElementById("emptyMenu");
  const filters = document.getElementById("categoryFilters");
  const searchInput = document.getElementById("searchInput");

  filters.innerHTML = categories.map(function (cat, index) {
    return '<button class="filter-btn' + (index === 0 ? " active" : "") + '" type="button" data-cat="' + cat + '">' + cat + "</button>";
  }).join("");

  filters.addEventListener("click", function (event) {
    const btn = event.target.closest(".filter-btn");
    if (!btn) return;
    activeCategory = btn.getAttribute("data-cat");
    document.querySelectorAll(".filter-btn").forEach(function (el) {
      el.classList.toggle("active", el === btn);
    });
    render();
  });

  searchInput.addEventListener("input", render);

  try {
    const data = await RoyalAroma.api("/api/menu");
    items = data.items || [];
    render();
  } catch (error) {
    grid.innerHTML = "";
    empty.style.display = "block";
    empty.textContent = error.message || "Unable to load the menu. Start the Node.js server first.";
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const visible = items.filter(function (item) {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchText =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchCat && matchText && item.available !== false;
    });

    if (!visible.length) {
      grid.innerHTML = "";
      empty.style.display = "block";
      return;
    }

    empty.style.display = "none";
    grid.innerHTML = visible.map(function (item) {
      return (
        '<article class="menu-card">' +
          '<img src="' + item.image + '" alt="' + item.name + '" onerror="this.onerror=null;this.src=\'images/hero.svg\'">' +
          '<div class="card-body">' +
            '<span class="badge">' + item.category + "</span>" +
            "<h3>" + item.name + "</h3>" +
            "<p>" + item.description + "</p>" +
            '<p class="price">₹' + item.price + "</p>" +
            '<button class="btn btn-gold btn-small" type="button" data-add="' + item._id + '">Add to Cart</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  grid.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.getAttribute("data-add");
    const item = items.find(function (row) { return String(row._id) === String(id); });
    if (!item) return;

    const cart = RoyalAroma.getCart();
    const existing = cart.find(function (row) { return row.menuItemId === id; });
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      });
    }
    RoyalAroma.saveCart(cart);
    btn.textContent = "Added";
    setTimeout(function () {
      btn.textContent = "Add to Cart";
    }, 800);
  });
});
