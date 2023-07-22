

console.log("contentScript.js has been injected")

// chrome.runtime.onMessage.addListener(
//     function(message,sender,sendResponse){
//         console.log(message.type)
//     }
// );

// message = {text:"hello from content"};
// chrome.runtime.sendMessage(message);



var currentLine= "";
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
    if(event.key == "Enter") {
        console.log('Enter key pressed!', currentLine);
        chrome.runtime.sendMessage({"data": currentLine});

        // Here, you can insert the code that should be triggered when 'Enter' is pressed
        // if (currentLine){
        //     var data = {
        //         "prompt": currentLine
        //      };

        //     postPrompt(url,data)
        //         .then(data =>{console.log('success:', data)})
        //         .catch((error)=>{console.error('error',error)})
        // }
    }
});

// function postPrompt(url = '', data = {}){
//     return fetch (url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     })
//     .then(response => {
//         if(!response.ok){
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
// }







// // now that we have the text content we have to extract just the text and ignore the "//"
// // and then send that to the backend.
// // the response we receive from the backend must replace that line of code.