const port = chrome.extension.connect({name: 'popup'});

const portListener = chrome.extension.connect({name: 'background'});

document.querySelector('#submit').addEventListener('click', () => {
  console.log('hi');
  const link = document.querySelector('#link-input').value

  port.postMessage(link);

});

port.onMessage.addListener(function(msg) {
  document.querySelector('#result').innerHTML = msg
});
