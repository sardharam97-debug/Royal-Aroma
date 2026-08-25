document.addEventListener("DOMContentLoaded", async function () {
  const user = RoyalAroma.getUser();
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  const errorBox = document.getElementById("adminError");
  const successBox = document.getElementById("adminSuccess");
  const statuses = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Completed", "Cancelled"];

  function flash(type, text) {
    errorBox.classList.remove("show");
    successBox.classList.remove("show");
    const box = type === "error" ? errorBox : successBox;
    box.textContent = text;
    box.classList.add("show");
  }

  document.querySelectorAll(".nav-link").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".nav-link").forEach(function (el) { el.classList.remove("active"); });
      document.querySelectorAll(".panel").forEach(function (el) { el.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById(btn.getAttribute("data-panel")).classList.add("active");
      document.getElementById("panelTitle").textContent = btn.textContent;
    });
  });

  async function loadStats() {
    const stats = await RoyalAroma.api("/api/orders/stats");
    document.getElementById("statUsers").textContent = stats.totalUsers;
    document.getElementById("statMenu").textContent = stats.totalMenuItems;
    document.getElementById("statOrders").textContent = stats.totalOrders;
    document.getElementById("statRevenue").textContent = "₹" + stats.totalRevenue;
  }

  async function loadUsers() {
    const data = await RoyalAroma.api("/api/auth/users");
    document.getElementById("usersTable").innerHTML = data.users.map(function (row) {
      return (
        "<tr><td>" + row.name + "</td><td>" + row.email + "</td><td>" +
        new Date(row.createdAt).toLocaleString() + "</td></tr>"
      );
    }).join("") || '<tr><td colspan="3">No customers yet.</td></tr>';
  }

  async function loadMenu() {
    const data = await RoyalAroma.api("/api/menu");
    document.getElementById("menuTable").innerHTML = data.items.map(function (item) {
      return (
        "<tr>" +
          "<td>" + item.name + "<br><small>" + item.description + "</small></td>" +
          "<td>" + item.category + "</td>" +
          "<td>₹" + item.price + "</td>" +
          "<td>" +
            '<button class="btn btn-outline btn-small" type="button" data-edit="' + item._id + '">Edit</button> ' +
            '<button class="btn btn-danger btn-small" type="button" data-delete="' + item._id + '">Delete</button>' +
          "</td>" +
        "</tr>"
      );
    }).join("");

    document.getElementById("menuTable").onclick = async function (event) {
      const editBtn = event.target.closest("[data-edit]");
      const deleteBtn = event.target.closest("[data-delete]");
      if (editBtn) {
        const item = data.items.find(function (row) {
          return String(row._id) === String(editBtn.getAttribute("data-edit"));
        });
        document.getElementById("menuId").value = item._id;
        document.getElementById("itemName").value = item.name;
        document.getElementById("itemPrice").value = item.price;
        document.getElementById("itemCategory").value = item.category;
        document.getElementById("itemImage").value = item.image;
        document.getElementById("itemDescription").value = item.description;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (deleteBtn) {
        if (deleteBtn.getAttribute("data-ready") !== "1") {
          deleteBtn.setAttribute("data-ready", "1");
          deleteBtn.textContent = "Confirm delete";
          return;
        }
        try {
          await RoyalAroma.api("/api/menu/" + deleteBtn.getAttribute("data-delete"), { method: "DELETE" });
          flash("success", "Menu item deleted.");
          await refresh();
        } catch (error) {
          flash("error", error.message);
        }
      }
    };
  }

  async function loadOrders() {
    const data = await RoyalAroma.api("/api/orders");
    document.getElementById("ordersTable").innerHTML = data.orders.map(function (order) {
      const items = order.items.map(function (item) {
        return item.name + " × " + item.quantity;
      }).join("<br>");
      const options = statuses.map(function (status) {
        return '<option value="' + status + '"' + (status === order.status ? " selected" : "") + ">" + status + "</option>";
      }).join("");
      return (
        "<tr>" +
          "<td>" + String(order._id).slice(-8).toUpperCase() + "</td>" +
          "<td>" + order.customerName + "<br><small>" + order.customerEmail + "</small></td>" +
          "<td>" + items + "</td>" +
          "<td>₹" + order.totalAmount + "</td>" +
          "<td>" + new Date(order.orderDate).toLocaleString() + "</td>" +
          "<td><select data-status='" + order._id + "'>" + options + "</select></td>" +
        "</tr>"
      );
    }).join("") || '<tr><td colspan="6">No orders yet.</td></tr>';

    document.querySelectorAll("[data-status]").forEach(function (select) {
      select.addEventListener("change", async function () {
        try {
          await RoyalAroma.api("/api/orders/" + select.getAttribute("data-status") + "/status", {
            method: "PUT",
            body: JSON.stringify({ status: select.value })
          });
          flash("success", "Order status updated.");
          await loadStats();
        } catch (error) {
          flash("error", error.message);
        }
      });
    });
  }

  document.getElementById("menuForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const id = document.getElementById("menuId").value;
    const payload = {
      name: document.getElementById("itemName").value.trim(),
      price: Number(document.getElementById("itemPrice").value),
      category: document.getElementById("itemCategory").value,
      image: document.getElementById("itemImage").value.trim(),
      description: document.getElementById("itemDescription").value.trim(),
      available: true
    };

    try {
      if (id) {
        await RoyalAroma.api("/api/menu/" + id, { method: "PUT", body: JSON.stringify(payload) });
        flash("success", "Menu item updated.");
      } else {
        await RoyalAroma.api("/api/menu", { method: "POST", body: JSON.stringify(payload) });
        flash("success", "Menu item added.");
      }
      event.target.reset();
      document.getElementById("menuId").value = "";
      await refresh();
    } catch (error) {
      flash("error", error.message);
    }
  });

  document.getElementById("resetMenuForm").addEventListener("click", function () {
    document.getElementById("menuForm").reset();
    document.getElementById("menuId").value = "";
  });

  async function refresh() {
    await Promise.all([loadStats(), loadUsers(), loadMenu(), loadOrders()]);
  }

  try {
    await refresh();
  } catch (error) {
    flash("error", error.message);
  }
});
