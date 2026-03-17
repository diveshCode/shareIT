function register(event){
    if(event) event.preventDefault();
    // const API = "https://shareit-42a7.onrender.com/api";
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    const message = document.getElementById("message")
    if (password !== confirmPassword) {
        message.style.color = 'red';
        message.innerText = "Passwords do not match!";
        
        return;
    }else{
        
        console.log(API)
    console.log("Registering user...");
    fetch(`${API}/register/`, {
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
        if (data.username) {
            message.style.color = 'green';
            message.innerText = "Registration successful!";
            window.location.href = "login.html";
        } else {
            message.style.color = 'red';
            message.innerText = "Registration failed";
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });}
}