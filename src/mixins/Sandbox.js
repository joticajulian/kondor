// mixin to communicate with sandbox html
// this sandbox for the serialization of data using google protobuffers
export default {
  name: 'Sandbox mixin',

  data: function () {
    return {
      reqIds: [],
    }
  },

  methods: {
    async sendSandbox(command, args) {
      const iframeSandbox = document.getElementById('sandbox');
      const reqId = Math.round(Math.random()*10000);
      this.reqIds.push(reqId); 
      return await new Promise((resolve, reject) => {
        // prepare the listener
        const listener = (event) => {
          const { id, result, error } = event.data;
          if (!id) return;
          const i = this.reqIds.findIndex(r => r === id);
          if (i < 0) return;
          this.reqIds.splice(i, 1);
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
          window.removeEventListener("message", listener);
        }
      
        // listen
        window.addEventListener("message", listener);
      
        // send request
        iframeSandbox.contentWindow.postMessage({
          id: reqId,
          command,
          args,
        }, '*');
      });
    }
  }
}