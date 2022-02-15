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
  res: () => void
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

  public listeners: {
    type: "extension" | "dom";
    id: number | "onRequest";
    listener: unknown;
  }[] = [];

  constructor(opts?: {
    onDomRequest?: OnDomRequest;
    onExtensionRequest?: OnExtensionRequest;
    replyPing?: boolean;
  }) {
    this.onExtensionRequest = async () => ({});
    this.onDomRequest = async () => ({});

    if (!opts) return;

    if (opts.onExtensionRequest) {
      this.onExtensionRequest = opts.onExtensionRequest;
      const listener: extensionListener = async (data, sender, res) => {
        res();
        const { id, command } = data as MessageRequest;
        // check if it is a MessageRequest
        if (!command) return;

        let message: MessageResponse = { id };

        console.log("ext request: ", command);
        // check if it's ping request
        if (opts.replyPing && command === "ping") {
          const { args } = data as MessageRequest;
          if (
            this.listeners.find((l) => l.id === (args as { id: number }).id)
          ) {
            message.result = "ok";
          } else {
            message.error = new Error("Connection closed");
          }
          this.sendResponse("extension", message, sender);
          return;
        }

        try {
          const result = await this.onExtensionRequest!(
            data as MessageRequest,
            id,
            sender
          );
          console.log("ext result: ");
          console.log(result);

          // check if other process will send the response
          if (
            typeof result === "object" &&
            result !== null &&
            (result as { _derived: boolean })._derived
          )
            return;

          message.result = result;
        } catch (err) {
          message.error = `Error command ${command} (extension): ${
            (err as Error).message
          }`;
        }

        if (typeof message.result === "undefined" && !message.error) return;
        this.sendResponse("extension", message, sender);
      };
      this.listeners.push({ type: "extension", id: "onRequest", listener });
      chrome.runtime.onMessage.addListener(listener);
    }

    if (opts.onDomRequest) {
      this.onDomRequest = opts.onDomRequest;
      const listener: (event: Event<Message>) => unknown = async (event) => {
        const { id, command } = event.data as MessageRequest;
        // check if it is a MessageRequest
        if (!command) return;
        console.log("dom request: ", command);

        let message: MessageResponse = { id };
        try {
          const result = await this.onDomRequest!(
            event as Event<MessageRequest>,
            id
          );
          console.log("dom result: ");
          console.log(result);

          // check if other process will send the response
          if (
            typeof result === "object" &&
            result !== null &&
            (result as { _derived: boolean })._derived
          )
            return;

          message.result = result;
        } catch (err) {
          message.error = `Error command ${command} (dom): ${
            (err as Error).message
          }`;
        }

        if (typeof message.result === "undefined" && !message.error) return;
        this.sendResponse("dom", message);
      };
      this.listeners.push({ type: "dom", id: "onRequest", listener });
      window.addEventListener("message", listener);
    }
  }

  sendResponse(
    type: "dom" | "extension",
    message: MessageResponse,
    sender?: Sender
  ): void {
    console.log("sending response ", type, " ", sender?.tab);
    console.log(message);
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
      this.listeners.push({ type: "dom", id: reqId, listener });
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
    args?: unknown,
    opts?: {
      timeout?: number;
      ping?: boolean;
    }
  ): Promise<T> {
    console.log("sendExtensionMessage");
    const reqId = Math.round(Math.random() * 10000);
    return new Promise((resolve: (result: T) => void, reject) => {
      // prepare the listener
      const listener: extensionListener = (data, _sender, res) => {
        res();

        // ignore requests
        if ((data as MessageRequest).command) return;

        const { id, result, error } = data as MessageResponse;

        // ignore different ids
        if (id !== reqId) return;

        // send response
        if (error) reject(error);
        else resolve(result as T);
        this.removeListener(reqId);
      };

      // listen
      this.listeners.push({ type: "extension", id: reqId, listener });
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
      console.log("message sent");
      console.log({
        to,
        id: reqId,
        command,
        args,
      });

      // const opts = { ping: to === "extension", ...options };

      // define timeout
      if (opts && opts.timeout) {
        setTimeout(() => {
          reject(new Error(`message timeout ${opts.timeout} ms`));
          this.removeListener(reqId);
        }, opts.timeout);
      }

      // ping
      if (opts && opts.ping) {
        (async () => {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            try {
              await new Promise((r) => setTimeout(r, 2000));
              const ll = await this.sendExtensionMessage(
                to,
                "ping",
                { id: reqId },
                { timeout: 20 }
              );
              console.log("response ping");
              console.log(ll);
            } catch (error) {
              reject(error);
              this.removeListener(reqId);
              break;
            }
          }
        })();
      }
    });
  }

  removeListener(id: number | string) {
    const index = this.listeners.findIndex((l) => l.id === id);
    if (index < 0) {
      console.log(`listener ${id} not found`);
      return;
    } else {
      console.log(`removing listener ${id}`);
    }
    const removed = this.listeners.splice(index, 1);
    const { listener, type } = removed[0];
    if (type === "dom") {
      window.removeEventListener(
        "message",
        listener as (event: Event<Message>) => unknown
      );
    } else {
      chrome.runtime.onMessage.removeListener(listener as extensionListener);
    }
  }

  removeListeners() {
    console.log("removing listeners");
    console.log(this.listeners);
    this.listeners.forEach((l) => {
      const { type, listener } = l;
      if (type === "dom") {
        window.removeEventListener(
          "message",
          listener as (event: Event<Message>) => unknown
        );
      } else {
        chrome.runtime.onMessage.removeListener(listener as extensionListener);
      }
    });
    this.listeners = [];
  }
}

export { Messenger };
