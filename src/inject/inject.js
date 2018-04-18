if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

var RESULT_MULTIPLE = 'multiple'
var RESULT_SINGLE = 'single'
var RESULT_NONE = 'none'

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    var total = 0
    $('a').each(function(iter, link) {
      var href = $(link)[0].href
      if (!href.includes('http')) {
          return
      }
      total++
      chrome.runtime.sendMessage(href, function(response) {
        parsed = JSON.parse(response)
        if (parsed.result !== RESULT_NONE) {
          console.log('href', href);
          $(link).css('color', 'red')
        }
      });
    })
	}
	}, 10);
});
