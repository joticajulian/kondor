/**
 * Mixin to communicate with sandbox html
 *
 * Why we need a sandbox?
 * - Koilib JS relies on protobufjs for Proto Buffers.
 * - protobufjs uses reflection to serialize/deserialize messages.
 *   This means, that it uses "eval" functions.
 * - Browser extensions do not allow to use eval functions for
 *   security reasons. However, it allows to run these functions
 *   in isolated pages (sandbox), which are disconnected from
 *   local storage, page controls, internet, etc.
 *   (https://developer.chrome.com/docs/apps/app_external/#sandboxing)
 * - Then the extension has a sandbox and we delegate there all
 *   operations related to serialization. This mixin (Sandbox.js)
 *   communicates with public/sandbox.html which is loaded in the
 *   App (see App.vue on each page) as an iframe.
 */

function toHexString(buffer) {
  return Array.from(buffer)
    .map((n) => `0${Number(n).toString(16)}`.slice(-2))
    .join("");
}

export default {
  name: "Sandbox mixin",

  data: function () {
    return {
      reqIds: [],
    };
  },

  methods: {
    /**
     * Function to send a message to sandbox html
     * and wait for a response. Different messages
     * can be sent in parallel because all messages have an id
     * to identify the request and response.
     *
     * The message is a request containing:
     * id, command, args.
     */
    async sendSandbox(command, args) {
      const iframeSandbox = document.getElementById("sandbox");
      while (!this.$store.state.sandboxLoaded) {
        await new Promise((r) => setTimeout(r, 20));
      }
      const reqId = crypto.randomUUID();
      return await new Promise((resolve, reject) => {
        // prepare the listener
        const listener = (event) => {
          // ignore requests
          if (event.data.command) return;

          const { id, result, error } = event.data;

          // ignore different ids
          if (id !== reqId) return;

          // send response
          if (error) {
            reject(new Error(error));
          } else {
            resolve(result);
          }
          window.removeEventListener("message", listener);
        };

        // listen
        window.addEventListener("message", listener);

        // send request
        iframeSandbox.contentWindow.postMessage(
          {
            id: reqId,
            command,
            args,
          },
          "*"
        );
      });
    },

    /**
     * Function to create a serializer which acts
     * as a proxy to a serializer located in the sandbox
     */
    async newSandboxSerializer(...constructorArgs) {
      const serId = toHexString(
        window.crypto.getRandomValues(new Uint8Array(5))
      );
      await this.sendSandbox("newSerializer", {
        serId,
        serArgs: constructorArgs,
      });
      return {
        serialize: async (...serArgs) => {
          return this.sendSandbox("serialize", {
            serId,
            serArgs,
          });
        },
        deserialize: async (...serArgs) => {
          return this.sendSandbox("deserialize", {
            serId,
            serArgs,
          });
        },
      };
    },
  },
};
