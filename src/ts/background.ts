import { Messenger } from "./Messenger";

let tabIdRequester: number | undefined;
new Messenger({
  onExtensionRequest: async (message, sender) => {
    console.log("background command extension: " + message.command);
    const { command } = message;
    switch (command) {
      case "openPopup": {
        if (!sender || !sender.tab)
          throw new Error("invalid command openPopup");
        tabIdRequester = sender.tab.id;
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
        return "ok";
      }
      case "getTab": {
        return tabIdRequester;
      }
      default:
        return undefined;
    }
  },
});
