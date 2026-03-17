// const APIs = "https://shareit-42a7.onrender.com/api";

function createPost() {
  console.log("createPost running");
  const formData = new FormData();

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const imageInput = document.getElementById("image");
  const videoInput = document.getElementById("video");

  if (titleInput && titleInput.value.trim()) {
    formData.append("title", titleInput.value.trim());
  }

  if (contentInput && contentInput.value.trim()) {
    formData.append("content", contentInput.value.trim());
  }

  if (imageInput && imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  if (videoInput && videoInput.files[0]) {
    formData.append("video", videoInput.files[0]);
  }

  
  const btn = document.getElementById("post-btn");

  // 🔒 Disable button immediately
  btn.innerText = "Posting...";
  btn.disabled = true;

  console.log("CREATE POST FUNCTION RUNNING");

  fetch(`${API}/create-post/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("post-message").innerText = "Post created!";
      window.location.href = "index.html";
    })
    .catch((error) => {console.error(error)
      btn.disabled = false
    });
}

    document.addEventListener("DOMContentLoaded", function() {
      const btn = document.getElementById("post-btn");
      if (!btn) return;
    
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        createPost();
      });
    });

function gottopost(){
  window.location.href = 'create.html'
}