const API = "https://shareit-42a7.onrender.com/api";

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


function submitComment(postId, text) {
    const token = localStorage.getItem("access");

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
    .then(res => {
        if (!res.ok) {
            console.error("Error status:", res.status);
            return;
        }
        return res.json();
    })
    .then(data => {
        closeCommentModal();
        loadPosts(); // refresh feed properly
    })
    .catch(error => console.error(error));
}



// function toggleCommentBox(postId) {
//     const box = document.getElementById(`comment-box-${postId}`);
//     const token = localStorage.getItem("access");

//     if (!token) {
//         alert("Please login to comment.");
//         return;
//     }

//     box.style.display = box.style.display === "none" ? "block" : "none";
// }

let activePostId = null;

function openCommentModal(postId) {
    const token = localStorage.getItem("access");
    if (!token) {
        alert("Please login to comment.");
        return;
    }

    activePostId = postId;

    const modal = document.getElementById("comment-modal");
    const modalComments = document.getElementById("modal-comments");

    // Get comments from current post
    const originalComments = document.getElementById(`comments-${postId}`).innerHTML;

    modalComments.innerHTML = originalComments;

    modal.style.display = "flex";
}



function closeCommentModal() {
    document.getElementById("comment-modal").style.display = "none";
}



function submitModalComment() {
    const input = document.getElementById("modal-comment-input");
    const text = input.value.trim();

    if (!text) return;

    submitComment(activePostId, text);
    input.value = "";
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
        if(!posts || posts.length > 0){
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
                            onclick="openCommentModal(${post.id})">
                            💬 Comment
                        </button>
                    </div>

                    <div id="comment-box-${post.id}"
                        class="comment-box">
                        <div id="comments-${post.id}" class="comments-section">
                            ${
                                post.comments && post.comments.length > 0
                                ? post.comments.slice(0,2).map(comment => `
                                    <div class="comment-item">
                                        <strong>${comment.user || currentUser}</strong> - ${comment.text}

                                    </div>
                                  `).join("")
                                : `<div class="no-comments">No comments yet</div>`
                            }
                        </div>
                    </div>

                </div>
            `;
        });}
        if (posts && posts.length === 0){
            allPostsHTML += `<h1>No Posts</h1>`
        }

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
