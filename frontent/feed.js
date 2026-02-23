const API = "http://127.0.0.1:8000/api";
function likePost(postId) {

    const token = localStorage.getItem("access");

    if (!token) {
        alert("Login required");
        return;
    }

    fetch(`${API}/like/${postId}/`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {

        const countSpan = document.getElementById(`like-count-${postId}`);

        if (countSpan && data.like_count !== undefined) {
            countSpan.textContent = data.like_count;
        }

    })
    .catch(err => console.error("Like error:", err));
}



function submitComment(postId) {
    const token = localStorage.getItem("access");
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value;

    if (!token) {
        alert("Login required");
        return;
    }

    fetch(`${API}/comment/${postId}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: text })
    })
    .then(res => res.json())
    .then(data => {
        // Append new comment directly
        const commentsDiv = document.getElementById(`comments-${postId}`);
        const newComment = document.createElement("div");
        newComment.classList.add("comment-item");
        newComment.innerHTML = `<strong>${data.user || "You"}</strong> - ${data.text}`;
        commentsDiv.appendChild(newComment);

        input.value = "";
    })
    .catch(error => console.error(error));
}



function toggleCommentBox(postId) {
    const box = document.getElementById(`comment-box-${postId}`);
    const token = localStorage.getItem("access");

    if (!token) {
        alert("Please login to comment.");
        return;
    }

    box.style.display = box.style.display === "none" ? "block" : "none";
}



function loadPosts() {
    console.log("Feed script loaded");

    fetch(`${API}/posts/`)
    .then(res => res.json())
    .then(posts => {

        const feed = document.getElementById("feeds");

        // Clear once
        feed.innerHTML = "";

        let allPostsHTML = "";

        posts.forEach(post => {

            allPostsHTML += `
                <div class="post-card" id="post-${post.id}">

                    <div class="post-header">
                        <img class="post-pic" src="./icons/user.png">
                        <span class="post-user">${post.user}</span>
                    </div>

                    <h3 class="post-title">${post.title || ""}</h3>
                    <p>${post.content || ""}</p>

                    ${post.image ? `<img src="http://127.0.0.1:8000${post.image}" />` : ""}
                    ${post.video ? `<video controls src="http://127.0.0.1:8000${post.video}"></video>` : ""}

                    <div class="post-actions">
                    <button
                        type="button"
                        class="like-btn"
                        data-id="${post.id}">
                        ❤️ <span id="like-count-${post.id}">
                            ${post.like_count}
                        </span>
                    </button>

                        <button type="button"
                            onclick="toggleCommentBox(${post.id})">
                            💬 Comment
                        </button>
                    </div>

                    <div id="comment-box-${post.id}"
                        class="comment-box"
                        style="display:none;">
                        <div class="comments-section">
                            ${
                                post.comments && post.comments.length > 0
                                ? post.comments.map(comment => `
                                    <div class="comment-item">
                                        <strong>${comment.user}</strong> - ${comment.text}
                                    </div>
                                  `).join("")
                                : `<div class="no-comments">No comments yet</div>`
                            }
                        </div>

                        <input type="text"
                            id="comment-input-${post.id}"
                            placeholder="Write a comment...">

                        <button type="button"
                            onclick="submitComment(${post.id})">
                            Send
                        </button>
                    </div>

                </div>
            `;
        });

        // Insert once (VERY IMPORTANT)
        feed.innerHTML = allPostsHTML;
        // Attach click listeners
        document.querySelectorAll(".like-btn").forEach(button => {
            button.addEventListener("click", function (e) {
        
                e.preventDefault();
                e.stopPropagation();   // 🔥 THIS IS CRITICAL
        
                const postId = this.getAttribute("data-id");
                likePost(postId);
        
            });
        });

    })
    .catch(error => console.error("Error loading posts:", error));
}