function register() {  
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    if (password !== confirmPassword) {
        document.getElementById("message").innerText = "Passwords do not match!";
        return;
    }else{

    fetch("https://shareit-42a7.onrender.com/api/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        alert("Registration successful!");
        window.location.href = "login.html";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Registration failed!");
    });}
}