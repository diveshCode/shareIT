function register() {  
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    if (password !== confirmPassword) {
        document.getElementById("message").innerText = "Passwords do not match!";
        return;
    }else{

    fetch("http://127.0.0.1:8000/api/register/", {
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
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Registration failed!");
    });}
}