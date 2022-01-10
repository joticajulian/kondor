let tabId;
const msgPool = [];
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const { id, data } = request;
  sendResponse({});
  const i = this.msgPool.findIndex(m => m.id === id);
  if (i >= 0) {
    // this is a response from a previous message
    this.msgPool[i].response = data;
    console.log("bg: response");
    console.log(data);
    return;
  }

  // processing the request
  if (sender.tab) { // reply to app

  } else { // reply to extension
    chrome.runtime.sendMessage({
      id,
      data: {
        test: "response ok",
      }
    });
  }
  
  
  
  
  
  
  
  
  console.log(request.greeting);
  if (request.greeting === "hi background, I'm tab") {
    console.log("response: hey tab!");
    sendResponse({ farewell: "hey tab!" });
    tabId = sender.tab.id;

    chrome.windows.create(
      {
        focused: true,
        height: 500,
        width: 309,
        type: "popup",
        url: "index.html",
        top: 0,
        left: 0,
      },
      () => {}
    );
  }
  if (request.greeting === "hi background, I'm popup") {
    console.log("response: " + tabId);
    sendResponse({ tabId });
  }
});
