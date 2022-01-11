const msgPool = [];
let popupLoaded = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { id, data } = request;
  sendResponse({});
  const i = msgPool.findIndex(m => m.id === id);
  if (i >= 0) {
    // this is a response from a previous message
    msgPool[i].response = data;
    return;
  }
  processRequestFromExtension(request);
});

async function sendMessage(to, data) {
  const id = Math.round(Math.random() * 10000);
  msgPool.push({id});

  //if (to === "extension") {
    chrome.runtime.sendMessage({ id, data });
  //} else { // 'to' is tab.id
  //  chrome.tabs.sendMessage(to, { id, data });
  //}
  
  let i = msgPool.findIndex(m => m.id === id);
  while ( !msgPool[i].response ) {
    await new Promise(r => setTimeout(r, 20));
    i = msgPool.findIndex(m => m.id === id);
  }
  const [ msgResp ] = msgPool.splice(i, 1);
  if (msgResp.response.error) throw new Error(msgResp.response.error);
  return msgResp.response;
};

async function processRequestFromExtension(request) {
  const { id, data } = request;
  const { command } = data;
  switch (command) {
    case "popupLoaded":
      chrome.runtime.sendMessage({ id, data: {
        test: "response ok 200",
      }});
      popupLoaded = true;
      break;
    default:
      break;
  }
};

(async () => {
  console.log("calling bg to openPopup");
  const response1 = await sendMessage("background", { command: "openPopup"});
  console.log("response from bg")
  console.log(response1);
  while(!popupLoaded) await new Promise(r => setTimeout(r, 20));
  console.log("popup uploaded");
  console.log("sending a message to the popup")
  const response2 = await sendMessage("extension", { command: "newWallet" })
  console.log("response from extension")
  console.log(response2);
})()
