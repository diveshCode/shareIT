
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

function showLogin() {
    document.getElementById("login-section").style.display = "block";
}


function logout() {
    localStorage.removeItem("access");
    location.reload();
}



function goProfile() {
    window.location.href = "profile.html";
}