document.getElementById("changePasswordForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const message = document.getElementById("message");

    if (newPassword !== confirmPassword) {
        message.style.color = "red";
        message.innerText = "Passwords do not match";
        return;
    }

    fetch(`${API}/change-password/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access")}`
        },
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error){
            message.style.color = "red";
            message.innerText = data.error;}
        else if(data.message){
            message.style.color = "green";
            message.innerText = data.message;

        }
        document.getElementById("changePasswordForm").reset();
    })
    .catch(err => {
        console.log(err)
        message.style.color = "red";
        message.innerText = "Error updating password";
    });

});