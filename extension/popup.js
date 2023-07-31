
let url = 'https://text2latex.onrender.com/';

function postPrompt(url = '', data = {},incomingChatLi){
    const messageElement = incomingChatLi.querySelector("p");
    return fetch (url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    // .then(response => response.json())
    // .then(data => {
    //   console.log(data);}).catch (error => console.log(error));
    .then(response => {
        if(!response.ok){
          messageElement.classList.add("error");
          messageElement.textContent = "Oops! Something went wrong. Please try again.";
            // throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
      messageElement.textContent = data['response'];
      return data;
    }).catch(error => {
      messageElement.classList.add("error");
      messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => {
      chatbox.scrollTo(0,chatbox.scrollHeight);
    })
  };

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

  let chatContent = className === "outgoing" ? `<p>$</p>` : `<span class="material-symbols-outlined">smart_toy</span><p>$</p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi;
}


const handleChat = () => {
  userMessage = chatInput.value.trim();
  if(!userMessage) return;
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;


  // append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0,chatbox.scrollHeight);
  setTimeout(() => {
    //display "thinking...." message while waiting fr the response
    const incomingChatLi = createChatLi("Thinking....", "incoming")
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0,chatbox.scrollHeight);
    postPrompt(url, {"type": "question", "prompt": userMessage},incomingChatLi)
  },600);
};

sendChatBtn.addEventListener("click", handleChat);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 400){
    e.preventDefault();
    handleChat();
  }
 });


closeChatBtn.addEventListener("click", () => {window.close();})
chatInput.addEventListener("input", () => {
  //adjust the height of the input textarea based on the scrollheight
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

