let url = 'https://text2latex.onrender.com/';
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === 'complete' && tab.url && tab.url.includes("overleaf.com/project/")) {
        console.log("in overleaf");
     }
});


function sendMessageToContentScript(message, tabId) {
    // Check if the tab is still open
    chrome.tabs.get(tabId, function(tab) {
      if (chrome.runtime.lastError) {
        // Tab doesn't exist, do nothing
        console.log("Tab doesn't exist.");
      } else {
        // Tab exists, send the message
        chrome.tabs.sendMessage(tabId, message);
      }
    });
  }

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      console.log(message.data);
      if (message.data && chrome.runtime){
            var data = {
                "type": "latex",
                "prompt": message.data
             };

             postPrompt(url,data)
             .then(data => {
                 console.log('success:', data.response); 
                 if (chrome.runtime) {
                    sendMessageToContentScript({"data": data.response}, sender.tab.id);
                     //chrome.runtime.sendMessage({"data": data.response});
                 }
                })  
             .catch((error) => console.error('error',error));
         
        }
    }
);
  

function postPrompt(url = '', data = {}){
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
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
}
