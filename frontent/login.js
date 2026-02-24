const API = "https://shareit-42a7.onrender.com/api";

function login() {
    
    fetch(`${API}/token/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        })
    })

    .then(res => {
        if (!res.ok) {
            throw new Error("Invalid credentials");
        }
        return res.json();
    })

    .then(data => {
        localStorage.setItem("access", data.access);
        window.location.href = "index.html";
    })

    .catch(err => {
        document.getElementById("login-error").innerText = "Invalid username or password";
    });
}
