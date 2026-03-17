// const token = localStorage.getItem("access");

document.addEventListener("DOMContentLoaded", function () {
    // const token = localStorage.getItem("access");
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    
    if (document.getElementById("username-profile")) {
        profile();
        setupEditToggle();
    }
    
});


/* ================= PROFILE ================= */

function profile() {
    // const token = localStorage.getItem("access");
    fetch(`${API}/user/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) {
            window.location.href = "login.html";
            return;
        }
        return res.json();
    })
    .then(data => {

        document.getElementById("username-profile").innerText = data.username;
        document.getElementById("email").innerText = data.email || "";
        document.getElementById("post-count").innerText = data.total_posts;
        document.getElementById("bio").innerText = data.bio || "";
    
        const profileImg = document.getElementById("user-profile");

        if (data.profile_image) {
            profileImg.src = data.profile_image;
        } else {
            profileImg.src =
                "https://cdn-icons-png.flaticon.com/128/9131/9131646.png";
        }
        const postSection = document.getElementById("post")
        console.log("Profile post "+data.posts)
        allPosts = data.posts
        renderPosts(allPosts,postSection);
    })
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
    const username = document.getElementById("username-input").value
    const bio = document.getElementById("bio-input").value
    const imageFile = document.getElementById("profile-image").files[0]
    const formData = new FormData()

    if (username) {
        formData.append("username", username)
    }

    if (bio) {
        formData.append("bio", bio)
    }

    if (imageFile) {
        formData.append("profile_image", imageFile)
    }

    const response = await fetch(`${API}/update-profile/`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    })

    const data = await response.json()

    if (response.ok) {
        // alert("Profile updated successfully")
        window.location.reload()
        console.log(data)
    } else {
        alert("Update failed")
        console.log(data)
    }
}

document.getElementById("update-btn").addEventListener("click", update_user)