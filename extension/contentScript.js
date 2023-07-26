console.log("contentScript.js has been injected")

var currentLine= "";
var last_element = null;
// let url = 'http://127.0.0.1:5000';


document.addEventListener('click', function(event) {
    let element = event.target;

    const init = /\/\/(.*)/

    // Traverse up the DOM tree until a div is found or the root is reached
    while (element && element.tagName.toLowerCase() !== 'div') {
        element = element.parentNode;
    }

    // If a div was found, log its text content
    if (element) {
        //console.log(element.textContent);
        if (element.textContent.match(init)){
            currentLine = element.textContent.match(init)[1].trim();
            last_element = element;
            console.log(currentLine)
        }
        else{
            currentLine = null;
            console.log(currentLine)
        }
    }
    else{
        currentLine = null;
        console.log(currentLine)
    }
});

document.addEventListener('keydown', function(event) {
    // Key code for the 'Enter' button is 13
    if(event.key == "Enter" && chrome.runtime) {
        console.log('Enter key pressed!', currentLine);
        chrome.runtime.sendMessage({"data": currentLine});
    }
});

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        // replace the textContent in the "last_element" with message.data
        if (message.data && last_element && chrome.runtime){
            last_element.textContent = message.data;
        }   
        else{
            console.log("issues")
        }

    }
);

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.action === "toggleSidebar") {
//       let sidebar = document.getElementById('myExtensionSidebar');
//       sidebar.style.display = (sidebar.style.display === 'none') ? 'block' : 'none';
//     }
//   });
  









// // now that we have the text content we have to extract just the text and ignore the "//"
// // and then send that to the backend.
// // the response we receive from the backend must replace that line of code.