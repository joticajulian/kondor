<template>
  <div class="tb-container">
    <div
      v-if="!unlocked"
      class="login-container"
    >
      <Unlock
        @onUnlock="afterUnlocked()"
        @onError="alertDanger($event)"
      />
    </div>
    <div
      v-else-if="dataLoaded"
      class="content-container"
    >
      <div class="wallet-interaction">
        <div>Your wallet is interacting with:</div>
        <div class="wi-title">
          {{ simplifiedDomain }}
        </div>
        <div>{{ requester.origin }}</div>
      </div>

      <div class="check-events-row">
        <div
          class="advanced-toggle"
          @click="toggleAdvanced"
        >
          Advanced
          <div class="switch">
            <input
              v-model="showAdvanced"
              type="checkbox"
            >
            <span class="slider round" />
          </div>
        </div>
      </div>

      <div
        v-show="!showAdvanced"
        class="sending-info"
      >
        <p>Signature requested by</p>
        <h2>{{ requester.origin }}</h2>
      </div>

      <div
        v-if="showAdvanced"
        class="messages"
      >
        <div class="subtitle">
          Message
        </div>
        <div class="message">
          {{ message }}
        </div>

        <div class="subtitle">
          Signer
        </div>
        <div class="signature">
          <div class="sig-details">
            <div class="name">
              {{ signer.name }}
            </div>
            <div class="address">
              {{ signer.address }}
            </div>
          </div>
        </div>
      </div>

      <div class="warning-message">
        Warning: Interacting with unknown contracts can be risky and may result
        in irreversible loss if the contract is malicious. Only engage with
        contracts you trust.
      </div>

      <div class="action-buttons">
        <button
          class="custom-button secondary"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          class="custom-button primary"
          :disabled="!unlocked"
          @click="sign"
        >
          Sign
        </button>
      </div>
    </div>
    <div
      v-else
      class="loading"
    >
      Loading...
    </div>
  </div>
</template>

<script>
import { Signer, utils } from "koilib";

// mixins
import Message from "@/popup/mixins/Message";
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

// components
import Unlock from "@/shared/components/Unlock.vue";

export default {
  name: "SignMessage",

  components: { Unlock },

  mixins: [Storage, ViewHelper, Message],

  data: function () {
    return {
      message: "",
      requester: "",
      signer: {},
      footnoteMessage: "",
      unlocked: false,
      request: null,
      showAdvanced: false,
      dataLoaded: false,
    };
  },

  computed: {
    simplifiedDomain() {
      try {
        const url = new URL(this.requester.origin);
        const hostname = url.hostname;
        const parts = hostname.split(".");
        return parts.length > 2 ? parts[parts.length - 2] : parts[0];
      } catch (error) {
        return this.requester.origin;
      }
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      console.log("loadData called");
      let requests;
      if (process.env.VUE_APP_ENV === "test") {
        requests = [
          {
            id: "270815b4-8c3e-4b53-b9ac-82ba3854c206",
            command: "signer:signMessage",
            args: {
              signerAddress: "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
              message: "my test to sign",
            },
            sender: {
              id: "eghigpjkddlhegjaibgjlnfnkgdnmnlh",
              url: "https://koinosblocks.com/address/19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
              origin: "https://koinosblocks.com",
              frameId: 0,
              documentId: "F6D0BCBD9A19559A679F6714294A63A2",
              documentLifecycle: "active",
              tab: {
                active: true,
                audible: false,
                autoDiscardable: true,
                discarded: false,
                groupId: -1,
                height: 577,
                highlighted: true,
                id: 2018223012,
                incognito: false,
                index: 14,
                mutedInfo: {
                  muted: false,
                },
                openerTabId: 2018223007,
                pinned: false,
                selected: true,
                status: "complete",
                title: "Koinosblocks.com - address details",
                url: "https://koinosblocks.com/address/19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
                width: 1280,
                windowId: 2018222470,
              },
            },
          },
        ];
      } else {
        requests = this.$store.state.requests.filter((r) => {
          return r.command === "signer:signMessage";
        });
      }
      this.request = requests[0];
      this.requester = this.request.sender;
      await this.displayRequest();
    },

    async displayRequest() {
      console.log("displayRequest called");
      this.message = this.request.args.message;
      this.accounts = await this._getAccounts();
      this.signer = this.accounts.find(
        (a) => a.address === this.request.args.signerAddress
      );
      this.dataLoaded = true;
    },

    afterUnlocked() {
      console.log("afterUnlocked called");
      this.unlocked = true;
    },

    async sign() {
      let message = { id: this.request.id };
      try {
        const acc = this.$store.state.accounts.find(
          (a) => a.address === this.request.args.signerAddress
        );
        const signer = Signer.fromWif(acc.privateKey);
        const signature = await signer.signMessage(this.request.args.message);

        message.result = utils.encodeBase64url(signature);
      } catch (err) {
        message.error = err.message;
      }
      this.sendResponse("extension", message, this.request.sender);
      window.close();
    },

    cancel() {
      const message = {
        id: this.request.id,
        error: "signMessage cancelled",
      };
      this.sendResponse("extension", message, this.request.sender);
      window.close();
    },

    toggleAdvanced() {
      console.log("toggleAdvanced called, current state:", this.showAdvanced);
      this.showAdvanced = !this.showAdvanced;
      console.log("New state:", this.showAdvanced);
    },
  },
};
</script>

<style scoped>
.tb-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: space-between;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
}

.content-container {
  width: 100%;
  height: 93%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.wallet-interaction {
  text-align: left;
  background-color: var(--primary-darker);
  width: 92%;
  padding: 1em 1em 1.4em 1em;
  font-size: 0.8em;
  color: var(--primary-gray);
}

.wi-title {
  font-size: 2.2em;
  color: var(--primary-light);
  font-weight: bold;
}

.check-events-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 0.5em;
  width: 92%;
  transition: margin-top 0.3s ease;
  position: absolute;
  top: 9em;
}

.check-events-row.advanced-active {
  margin-top: 0px;
}

.advanced-toggle {
  display: flex;
  align-items: center;
  color: var(--primary-gray);
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  margin-left: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: var(--kondor-light);
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #7161ef;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.sending-info {
  background-color: var(--primary-dark);
  padding: 1.5em;
  text-align: center;
  margin-bottom: 20px;
  transition: opacity 0.3s ease;
}

.sending-info p {
  color: #888;
  margin-bottom: 0.5em;
}

.sending-info h2 {
  color: var(--primary-light);
}

.warning-message {
  color: orange;
  padding: 1.2em;
  border-radius: 0.8em;
  margin: 0 1.2em;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1em;
  margin-top: 1.5em;
  padding: 0 1em;
}

.cancel-btn,
.sign-btn {
  width: 48%;
  padding: 15px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #444;
  color: var(--primary-light);
}

.sign-btn {
  background-color: #7161ef;
  color: var(--primary-light);
}

.message {
  background-color: #2a2a2a;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  word-break: break-all;
}

.signature {
  background-color: #2a2a2a;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.sig-details .name {
  font-weight: bold;
  margin-bottom: 5px;
}

.sig-details .address {
  font-size: 0.9em;
  color: #888;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.2em;
  color: var(--kondor-purple);
}
.messages {
  padding: 2em;
  margin-top: 1em;
  transition: opacity 0.3s ease;
}
</style>
