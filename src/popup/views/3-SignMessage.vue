<template>
  <div class="container">
    <div class="column">
      <Footnote
        v-if="footnoteMessage"
        :message="footnoteMessage"
      />
      <div class="title">
        Sign message
      </div>
      <div>
        Signature requested by
        <div class="requester">
          {{ requester.origin }}
        </div>
      </div>

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

      <div v-if="!unlocked">
        <Unlock
          @onUnlock="afterUnlocked()"
          @onError="alertDanger($event)"
        />
      </div>
      <div class="container">
        <button
          :disabled="!unlocked"
          @click="sign"
        >
          Sign
        </button>
        <div
          class="cancel-button"
          @click="cancel"
        >
          Cancel
        </div>
      </div>
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
import Footnote from "@/shared/components/Footnote.vue";

export default {
  name: "SignMessage",

  components: { Unlock, Footnote },

  mixins: [Storage, ViewHelper, Message],

  data: function () {
    return {
      message: "",
      requester: "",
      signer: {},
      footnoteMessage: "",
      unlocked: !!this.$store.state.accounts.length > 0,
      request: null,
    };
  },

  mounted() {
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
    /**
     * TODO: for several requests create a list of requesters
     * and ask to the user to select one to see the details
     */
    this.request = requests[0];
    this.requester = this.request.sender;
    this.displayRequest();
  },

  methods: {
    async displayRequest() {
      this.message = this.request.args.message;
      this.accounts = await this._getAccounts();
      this.signer = this.accounts.find(
        (a) => a.address === this.request.args.signerAddress
      );
    },

    afterUnlocked() {
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
  },
};
</script>
<style scoped>
.title {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 0.5em;
}

.subtitle {
  font-size: 1.2em;
  font-weight: 600;
  margin: 1em 0em 0.5em 0em;
}

.cancel-button {
  border: none;
  text-decoration: underline;
  color: var(--kondor-purple);
  text-align: center;
  margin-bottom: 2em;
  cursor: pointer;
}

.requester {
  background-color: #c7c7c7;
  padding: 6px;
  margin: 5px 0px;
}

.message {
  margin: 1em 0em;
  font-size: 2em;
}

.signature {
  display: flex;
  margin-bottom: 1em;
}

.sig-details {
  flex: 8;
  padding: 0.7em 0.5em;
}

.sig-details .name {
  font-size: 1.2em;
}

.sig-details .address {
  font-size: 0.8em;
}
</style>
