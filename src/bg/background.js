// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

console.log("hello")

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}

//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });


chrome.extension.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    console.log('msg', msg)

    var client = new HttpClient();
    client.get('https://www.reddit.com/submit?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DR_5Qfc7APQs', function(response) {
        console.log(response)
    });
  })
})
