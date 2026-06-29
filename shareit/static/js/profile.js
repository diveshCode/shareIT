
document.addEventListener("DOMContentLoaded", function () {
    // const token = localStorage.getItem("access");
    if (!token) {
        window.location.href = "/login/";
        return;
    }
    
    if (document.getElementById("username-profile")) {
        profile();
        setupEditToggle();
    }
    
});


/* ================= PROFILE ================= */
function profile() {
    logged()
    const pathParts = window.location.pathname.split("/");
    const usernameFromUrl = pathParts[2];   // /profile/shruti/
    
    let endpoint = "";
    
    if (usernameFromUrl) {
        endpoint = `${API}/profile/${usernameFromUrl}/`;   // other user or own via URL
    } else {
        endpoint = `${API}/user/`;   // fallback
    }
    
    fetch(endpoint, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(async (res) => {
        if (res.status === 401) {
            window.location.href = "/login/";
            return;
        }
    
        const data = await res.json();
    
        if (!res.ok) {
            console.error(data);
            return;
        }
    
        return data;
    })
    .then(data => {
        
        document.getElementById("username-profile").innerText = `@${data.username}`;
        document.getElementById("name-profile").innerText =
        `${data.first_name} ${data.last_name}`;

        document.getElementById("email").innerText = data.email || "";
        document.getElementById("post-count").innerText = data.total_posts;
        document.getElementById("bio").innerText = data.bio || "";

        const profileImg = document.getElementById("user-profile");
        console.log(data)
        if (data.profile_image) {
            profileImg.src = `${base}${data.profile_image}`;
        } else {
            profileImg.src =
            "https://cdn-icons-png.flaticon.com/128/9131/9131646.png";
        }
        
        const postSection = document.getElementById("post");
        allPosts = data.posts;
        renderPosts(allPosts, postSection);
        
        // Show edit only if own profile
        const loggedUser = localStorage.getItem("username");
        console.log(loggedUser)
        if (loggedUser === data.username) {
            document.getElementById("edit-btn").style.display = "block";
        } else {
            document.getElementById("edit-btn").style.display = "none";
        }
    });
}


/* ================= EDIT TOGGLE ================= */

function setupEditToggle() {
    
    const editBtn = document.getElementById("edit-btn");
    const editForm = document.getElementById("edit-form");
    
    if (!editBtn || !editForm) return;
    
    editBtn.addEventListener("click", function () {
        editForm.classList.toggle("show");
    });
    
} 

async function update_user() {
    console.log("Update is running")
    const username = document.getElementById("username-input").value.trim()
    const bio = document.getElementById("bio-input").value.trim()
    const imageFile = document.getElementById("profile-image").files[0]
    const removeProfileImage = document.getElementById("removeProfileImage")
    const updateError = document.getElementById("update-error")
    const formData = new FormData()
    
    // regex
    const regex = /^[a-zA-Z0-9_]+$/;

    if (username !== "") {
        if (!regex.test(username)) {
        updateError.innerText =
            "Username can only contain letters, numbers and underscore (_)";
        updateError.style.color = "red";
        return;   // <-- IMPORTANT
    }

        formData.append("username", username);
    }

    if (bio != "") {
        formData.append("bio", bio)
    }
    
    if (imageFile) {
        formData.append("profile_image", imageFile)
    }

    for (const [key, value] of formData.entries()) {
        console.log(key, value);
    }
    
    const token = localStorage.getItem("access");
    const response = await fetch(`${API}/update-profile/`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    })

    const data = await response.json()
    
    if (response.ok) {
        // update localStorage only if username entered
        if (username) {
            localStorage.setItem("username", `${username}`);
            window.location.href = `/profile/${username}/`;
        } else {
            window.location.reload();
        }

    } else {
        alert("Update failed")
        console.log(data)
    }
}

document.getElementById("update-btn").addEventListener("click", update_user)