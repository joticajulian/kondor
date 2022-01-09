let tabId;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
