// Constants
const CHAT_URL = "https://text2latex.onrender.com/";

// Elements
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
const closeChatBtn = document.querySelector(".chatbot header span");
const inputInitialHeight = chatInput.scrollHeight;

/**
 * Copies the content of a code block to clipboard.
 * @param {HTMLElement} buttonElement - The button triggering the copy action.
 */
async function copyCodeToClipboard(buttonElement) {
  const codeBlock =
    buttonElement.parentElement.nextElementSibling.querySelector(".code-block");
  const codeContent = codeBlock.textContent;

  try {
    await navigator.clipboard.writeText(codeContent);
  } catch (error) {
    console.error("Failed to copy text: ", error);
  }
}

/**
 * Formats a message, converting code blocks to HTML.
 * @param {string} message - The message to format.
 * @returns {string} - The formatted message.
 */
function formatMessageContent(message) {
  const codeRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  return message.replace(
    codeRegex,
    (_, language = "plaintext", code) => `
        <div class="code-block-container">
            <div class="code-header">${language}
                <span class="copy-code-btn code-copy-trigger">Copy</span>
            </div>
            <div class="code-container">
                <pre class="code-block">${code.trim()}</pre>
            </div>
        </div>
    `
  );
}

/**
 * Saves a message to local storage.
 * @param {string} message - The message content.
 * @param {string} type - The message type (e.g., "incoming", "outgoing").
 */
function saveMessageToHistory(message, type) {
  chrome.storage.local.get("chatHistory", (result) => {
    const chatHistory = result.chatHistory || [];
    chatHistory.push({ type, message });
    chrome.storage.local.set({ chatHistory });
  });
}

/**
 * Loads chat history from local storage and populates the chatbox.
 */
function displayChatHistory() {
  chrome.storage.local.get("chatHistory", (result) => {
    const chatHistory = result.chatHistory || [];
    chatHistory.forEach((chat) => {
      const chatElement = createChatElement(chat.message, chat.type);
      chatbox.appendChild(chatElement);
    });
    // Attach copy event listeners to all code copy triggers
    document.querySelectorAll(".code-copy-trigger").forEach((button) => {
      button.addEventListener("click", () => copyCodeToClipboard(button));
    });
  });
}

/**
 * Sends a message to the chatbot server and updates the chatbox with the response.
 * @param {string} url - The endpoint URL.
 * @param {Object} data - The data to send.
 * @param {HTMLElement} incomingChatElement - The chat element to update.
 * @returns {Promise<Object>} - The response data.
 */
function sendMessageToBot(url, data, incomingChatElement) {
  const messageElement = incomingChatElement.querySelector("p");

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Server error");
      }
      return response.json();
    })
    .then((data) => {
      const formattedMessage = formatMessageContent(data.response);
      messageElement.innerHTML = formattedMessage;
      return data;
    })
    .catch(() => {
      messageElement.classList.add("error");
      messageElement.textContent =
        "Oops! Something went wrong. Please try again.";
    })
    .finally(() => {
      chatbox.scrollTop = chatbox.scrollHeight;
    });
}

/**
 * Creates a chat list item element.
 * @param {string} message - The chat message.
 * @param {string} className - The additional class for the list item.
 * @returns {HTMLElement} - The chat list item element.
 */
function createChatElement(message, className) {
  const chatElement = document.createElement("li");
  chatElement.classList.add("chat", className);
  const chatTemplate =
    className === "outgoing"
      ? `<p></p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatElement.innerHTML = chatTemplate;
  chatElement.querySelector("p").innerHTML = formatMessageContent(message);
  return chatElement;
}

/**
 * Handles the chat input and communication with the bot.
 */
function handleChatInput() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;
  chatInput.value = "";
  chatInput.style.height = `${inputInitialHeight}px`;

  saveMessageToHistory(userMessage, "outgoing");
  chatbox.appendChild(createChatElement(userMessage, "outgoing"));
  chatbox.scrollTop = chatbox.scrollHeight;

  setTimeout(() => {
    const incomingChatElement = createChatElement("Thinking....", "incoming");
    chatbox.appendChild(incomingChatElement);
    chatbox.scrollTop = chatbox.scrollHeight;

    sendMessageToBot(
      CHAT_URL,
      { type: "question", prompt: userMessage },
      incomingChatElement
    ).then((data) => {
      saveMessageToHistory(data.response, "incoming");
    });
  }, 600);
}

// Event Listeners
sendChatBtn.addEventListener("click", handleChatInput);
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && window.innerWidth > 400) {
    event.preventDefault();
    handleChatInput();
  }
});
closeChatBtn.addEventListener("click", () => window.close());
chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitialHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Initial Load
displayChatHistory();
