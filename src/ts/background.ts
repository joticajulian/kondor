import { Messenger } from "./Messenger";

let tabIdRequester: number | undefined;
new Messenger(async (request, tabId) => {
  const { data } = request;
  const { command } = data as { command: string };
  switch (command) {
    case "openPopup": {
      tabIdRequester = tabId;
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
});
