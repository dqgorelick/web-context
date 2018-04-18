// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

var MULTIPLE_STRING = 'that link has been submitted to multiple subreddits. you can try to'
var SINGLE_STRING = 'link has already been submitted, but you can try to'

var SCORE_THRESHOLD = 5

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

// function parseArticle(response) {

// }

function parseMultipleArticles(response) {
  var results = []
  var articles = $(response).find('#siteTable').children()
  for (var i=0; i < articles.length; i++) {
    var result = {}
    var votes = $(articles[i]).find('.score.unvoted')
    if (votes.length > 0) {
      result.score = votes[0].innerText
      if (parseInt(result.score) < SCORE_THRESHOLD) {
        continue
      }
    }
    var title = $(articles[i]).find('p.title')
    if (title.length > 0) {
      result.title = title[0].innerText
    } else {
      continue
    }
    var subreddit = $(articles[i]).find('a.subreddit')
    if (subreddit.length > 0) {
      result.subreddit = subreddit[0].innerText
      result.href = subreddit[0].href
    }
    results.push(result)
  }
  return results
}

function parseSingleArticle(response) {
  var html = $(response)
  var votes = html.find('#siteTable .score.unvoted')[0].title
  if (parseInt(votes) < SCORE_THRESHOLD) {
    return false
  }
  var subreddit = html.find('.pagename a')[0]
  var title = html.find('p.title')[0].innerText
  return {
    title: title,
    subreddit: subreddit.innerText,
    href: subreddit.href,
    score: votes
  }
}

chrome.extension.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    var client = new HttpClient();
    var url = 'https://www.reddit.com/submit?url=' + msg
    client.get(url, function(response) {
      if (response.includes(MULTIPLE_STRING)) {
        var results = parseMultipleArticles(response)
        console.log("multiple", results)
        port.postMessage(JSON.stringify(results))
      } else if (response.includes(SINGLE_STRING)) {
        var result = parseSingleArticle(response)
        console.log('single', result)
        port.postMessage(JSON.stringify(result))
      } else {
        port.postMessage(JSON.stringify({}));
      }
    });
  })
})


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (!request) {
      sendResponse(JSON.stringify({}));
    }
    var client = new HttpClient();
    var url = 'https://www.reddit.com/submit?url=' + request
    client.get(url, function(response) {
      if (response.includes(MULTIPLE_STRING)) {
        var results = parseMultipleArticles(response)
        if (results.length === 0) {
          sendResponse(JSON.stringify({}))
          return
        }
        console.log("multiple: ", request, results)
        sendResponse(JSON.stringify(results))
      } else if (response.includes(SINGLE_STRING)) {
        var result = parseSingleArticle(response)
        if (result === false) {
          sendResponse(JSON.stringify({}))
          return
        }
        console.log('single', request, result)
        sendResponse(JSON.stringify(result))
      } else {
        // console.log('none')
        sendResponse(JSON.stringify({}));
      }
    });

    // if (request.greeting == "hello") {
    //   sendResponse({farewell: "goodbye"});
    // }
  });
