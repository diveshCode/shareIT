document.getElementById("login-btn").addEventListener("click", login);

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
        window.location.href = "/index.html";
    })

    .catch(() => {
        document.getElementById("login-error").innerText =
        "Invalid username or password";
    });

}