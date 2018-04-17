const port = chrome.extension.connect({name: 'popup'});

document.querySelector('#submit').addEventListener('click', () => {
  const link = document.querySelector('#link-input').value

  document.querySelector('#result').innerHTML = link

  port.postMessage(link);
});
