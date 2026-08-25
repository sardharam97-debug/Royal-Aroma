document.addEventListener("DOMContentLoaded", function () {
  function afterLogin(user) {
    const nextPage = sessionStorage.getItem("ra_next");
    sessionStorage.removeItem("ra_next");
    const allowed = ["cart.html", "menu.html", "orders.html", "index.html"];
    if (user.role === "admin") {
      window.location.href = "admin.html";
      return;
    }
    window.location.href = allowed.indexOf(nextPage) !== -1 ? nextPage : "index.html";
  }

  const user = RoyalAroma.getUser();
  if (user) {
    afterLogin(user);
    return;
  }

  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("formError");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorBox.classList.remove("show");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      errorBox.textContent = "Please enter email and password.";
      errorBox.classList.add("show");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errorBox.textContent = "Please enter a valid email address.";
      errorBox.classList.add("show");
      return;
    }

    try {
      const data = await RoyalAroma.api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password })
      });
      RoyalAroma.setSession(data.token, data.user);
      afterLogin(data.user);
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.classList.add("show");
    }
  });
});
