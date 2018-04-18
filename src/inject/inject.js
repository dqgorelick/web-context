chrome.extension.sendMessage({}, function(response) {
  var port = chrome.extension.connect({name: 'popup'});

	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
    var links = $('a')
    var total = 0

    for (var i=0; i<links.length; i++){
      var link = links[i].href
      if (!link.includes('http')) {
          continue
      }
      var text = links[i].innerText
      if (text.length < 2) {
        continue
      }
      total++
      chrome.runtime.sendMessage(link, function(response) {
        console.log(response);
      });
    }
    console.log(total)
    console.log(links.length)
	}
	}, 10);
});
