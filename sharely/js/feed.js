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

            // If empty → reset feed
            if (query === "") {
                nextPageUrl = `${API}/posts/`;  // reset pagination
                postSection.innerHTML = "";     // clear old posts
                loadPosts();
                return;
            }

            // Search fetch
            loadingPosts = true;
            fetch(`${API}/posts/?search=${encodeURIComponent(query)}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                nextPageUrl = data.next;   // update for infinite scroll
                postSection.innerHTML = ""; // clear previous posts
                renderPosts(data.results, postSection);
                loadingPosts = false;
            })
            .catch(err => {
                console.error("Search error:", err);
                loadingPosts = false;
            });

        }, 300); // wait 300ms after typing
    });
}


function loadPosts() {

    if (!nextPageUrl || loadingPosts) return;

    loadingPosts = true;

    fetch(nextPageUrl, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {

        nextPageUrl = data.next;

        const postSection = document.getElementById("feeds");
        allPosts.push(...data.results);
        renderPosts(data.results, postSection);

        loadingPosts = false;
    })
    .catch(err => {
        console.error(err);
        loadingPosts = false;
    });
}