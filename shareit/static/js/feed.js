
let allPosts = [];
let nextPageUrl = `${API}/posts/`;
let loadingPosts = false;

window.addEventListener("scroll", () => {
    if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
    ) {
        loadPosts();
    }
});

const searchInput = document.getElementById("searchInput");
let searchTimeout;

if (searchInput) {
    searchInput.addEventListener("keyup", function () {
        clearTimeout(searchTimeout);

        const query = this.value.trim();

        searchTimeout = setTimeout(() => {
            const postSection = document.getElementById("feeds");

            if (query === "") {
                allPosts = [];
                nextPageUrl = `${API}/posts/`;
                postSection.innerHTML = "";
                loadPosts();
                return;
            }

            loadingPosts = true;

            fetch(`${API}/posts/?search=${encodeURIComponent(query)}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                nextPageUrl = data.next;
                allPosts = data.results;

                renderPosts(allPosts, postSection);

                loadingPosts = false;
            })
            .catch(err => {
                console.error("Search error:", err);
                loadingPosts = false;
            });

        }, 300);
    });
}


loadPosts();

function loadPosts() {
    if (loadingPosts || !nextPageUrl) return;

    loadingPosts = true;

    fetch(nextPageUrl, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        nextPageUrl = data.next;

        allPosts.push(...data.results);

        renderPosts(allPosts, document.getElementById("feeds"));

        loadingPosts = false;

        // If page still too short, load more automatically
        if (
            nextPageUrl &&
            document.documentElement.scrollHeight <= window.innerHeight + 100
        ) {
            loadPosts();
        }
    })
    .catch(err => {
        console.error(err);
        loadingPosts = false;
    });
}

const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
        loadPosts();
    }
});

observer.observe(document.getElementById("load-more-trigger"));

loadPosts();