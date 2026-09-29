// const base = "http://127.0.0.1:8000";
// const base = "https://shareit-42a7.onrender.com";
const base = "https://res.cloudinary.com/dxqxq0pkc/";

const API = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("access");
console.log("token " +token)
// const API = "https://shareit-42a7.onrender.com/api";

function logged(){
    
    const token = localStorage.getItem("access");
    fetch(`${API}/logged/`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("API error");
        return res.json();
    })
    .then(data => {
        // console.log("person:", data);
        localStorage.setItem("user_id", data.id)
        localStorage.setItem("username", data.username)
    })
}