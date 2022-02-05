/* eslint-disable no-undef */

interface Sender {
  tab?: {
    id: number;
  };
}

interface MessageRequest {
  id: number;
  command: string;
  args: unknown;
}

interface MessageResponse {
  id: number;
  result?: unknown;
  error?: unknown;
}

type Message = MessageRequest | MessageResponse;

interface Event<T = Message> {
  data: T;
  source: {
    postMessage: (data: unknown, target: string) => void;
  };
  origin: string;
}

type OnExtensionRequest = (
  message: MessageRequest,
  id: number,
  sender?: Sender
) => Promise<unknown | { _derived: boolean }>;

type OnDomRequest = (
  event: Event<MessageRequest>,
  id: number
) => Promise<unknown | { derived: boolean }>;

type extensionListener = (
  request: Message,
  sender: Sender,
  sendResponse: () => void
) => void;

declare const chrome: {
  runtime: {
    onMessage: {
      addListener: (listener: extensionListener) => void;
      removeListener: (listener: extensionListener) => void;
    };
    sendMessage: (message: Message) => void;
  };
  tabs: {
    sendMessage: (tabId: number, message: Message) => void;
  };
  windows: {
    create: (opts: unknown, callback: () => void) => void;
  };
  storage: {
    local: {
      get: (keys: string[], callback: (result: unknown) => void) => void;
    };
  };
};

declare const window: {
  addEventListener: (what: string, listener: (event: Event) => unknown) => void;
  removeEventListener: (
    what: string,
    listener: (event: Event) => unknown
  ) => void;
  postMessage: (data: unknown, target: string) => void;
  [x: string]: unknown;
};

export default class Messenger {
  public onExtensionRequest: OnExtensionRequest;

  public onDomRequest: OnDomRequest;

  constructor(opts: {
    onDomRequest?: OnDomRequest;
    onExtensionRequest?: OnExtensionRequest;
  }) {
    this.onExtensionRequest = async () => ({});
    this.onDomRequest = async () => ({});

    if (opts.onExtensionRequest) {
      this.onExtensionRequest = opts.onExtensionRequest;
      chrome.runtime.onMessage.addListener(
        async (data, sender, sendResponse) => {
          sendResponse();
          const { id, command } = data as MessageRequest;
          // check if it is a MessageRequest
          if (!command) return;

          let message: MessageResponse = { id };
          try {
            const result = await this.onExtensionRequest!(
              data as MessageRequest,
              id,
              sender
            );

            // check if other process will send the response
            if (
              typeof result === "object" &&
              (result as { _derived: boolean })._derived
            )
              return;

            message.result = result;
          } catch (err) {
            message.error = err as Error;
          }

          if (typeof message.result === "undefined" && !message.error) return;

          if (sender.tab) {
            chrome.tabs.sendMessage(sender.tab.id, message);
            return;
          }
          chrome.runtime.sendMessage(message);
        }
      );
    }

    if (opts.onDomRequest) {
      this.onDomRequest = opts.onDomRequest;
      window.addEventListener("message", async (event) => {
        const { id, command } = event.data as MessageRequest;
        // check if it is a MessageRequest
        if (!command) return;

        let message: MessageResponse = { id };
        try {
          const result = await this.onDomRequest!(
            event as Event<MessageRequest>,
            id
          );

          // check if other process will send the response
          if (
            typeof result === "object" &&
            (result as { _derived: boolean })._derived
          )
            return;

          message.result = result;
        } catch (err) {
          message.error = err as Error;
        }

        if (typeof message.result === "undefined" && !message.error) return;
        window.postMessage(message, "*");
      });
    }
  }

  sendResponse(
    type: "dom" | "extension",
    message: MessageResponse,
    sender?: Sender
  ): void {
    if (type === "dom") window.postMessage(message, "*");
    else {
      if (sender && sender.tab) chrome.tabs.sendMessage(sender.tab.id, message);
      else chrome.runtime.sendMessage(message);
    }
  }

  async sendDomMessage<T = unknown>(
    command: string,
    args?: unknown
  ): Promise<T> {
    const reqId = Math.round(Math.random() * 10000);
    return new Promise((resolve: (result: T) => void, reject) => {
      // prepare the listener
      const listener = (event: Event) => {
        // ignore requests
        if ((event as Event<MessageRequest>).data.command) return;

        const { id, result, error } = (event as Event<MessageResponse>).data;

        // ignore different ids
        if (id !== reqId) return;

        // send response
        if (error) reject(error);
        else resolve(result as T);
        window.removeEventListener("message", listener);
      };

      // listen
      window.addEventListener("message", listener);

      // send request
      window.postMessage(
        {
          id: reqId,
          command,
          args,
        },
        "*"
      );
    });
  }

  async sendExtensionMessage<T = unknown>(
    to: number | string,
    command: string,
    args?: unknown
  ): Promise<T> {
    const reqId = Math.round(Math.random() * 10000);
    return new Promise((resolve: (result: T) => void, reject) => {
      // prepare the listener
      const listener: extensionListener = (data, _sender, sendResponse) => {
        sendResponse();

        // ignore requests
        if ((data as MessageRequest).command) return;

        const { id, result, error } = data as MessageResponse;

        // ignore different ids
        if (id !== reqId) return;

        // send response
        if (error) reject(error);
        else resolve(result as T);
        chrome.runtime.onMessage.removeListener(listener);
      };

      // listen
      chrome.runtime.onMessage.addListener(listener);

      // send request
      if (to === "extension") {
        chrome.runtime.sendMessage({
          id: reqId,
          command,
          args,
        });
      } else {
        // 'to' is tab.id
        chrome.tabs.sendMessage(to as number, {
          id: reqId,
          command,
          args,
        });
      }
    });
  }
}

export { Messenger };