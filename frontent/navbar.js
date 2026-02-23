function loadNavbar() {

    const token = localStorage.getItem("access");
    const navbar = document.getElementById("navbar");

    navbar.innerHTML = `
        <h2 class="app-name">
            Share-IT
        </h2>

        <input type="text" placeholder="Search..." id="searchBox">

        <div class="nav-icons">
            ${
                token
                ? `
                    <img class="logo-gif profile-btn" src="./icons/profile.gif" alt="Profile">
                    <img class="logo-gif logout-btn" src="./icons/logout.gif" alt="Logout">
                  `
                : `
                    <img class="logo-gif login-btn" src="./icons/login.gif" alt="Login">
                  `
            }
        </div>
    `;

    attachNavbarEvents();
}


/* ===== Attach Events Properly (NO inline onclick) ===== */

function attachNavbarEvents() {

    // Home click
    const appName = document.querySelector(".app-name");
    if (appName) {
        appName.addEventListener("click", function (e) {
            e.stopPropagation();
            window.location.href = "index.html";
        });
    }

    // Profile click
    const profileBtn = document.querySelector(".profile-btn");
    if (profileBtn) {
        profileBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            window.location.href = "profile.html";
        });
    }

    // Login click
    const loginBtn = document.querySelector(".login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            window.location.href = "login.html";
        });
    }

    // Logout click
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            localStorage.removeItem("access");
            window.location.href = "index.html";
        });
    }
}