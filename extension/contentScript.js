var currentLine= "";


document.addEventListener('click', function(event) {
    let element = event.target;

    init = /\/\/(.*)/

    // Traverse up the DOM tree until a div is found or the root is reached
    while (element && element.tagName.toLowerCase() !== 'div') {
        element = element.parentNode;
    }

    // If a div was found, log its text content
    if (element) {
        //console.log(element.textContent);
        if (element.textContent.match(init)){
            currentLine = element.textContent.match(init)[1].trim();
        }
        else{
            currentLine = null;
        }
    }
    else{
        currentLine = null;
    }
});



// now that we have the text content we have to extract just the text and ignore the "//"
// and then send that to the backend.
// the response we receive from the backend must replace that line of code.