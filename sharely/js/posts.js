let activePostId = null;
let allPosts = [];

/* ================= DELETE ================= */

async function deletePost(post_id) {

    const res = await fetch(`${API}/delete-post/${post_id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        alert("Delete failed");
        return;
    }

    const postElement = document.getElementById(`post-${post_id}`);
    if (postElement) {
        postElement.remove();
        window.location.reload()
    }
}


function renderComments(comments) {

    const modalComments = document.getElementById("modal-comments");

    if (!comments || comments.length === 0) {
        modalComments.innerHTML = `<div class="no-comments">No comments yet</div>`;
        return;
    }

    modalComments.innerHTML = comments.map(comment => `
        <div class="comment-item" id="comment-${comment.id}">
            <strong>${comment.user}</strong>

            ${
                comment.is_owner
                ? `<button class="delete-comment-btn"
                        onclick="deleteComment(${comment.id})">
                        <i class="fa-solid fa-trash"></i>
                   </button>`
                : ""
            }

            <br>${comment.text}

            <div class="com-date">${comment.created_at.slice(0,10)}</div>
            <hr>
        </div>
    `).join("");
}


function updateCommentCount(postId) {

    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    document.addEventListener("click", function(e){

        if (e.target.closest(".comment-btn")){
    
            const postId = e.target.closest(".comment-btn").dataset.postId;
    
            openCommentModal(postId);
    
        }
    
    });
}


function renderPosts(posts, postSection) {
    console.log("this funtion is renderPosts.")
    if (!postSection) return;

    // postSection.innerHTML = "";

    if (!posts || posts.length === 0) {
        postSection.innerHTML = "<h1 class='no-post'>No posts.</h1>";
        return;
    }
    
    let postsHTML = "";
    if (posts && posts.length > 0){
    posts.forEach(post => {
        postsHTML += `
            <div class="post-card" id="post-${post.id}">

                <div class="post-header">

                    ${
                        post.profile_image
                        ? `<img class="post-pic" src="${base}${post.profile_image}" />`
                        : `<i class="fa-solid fa-circle-user"></i>`
                    }

                    <div class="user-name-delete">
                        <span class="post-user">${post.user}</span>
                        
                        ${  
                            post.is_owner
                            ? `<button class="delete-post" data-id="${post.id}">
                                <i class="fa-solid fa-delete-left"></i>
                               </button>`
                            : ""
                        }

                    </div>

                </div>

                ${post.title ? `<h3 class="feed-post-title">${post.title}</h3>` : ""}

                <p>${post.content}</p>

                ${post.image ? `<img src="${base}${post.image}" />` : ""}

                ${post.video ? `<video controls src="${base}${post.video}"></video>` : ""}

                <div class="post-actions">
                    <button class="like-btn" data-id="${post.id}">
                        ❤️ <span id="like-count-${post.id}">
                            ${post.like_count}
                        </span>
                    </button>

                    <button class="comment-btn" data-id="${post.id}">
                        💬 ${post.comments.length} comments
                    </button>
                </div>

            </div>
        `;
    })};

    // postSection.innerHTML = postsHTML;
    postSection.insertAdjacentHTML('beforeend', postsHTML);
    attachPostEvents(postSection);
}


async function deleteComment(commentId) {
    try {
        const res = await fetch(`${API}/comments/${commentId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) return;

        // remove from UI
        const commentEl = document.getElementById(`comment-${commentId}`);
        if (commentEl) commentEl.remove();

        // remove from local data
        const post = allPosts.find(p => p.id === activePostId);
        if (post) {
            post.comments = post.comments.filter(c => c.id !== commentId);
        }

        updateCommentCount(activePostId);

    } catch (error) {
        console.error(error);
    }
}


function submitComment(postId, text) {

    fetch(`${API}/comment/${postId}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text })
    })
    .then(res => res.json())
    .then(newComment => {

        const post = allPosts.find(p => p.id === postId);
        if (!post) return;

        // Add comment to local data
        post.comments.push(newComment);

        // Re-render comments
        renderComments(post.comments);

        // Update comment counter
        updateCommentCount(postId);

    })
    .catch(error => console.error(error));
}

function likePost(postId) {

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


function toggleCommentBox(postId) {
    console.log("togglecommentBox is working.")
    const box = document.getElementById(`comment-box-${postId}`);
    box.style.display = box.style.display === "none" ? "block" : "none";
}



function openCommentModal(postId) {
    console.log("Open comment is working.")

    activePostId = parseInt(postId);

    const modal = document.getElementById("comment-modal");
    const modalComments = document.getElementById("modal-comments");

    const post = allPosts.find(p => p.id === activePostId);

    if (!post) return;

    renderComments(post.comments);

    modal.style.display = "flex";
}

function closeCommentModal() {
    document.getElementById("comment-modal").style.display = "none";
}


function submitModalComment() {

    const input = document.getElementById("modal-comment-input");

    // 🛑 Safety check
    if (!input) return;

    const text = input.value.trim();

    if (!text) return;

    submitComment(activePostId, text);
    input.value = "";
}


function attachPostEvents(postSection) {

    postSection.addEventListener("click", function (e) {

        const deleteBtn = e.target.closest(".delete-post");
        const likeBtn = e.target.closest(".like-btn");
        const commentBtn = e.target.closest(".comment-btn");
        
        if (deleteBtn) {
            deletePost(deleteBtn.getAttribute("data-id"));
        }

        if (likeBtn) {
            likePost(likeBtn.getAttribute("data-id"));
        }

        if (commentBtn) {
            openCommentModal(commentBtn.getAttribute("data-id"));
        }

    });
}