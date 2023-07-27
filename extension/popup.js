

let url = 'https://text2latex.onrender.com/';
  document.getElementById('submit-button').addEventListener('click', function() {
    var inputText = document.getElementById('search-input').value;
    console.log(inputText);
    // Do something with inputText
    var data = {
      "type": "question",
      "prompt": inputText
    };
    postPrompt(url,data)
    .then(data => {
        console.log('success:', data.response); 
        document.getElementById('output').innerHTML = data.response;
    })
    .catch((error) => console.error('error',error));
  });

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