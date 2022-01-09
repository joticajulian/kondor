chrome.runtime.sendMessage(
  { greeting: "hi background, I'm tab" },
  function (response) {
    console.log(response.farewell);
  }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request.greeting);
  if (request.greeting === "hi tab, I'm popup") {
    console.log("response: hey popup!");
    sendResponse({ farewell: "hey popup!" });
  }
});
