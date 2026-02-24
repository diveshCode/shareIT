(function profile() {
    const api = 'https://shareit-42a7.onrender.com/api'

    const token = localStorage.getItem("access");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    fetch(`${api}/user/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {

        if (res.status === 401) {
            localStorage.removeItem("access");
            window.location.href = "login.html";
            return;
        }

        return res.json();
    })
    .then(data => {

        if (!data) return;
        // USER INFO

        document.getElementById("username-profile").innerText = data.username;
        document.getElementById("email").innerText = data.email;
        document.getElementById("post-count").innerText = data.total_posts;

        // Profile Image
        const profileImg = document.getElementById("user-profile");

        if (data.profile_image) {
            profileImg.src = "https://shareit-42a7.onrender.com" + data.profile_image;
        } else {
            profileImg.src = "./icons/user.png";
        }

        // POSTS SECTION
        const postSection = document.getElementById("post");
        postSection.innerHTML = "";

        if (!data.posts || data.posts.length === 0) {
            postSection.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        let postsHTML = "";

        data.posts.forEach(post => {

            postsHTML += `
                <div class="post-card">

                    <div class="post-header">
                        <img class="post-pic" src="./icons/user.png" alt="Profile">
                        <span class="post-user">${post.user}</span>
                    </div>
                    ${post.title ? `<h3>${post.title}</h3>` : ""}

                    <p>${post.content}</p>
                    ${post.image 
                        ? `<img src="https://shareit-42a7.onrender.com${post.image}" />` 
                        : ""}

                    ${post.video 
                        ? `<video controls src="https://shareit-42a7.onrender.com${post.video}"></video>` 
                        : ""}

                    <div class="post-footer">
                        ❤️ ${post.like_count}
                        <span>${post.created_at.slice(0,10)}</span>
                    </div>

                </div>
            `;
        });

        postSection.innerHTML = postsHTML;

    })
    .catch(error => console.error("Profile error:", error));

})();

function createPost(){
    window.location.href = 'create.html'
}