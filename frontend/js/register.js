document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const errorBox = document.getElementById("formError");
  const successBox = document.getElementById("formSuccess");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorBox.classList.remove("show");
    successBox.classList.remove("show");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (name.length < 2) {
      errorBox.textContent = "Please enter your full name.";
      errorBox.classList.add("show");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errorBox.textContent = "Please enter a valid email address.";
      errorBox.classList.add("show");
      return;
    }
    if (password.length < 6) {
      errorBox.textContent = "Password must be at least 6 characters.";
      errorBox.classList.add("show");
      return;
    }
    if (password !== confirmPassword) {
      errorBox.textContent = "Password and confirm password do not match.";
      errorBox.classList.add("show");
      return;
    }

    try {
      const data = await RoyalAroma.api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          confirmPassword: confirmPassword
        })
      });
      successBox.textContent = data.message;
      successBox.classList.add("show");
      setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.classList.add("show");
    }
  });
});
