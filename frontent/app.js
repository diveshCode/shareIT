const API = "https://shareit-42a7.onrender.com/api";
let token = localStorage.getItem("access");

updateUI();
loadPosts();


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

function createPost() {

    const token = localStorage.getItem("access");

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("content", document.getElementById("content").value);

    const image = document.getElementById("image").files[0];
    const video = document.getElementById("video").files[0];

    if (image) formData.append("image", image);
    if (video) formData.append("video", video);

    fetch(`${API}/create-post/`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("post-message").innerText = "Post created!";
        window.location.href = "index.html";
    })
    .catch(error => console.error(error));
}


function goProfile() {
    window.location.href = "profile.html";
}
