console.log("JS LOADED");

let currentUser = null;
let ws = new WebSocket(`ws://127.0.0.1:8080/ws?token=${token}`);
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
        console.log("person:", data);
        localStorage.setItem("user_id", data.id)
        localStorage.setItem("username", data.username)
    })
}


// 👇 Load users on page load
fetch(`${API}/users/`, {
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
    console.log("USERS:", data);
    displayUsers(data);
})
.catch(err => console.log("ERROR:", err));



ws.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.from == currentUser) {
        addMessage(data.message, "received");
    }
};

const AI_ID = -1;

function displayUsers(data) {
    logged()
    const userlist = document.getElementById("sidechats");
    userlist.innerHTML = "<h3>Chats</h3>";

    // Ai chat
    console.log("displayuser is running")
    const div = document.createElement("div");
    div.classList.add("user");
    const name = `
    <div class="user-row">
        ${
            1 === 1
            ? `<img class="chat-pic" src="https://imgs.search.brave.com/nMbvY51Ew-72XFttVZC6iA6d1w0fAEUnBqqM1n3Khuw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNjcv/Mzc2LzY4Mi9zbWFs/bC9haS1tb2Rlcm4t/Z2VvbWV0cmljLWxv/Z28tbW9ub2dyYW0t/ZGVzaWduLWZvci10/ZWNoLWNoYXRib3Qt/dmlydHVhbC1hc3Np/c3RhbnQtbmV1cmFs/LW5ldHdvcmstc2Fh/cy1zbWFydC1kaWdp/dGFsLXRvb2wtZm9y/LXN0YXJ0dXAtb2Yt/Y29tbXVuaWNhdGlv/bi1zeXN0ZW0tYW5k/LWF1dG9tYXRpc2F0/aW9uLWlsbHVzdHJh/dGlvbi12ZWN0b3Iu/anBn" />`
            : `<i class="fa-solid fa-circle-user"></i>`
        }
        <span>SIYA AI</span>
    </div>
    `;

    const chatperson = `
    <div class="inbox-chat-person">
        ${
            1===1
            ? `<img class="inbox-pic" src="https://imgs.search.brave.com/nMbvY51Ew-72XFttVZC6iA6d1w0fAEUnBqqM1n3Khuw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNjcv/Mzc2LzY4Mi9zbWFs/bC9haS1tb2Rlcm4t/Z2VvbWV0cmljLWxv/Z28tbW9ub2dyYW0t/ZGVzaWduLWZvci10/ZWNoLWNoYXRib3Qt/dmlydHVhbC1hc3Np/c3RhbnQtbmV1cmFs/LW5ldHdvcmstc2Fh/cy1zbWFydC1kaWdp/dGFsLXRvb2wtZm9y/LXN0YXJ0dXAtb2Yt/Y29tbXVuaWNhdGlv/bi1zeXN0ZW0tYW5k/LWF1dG9tYXRpc2F0/aW9uLWlsbHVzdHJh/dGlvbi12ZWN0b3Iu/anBn" />`
            : `<i class="fa-solid fa-circle-user" id="inbox-pic-icon"></i>`
        }
        <span class="chat-person-name">SIYA AI</span>
    </div>
    `;
    div.innerHTML = name;


    div.onclick = () => selectUser(AI_ID, chatperson);

    userlist.appendChild(div);


    data.forEach(user => {
        const div = document.createElement("div");
        div.classList.add("user");
        const name = `
        <div class="user-row">
            ${
                user.profile_image
                ? `<img class="chat-pic" src="${user.profile_image}" />`
                : `<i class="fa-solid fa-circle-user"></i>`
            }
            <span>${user.first_name} ${user.last_name}</span>
        </div>
        `;

        const chatperson = `
        <div class="inbox-chat-person">
            ${
                user.profile_image
                ? `<img class="inbox-pic" src="${user.profile_image}" />`
                : `<i class="fa-solid fa-circle-user" id="inbox-pic-icon"></i>`
            }
            <span class="chat-person-name">${user.first_name} ${user.last_name}</span>
        </div>
        `;
        div.innerHTML = name;

        div.onclick = () => selectUser(user.id,chatperson);

        userlist.appendChild(div);
    });
}



function ai_chat(question) {
    const user_id = localStorage.getItem("user_id")
    console.log("user is"+user_id)
    console.log("ai_chat is running")

    fetch( `http://127.0.0.1:8080/ask?user_id=${encodeURIComponent(user_id)}&question=${encodeURIComponent(question)}`, {
        method: "GET"
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)

        if(data.error){
            addMessage(data.error, "received");
            return;
        }

        addMessage(data.answer, "received");
        scrollToBottom();
    })
    .catch(err => console.error(err));
}



function selectUser(userId,name) {
    console.log("selectuser is running")
    
    const inputContainer = document.getElementById("chat-input-container")
    const name_container = document.getElementById("chat-person-container")
    const chat_Select_msg = document.getElementById("chat-select-msg")
    const name_person = document.getElementById("chat-person")


    chat_Select_msg.style.display = 'none'
    inputContainer.style.display = 'flex'
    name_container.style.backgroundColor = '#e7dfdf'
    name_person.innerHTML = name
    currentUser = userId;
    const myId = localStorage.getItem("user_id");

    //fetch history
    fetch(`${API}/history/${userId}/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        const messagesDiv = document.getElementById("messages");
        messagesDiv.innerHTML = "";

        if (data.error) {
            messagesDiv.innerHTML = "No Message.";
            return;
        }

        data.forEach(msg => {
            if (msg.sender == myId) {
                console.log(msg)
                addMessage(msg.content, "sent");
            } else {
                addMessage(msg.content, "received");
            }
        });

        scrollToBottom();   // 🔥 nice UX
    });
}

function scrollToBottom() {
    const messages = document.getElementById("messages");
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    const username = localStorage.getItem("username");
    const myId = localStorage.getItem("user_id");
    console.log(myId)
    console.log(username);
    const input = document.getElementById("messageInput");
    const msg = input.value;
    if(currentUser === AI_ID){

        addMessage(msg, "sent");
    
        input.value = "";
    
        ai_chat(msg);
    
        return;
    }

    if(msg === ""){
        return
    }

    if (!currentUser) {
        alert("Select a user first");
        return;
    }

    if (!myId) {
        alert("User not logged in properly");
        return;
    }
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            to: currentUser,
            message: msg,
            sender: myId
        }));

        addMessage(msg, "sent");
    }

    input.value = "";
    scrollToBottom()

}

function addMessage(text, type) {
    const div = document.createElement("div");
    div.classList.add("message", type);
    div.innerText = text;

    document.getElementById("messages").appendChild(div);
}