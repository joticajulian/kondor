interface Message {
  id: number;
  data?: {
    command?: string;
    [x: string]: unknown;
  } | unknown;
  error?: Error;
}

type OnRequest = (request: Message, tabId?: number) => Promise<unknown>;

declare const chrome: {
  runtime: {
    onMessage: {
      addListener: (
        listener: (
          request: Message,
          sender: { tab?: { id: number } },
          sendResponse: (response: unknown) => void
        ) => void
      ) => void;
    };
    sendMessage: (message: Message) => void;
  };
  tabs: {
    sendMessage: (tabId: number, message: Message) => void;
  };
  windows: {
    create: (opts: unknown, callback: () => void) => void;
  };
};

export default class Messenger {
  private msgPool: {
    id: number;
    response?: unknown;
    error?: Error;
  }[] = [];

  private onRequest: OnRequest;

  constructor(onRequest: OnRequest) {
    this.onRequest = onRequest;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const { id, data, error } = request;
      sendResponse({});
      const i = this.msgPool.findIndex((m) => m.id === id);
      if (i >= 0) {
        // this is a response from a previous message
        if (error) {
          this.msgPool[i].error = error;
          return;
        }
        this.msgPool[i].response = data;
        return;
      }

      if (!this.onRequest) return;

      (async () => {
        let message: Message = { id: request.id };
        try {
          const tabId = sender.tab ? sender.tab.id : undefined;
          const response = await this.onRequest(request, tabId);
          message.data = response;
        } catch (err) {
          message.error = err as Error;
        }

        if (typeof message.data === "undefined" && !message.error) return;

        if (sender.tab) {
          chrome.tabs.sendMessage(sender.tab.id, message);
          return;
        }
        chrome.runtime.sendMessage(message);
      })();
    });
  }

  async sendMessage(to: number | string, data: unknown): Promise<unknown> {
    const id = Math.round(Math.random() * 10000);
    this.msgPool.push({ id });

    if (to === "extension") {
      chrome.runtime.sendMessage({ id, data });
    } else {
      // 'to' is tab.id
      chrome.tabs.sendMessage(to as number, { id, data });
    }

    let i = this.msgPool.findIndex((m) => m.id === id);
    while (!this.msgPool[i].response) {
      await new Promise((r) => setTimeout(r, 20));
      i = this.msgPool.findIndex((m) => m.id === id);
    }
    const [msgResp] = this.msgPool.splice(i, 1);
    if (msgResp.error) throw msgResp.error;
    return msgResp.response;
  }
}

export { Messenger };
