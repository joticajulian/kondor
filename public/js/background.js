let tabIdRequester;
const msgPool = [];
let ii=0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { id, data } = request;
  sendResponse({}); ii++; if (ii>=20) return;
  const i = msgPool.findIndex(m => m.id === id);
  if (i >= 0) {
    // this is a response from a previous message
    msgPool[i].response = data;
    return;
  }

  // processing the request
  if (sender.tab) { // reply to tab
    processRequestFromTab(sender.tab.id, request);
  } else { // reply to extension
    // processRequestFromExtension(request);
  }
});

async function sendMessage(to, data) {
  const id = Math.round(Math.random() * 10000);
  msgPool.push({id});

  if (to === "extension") {
    chrome.runtime.sendMessage({ id, data });
  } else { // 'to' is tab.id
    chrome.tabs.sendMessage(to, { id, data });
  }
  
  let i = msgPool.findIndex(m => m.id === id);
  while ( !msgPool[i].response ) {
    await new Promise(r => setTimeout(r, 20));
    i = msgPool.findIndex(m => m.id === id);
  }
  const [ msgResp ] = msgPool.splice(i, 1);
  if (msgResp.response.error) throw new Error(msgResp.response.error);
  return msgResp.response;
};

async function processRequestFromTab(tabId, request) {
  const { id, data } = request;
  const { command } = data;
  switch (command) {
    case "openPopup":
      tabIdRequester = tabId;
      chrome.tabs.sendMessage(tabId, { id, data: {
        test: "response ok 30",
      }});

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

      break;
    case "getTab":
      chrome.tabs.sendMessage(tabId, { id, data: { tabId: tabIdRequester }});
      break;
    default:
      break;
  }
};
