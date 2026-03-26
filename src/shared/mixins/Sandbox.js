import { newSandboxSerializer, sendSandbox } from "../utils/sandboxSerializer";

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
      return sendSandbox(command, args, this.$store);
    },

    /**
     * Function to create a serializer which acts
     * as a proxy to a serializer located in the sandbox
     */
    async newSandboxSerializer(...constructorArgs) {
      return newSandboxSerializer(this.$store, ...constructorArgs);
    },
  },
};
