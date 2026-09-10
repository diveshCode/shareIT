

let currentUser = null;

// FastAPI (8080) ki jagah ab Django ke apne server pe WebSocket connect hoga
const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
let ws = new WebSocket(`${wsProtocol}127.0.0.1:8000/ws/chat/?token=${token}`);
// let ws = new WebSocket(
//     `${wsProtocol}${window.location.host}/ws/chat/?token=${token}`
// );

const AI_ID = -1;

ws.onopen = function() {
    console.log("WebSocket connected");
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log("Received:", data);
    if (data.from == currentUser) {
        addMessage(data.message, "received");
        scrollToBottom();
    }
};

ws.onclose = function() {
    console.log("WebSocket disconnected, retrying...");
    setTimeout(() => {
        ws = new WebSocket(`${wsProtocol}127.0.0.1:8000/ws/chat/?token=${token}`);
    }, 2000);
};

// Logged-in user info fetch karo (pehle commented tha, ab use kar rahe hain)
function logged() {
    fetch(`${API}/logged/`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("API error");
        return res.json();
    })
    .then(data => {
        // console.log("person:", data);
        localStorage.setItem("user_id", data.id);
        localStorage.setItem("username", data.username);
    })
    .catch(err => console.log("ERROR:", err));
}

// Users list load karo
fetch(`${API}/users/`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
})
.then(res => {
    if (!res.ok) throw new Error("API error");
    return res.json();
})
.then(data => {
    // console.log("USERS:", data);
    displayUsers(data);
})
.catch(err => {console.log("ERROR:", err)});


function displayUsers(data) {
    logged();
    const userlist = document.getElementById("sidechats");
    userlist.innerHTML = "<h3>Chats</h3>";
    console.log(data)
    // AI chat entry (agar rakhna hai to alag se handle hoga, neeche note dekho)
    const div = document.createElement("div");
    div.classList.add("user");
    const name = `
    <div class="user-row">
        <i class="fa-solid fa-robot"></i>
        <span>SIYA AI</span>
    </div>
    `;
    const chatperson = `
    <div class="inbox-chat-person">
        <i class="fa-solid fa-robot"></i>
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
        <div class="user-row" id=${'user-'+user.id} >
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
        div.onclick = () => selectUser(user.id, chatperson);
        userlist.appendChild(div);
    });
}


function selectUser(userId, name) {
    const inputContainer = document.getElementById("chat-input-container");
    const name_container = document.getElementById("chat-person-container");
    const chat_Select_msg = document.getElementById("chat-select-msg");
    const name_person = document.getElementById("chat-person");
    const user = document.getElementById(`user-${userId}`)
    console.log(user)
    document.querySelectorAll(".user-row").forEach(user => {
        user.style.backgroundColor = "";
    });

    // Ab selected chat ka background change karo
    // const user = document.getElementById(`user-${userId}`);

    if (user) {
        user.style.backgroundColor = "#e7ddff";
    }

    chat_Select_msg.style.display = 'none';
    inputContainer.style.display = 'flex';
    name_container.style.backgroundColor = '#e7dfdf';
    name_person.innerHTML = name;
    currentUser = userId;

    if (currentUser === AI_ID) {
        // AI chat ka history abhi skip — alag se implement hoga
        document.getElementById("messages").innerHTML = "";
        return;
    }

    // Django REST se history fetch karo
    fetch(`${API}/history/${userId}/`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        const myId = localStorage.getItem("user_id");
        const messagesDiv = document.getElementById("messages");
        messagesDiv.innerHTML = "";

        if (data.error) {
            messagesDiv.innerHTML = "No Message.";
            return;
        }

        data.forEach(msg => {
            if (msg.sender == myId) {
                addMessage(msg.content, "sent");
            } 
            else 
            {
                addMessage(msg.content, "received");
            }
        });

        scrollToBottom();
    });
}


function scrollToBottom() {
    const messages = document.getElementById("messages");
    messages.scrollTop = messages.scrollHeight;
}


function sendMessage() {
    const myId = localStorage.getItem("user_id");
    const input = document.getElementById("messageInput");
    const msg = input.value.trim();

    if (msg === "") return;

    if (!currentUser) {
        alert("Select a user first");
        return;
    }

    if (currentUser === AI_ID) {
        addMessage(msg, "sent");
        input.value = "";
        // AI chat wala part agar rakhna hai to alag microservice call yahan
        return;
    }

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            to: currentUser,
            message: msg
        }));
        addMessage(msg, "sent");
    }

    input.value = "";
    scrollToBottom();
}


function addMessage(text, type) {
    const div = document.createElement("div");
    
    div.classList.add("message", type);
    div.innerText = text;
    document.getElementById("messages").appendChild(div);
}

function ai_chat(question) {
    fetch(`${API}/ai-chat/`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: question })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            addMessage(data.error, "received");
            return;
        }
        addMessage(data.answer, "received");
        scrollToBottom();
    })
    .catch(err => {
        console.error(err);
        addMessage("Something went wrong, try again.", "received");
    });
}