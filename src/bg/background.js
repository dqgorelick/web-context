const MULTIPLE_STRING = 'that link has been submitted to multiple subreddits. you can try to'
const SINGLE_STRING = 'link has already been submitted, but you can try to'
const RESULT_MULTIPLE = 'multiple'
const RESULT_SINGLE = 'single'
const RESULT_NONE = 'none'
const SCORE_THRESHOLD = 25

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

function parseArticle(article, cb) {
  var result = {}
  var html = $(article)
  var votes = html.find('.score.unvoted')
  if (votes.length > 0) {
    result.score = votes[0].innerText
    if (parseInt(result.score) < SCORE_THRESHOLD) {
      return cb(false)
    }
  }
  var title = html.find('p.title')
  if (title.length > 0) {
    result.title = title[0].innerText
  }
  // article list
  var subreddit = html.find('a.subreddit')
  if (subreddit.length > 0) {
    result.subreddit = subreddit[0].innerText
    result.href = subreddit[0].href
  }
  // single page
  subreddit = html.find('.pagename.redditname a')
  if (subreddit.length > 0) {
    result.subreddit = subreddit[0].innerText
    result.href = subreddit[0].href
  }
  var comments = html.find('.flat-list.buttons .first a')
  if (comments.length > 0) {
    result.comments = comments[0].href
  }
  if (result.title) {
    return cb(result)
  }
  return cb(false)
}

function parseMultipleArticles(response) {
  var results = []
  var articles = $(response).find('#siteTable').children()
  for (var i=0; i < articles.length; i++) {
    var result = parseArticle(articles[i], (result) => {
      if (result) {
        results.push(result)
      }
    })
    if (i === articles.length-1) {
      if (results.length) {
        return {
          result: RESULT_MULTIPLE,
          articles: results
        }
      }
      return {
        result: RESULT_NONE
      }
    }
  }
}


function parseSingleArticle(response) {
  var article = parseArticle(response, (article) => {
    return article
  })
}

// chrome.extension.onConnect.addListener((port) => {
//   port.onMessage.addListener((msg) => {
//     var client = new HttpClient();
//     var url = 'https://www.reddit.com/submit?url=' + msg
//     client.get(url, function(response) {
//       if (response.includes(MULTIPLE_STRING)) {
//         var parsed = parseMultipleArticles(response)
//         if (parsed.result !== RESULT_NONE) {
//           console.log("multiple", parsed.articles)
//         }
//         port.postMessage(JSON.stringify(parsed))
//       } else if (response.includes(SINGLE_STRING)) {
//         console.log(msg)
//         var parsed = parseSingleArticle(response)
//         port.postMessage(JSON.stringify(parsed))
//       } else {
//         port.postMessage(JSON.stringify({
//           result: RESULT_NONE
//         }));
//       }
//     });
//   })
// })


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (!request)  {
      sendResponse(JSON.stringify({}));
    }
    var client = new HttpClient();
    var url = 'https://www.reddit.com/submit?url=' + request
    client.get(url, function(response) {
      if (response.includes(MULTIPLE_STRING)) {
        var parsed = parseMultipleArticles(response)

        if (parsed.result !== RESULT_NONE) {
          console.log("multiple", parsed.articles)
        }
        sendResponse(JSON.stringify(parsed))
      } else if (response.includes(SINGLE_STRING)) {
        parseArticle(response, (article) => {
          if (article) {
            console.log('SINGLE parsed', article);
            sendResponse(JSON.stringify({
              result: RESULT_SINGLE,
              article: article
            }));
          } else {
            sendResponse(JSON.stringify({
              result: RESULT_NONE
            }));
          }
        })
      } else {
        sendResponse(JSON.stringify({
          result: RESULT_NONE
        }));
      }
    });
    return true;
  });
