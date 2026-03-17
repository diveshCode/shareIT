

function loadNavbar() {
    console.log("Navbar loaded");
    const navbar = document.getElementById("navbar");

    navbar.innerHTML = `
        <h2 class="app-name">
            Sharely
        </h2>

        <div class="nav-icons">
            ${
                token
                ? `
                    <a class="logo profile-btn" ><i class="fa-solid fa-user"></i></a>
                    <a class="logo logout-btn" ><i class="fa-solid fa-arrow-right-from-bracket"></i></a>
                    `
                    : `
                    <a class="logo-gif login-btn" ><i class="fa-solid fa-arrow-left-to-bracket"></i></a>
                `
            }
        </div>
    `;

    attachNavbarEvents();
}


/* ===== Attach Events Properly (NO inline onclick) ===== */

function attachNavbarEvents() {
    fetch(`${API}/user/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {

        if (res.status === 401) {
            localStorage.removeItem("access");
            window.location.href = "login.html";
            return;
        }

        return res.json();
    })
    .then(data => {

        if (!data) return;
        const username = data.username;
        const profileBtn = document.querySelector(".profile-btn");
        if (profileBtn && username) {
            profileBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                window.location.href = `/profile.html?username=${username}`;
            });
        
    }
    });
  
    console.log("home loaded");
    // Home click
    const appName = document.querySelector(".app-name");
    if (appName) {
        appName.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "index.html";
        });
    }

    // Login click
    const loginBtn = document.querySelector(".login-btn");
    if(!token)
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