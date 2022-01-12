import { Messenger } from "./Messenger";

let popupLoaded = false;
const messenger = new Messenger(async (request) => {
  const { data } = request;
  const { command } = data as { command: string };
  switch (command) {
    case "popupLoaded": {
      popupLoaded = true;
      return "ok";
    }
    default:
      return undefined;
  }
});

(async () => {
  console.log("calling bg to openPopup");
  const response1 = await messenger.sendMessage("extension", {
    command: "openPopup",
  });
  console.log("response from bg");
  console.log(response1);
  while (!popupLoaded) await new Promise((r) => setTimeout(r, 20));
  console.log("popup uploaded");
  console.log("sending a message to the popup");
  const response2 = await messenger.sendMessage("extension", {
    command: "newWallet",
  });
  console.log("response from extension");
  console.log(response2);
})();
