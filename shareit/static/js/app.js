


function updateUI() {
    const nav = document.getElementById("nav-buttons");

    if (token) {
        nav.innerHTML = `
            <button onclick="goProfile()">Profile</button>
            <button onclick="logout()">Logout</button>
        `;
        document.getElementById("login-section").style.display = "none";
        document.getElementById("post-section").style.display = "block";
    } else {
        nav.innerHTML = `<button onclick="showLogin()">Login</button>`;
        document.getElementById("post-section").style.display = "none";
    }
}

function goTo(page) {
    const username = localStorage.getItem("username");

    switch(page) {
        case "feed":
            window.location.href = "/";
            break;

        case "profile":
            if (!username) {
                window.location.href = "/login/";
                return;
            }

            window.location.href = `/profile/${username}/`;
            break;

        case "search":
            document.getElementById("searchInput").focus();
            break;

        case "changePassword":
            window.location.href = "/change-password/";
            break;

        case "messages":
            window.location.href = "/messages/";
            break;

        case "notifications":
            window.location.href = "/notifications/";
            break;

        case "post":
            window.location.href = "/create-post/";
            break;
    }
    
}

function handleChangePasswordVisibility() {
    const currentUser = localStorage.getItem("username");

    const pathParts = window.location.pathname.split("/");
    const profileUser = pathParts[2];

    const elements = document.querySelectorAll(".changePasswordNav");

    elements.forEach(el => {
        el.style.display =
            (currentUser && profileUser && currentUser === profileUser)
            ? "block"
            : "none";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    handleChangePasswordVisibility();
});

function showLogin() {
    document.getElementById("login-section").style.display = "block";
}


function logout() {
    localStorage.removeItem("access");
    location.reload();
}



function goProfile() {
    window.location.href = "/profile/";
}
