let url = "https://text2latex.onrender.com/";

async function copyCode(buttonElement) {
  const codeBlock =
    buttonElement.parentElement.nextElementSibling.querySelector(".code-block");
  const codeText = codeBlock.textContent;

  try {
    await navigator.clipboard.writeText(codeText);
    alert("Code copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
}

function formatMessage(message) {
  let formattedMessage = message;

  // Match the content inside triple backticks and format it
  const codeRegex = /```(\w+)?\n?([\s\S]*?)```/g;

  let match;

  while ((match = codeRegex.exec(message)) !== null) {
    const language = match[1] || "plaintext";
    const codeContent = match[2].trim();
    const codeHTML = `
   <div class="code-block-container">
      <div class="code-header">${language}
      <span class="copy-code-btn">Copy</span></div>
      
      <div class="code-container">
         <pre class="code-block">${codeContent}</pre>
         
      </div>
   </div>`;

    formattedMessage = formattedMessage.replace(match[0], codeHTML);
  }
  return formattedMessage;
}

function storeMessage(message, type) {
  chrome.storage.local.get("chatHistory", function (result) {
    let chatHistory = result.chatHistory || [];

    chatHistory.push({ type, message });
    chrome.storage.local.set({ chatHistory: chatHistory });
  });
}

function loadChatHistory() {
  chrome.storage.local.get("chatHistory", function (result) {
    const chatHistory = result.chatHistory;
    if (chatHistory) {
      for (const chat of chatHistory) {
        const chatLi = createChatLi(chat.message, chat.type);
        chatbox.appendChild(chatLi);
      }
    }
  });
}

function postPrompt(url = "", data = {}, incomingChatLi) {
  const messageElement = incomingChatLi.querySelector("p");

  return fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        messageElement.classList.add("error");
        messageElement.textContent =
          "Oops! Something went wrong. Please try again.";
      }
      return response.json();
    })
    .then((data) => {
      let responseText = data["response"];

      let formattedMessage = formatMessage(responseText);

      messageElement.innerHTML = formattedMessage;
      return data;
    })
    .catch((error) => {
      messageElement.classList.add("error");
      messageElement.textContent =
        "Oops! Something went wrong. Please try again.";
    })
    .finally(() => {
      chatbox.scrollTo(0, chatbox.scrollHeight);
    });
}

const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
const closeChatBtn = document.querySelector(".chatbot header span");

let userMessage;
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
  //create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);

  let chatContent =
    className === "outgoing"
      ? `<p>$</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>$</p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").innerHTML = formatMessage(message);
  return chatLi;
};

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // append the user's message to the chatbox
  storeMessage(userMessage, "outgoing");
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);
  setTimeout(() => {
    //display "thinking...." message while waiting fr the response
    const incomingChatLi = createChatLi("Thinking....", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    postPrompt(
      url,
      { type: "question", prompt: userMessage },
      incomingChatLi
    ).then((data) => {
      storeMessage(data["response"], "incoming");
    });
  }, 600);
};

sendChatBtn.addEventListener("click", handleChat);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 400) {
    e.preventDefault();
    handleChat();
  }
});

closeChatBtn.addEventListener("click", () => {
  window.close();
});
chatInput.addEventListener("input", () => {
  //adjust the height of the input textarea based on the scrollheight
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});
loadChatHistory();
