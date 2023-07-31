

let url = 'https://text2latex.onrender.com/';
//   document.getElementById('submit-button').addEventListener('click', function() {
//     var inputText = document.getElementById('search-input').value;
//     console.log(inputText);
//     // Do something with inputText
//     var data = {
//       "type": "question",
//       "prompt": inputText
//     };
//     postPrompt(url,data)
//     .then(data => {
//         console.log('success:', data.response); 
//         document.getElementById('output').innerHTML = data.response;
//     })
//     .catch((error) => console.error('error',error));
//   });

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
    .then(response => {
        if(!response.ok){
          messageElement.textContent = "Oops! Something went wrong. Please try again.";
            // throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
      messageElement.textContent = data['choices'][0]['message']['content'];
      // response['choices'][0]['message']['content']
      return data;
    })
}

const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");

let userMessage;

const createChatLi = (message, className) => {
  //create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  let chatContent = className === "outgoing" ? `<p>${message}</p>` : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
  chatLi.innerHTML = chatContent;
  return chatLi;
}

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if(!userMessage) return;

  // append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));

  setTimeout(() => {
    //display "thinking...." message while waiting fr the response
    const incomingChatLi = createChatLi("Thinking....", "incoming")
    chatbox.appendChild(incomingChatLi);
    postPrompt(url, {"type": "question", "prompt": userMessage},incomingChatLi)
  },600);
};

sendChatBtn.addEventListener("click", handleChat);

