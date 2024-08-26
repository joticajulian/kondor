<template>
  <div class="container">
    <h1>Token settings</h1>
    <div class="advanced">
      Edit
      <div class="checkbox-wrapper-2">
        <input
          v-model="editing"
          type="checkbox"
          class="sc-gJwTLC ikxBAC"
        >
      </div>
    </div>
    <div
      v-for="token in tokens"
      :key="token.contractId"
      class="token"
    >
      <div class="image">
        <img
          :src="token.image"
          alt=""
        >
      </div>
      <div class="token-details">
        <div class="name">
          {{ token.nickname }}
        </div>
        <div class="address">
          {{ token.contractId }}
        </div>
      </div>
      <button
        v-if="editing"
        class="button-remove"
        @click="remove(token.contractId)"
      >
        X
      </button>
    </div>
    <button
      class="button-add"
      @click="addToken()"
    >
      Add Token
    </button>
  </div>
</template>

<script>
import router from "@/index/router";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  mixins: [Storage, ViewHelper],
  data() {
    return {
      editing: false,
      network: null,
      tokens: [],
    };
  },

  watch: {
    "$store.state.currentNetwork": async function () {
      await this.loadNetwork();
      await this.loadTokens();
    },
  },

  async mounted() {
    await this.loadNetwork();
    await this.loadTokens();
  },

  methods: {
    async loadNetwork() {
      try {
        this.$store.state.networks = await this._getNetworks();
        const currentTag = await this._getCurrentNetwork();
        this.$store.state.currentNetwork = this.$store.state.networks.findIndex(
          (n) => n.tag === currentTag
        );
        this.network =
          this.$store.state.networks[this.$store.state.currentNetwork];
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async loadTokens() {
      this.tokens = (await this._getTokens()).filter(
        (t) => t.network === this.network.tag
      );
    },

    addToken() {
      router.push("/tokens/add");
    },

    async remove(contractId) {
      const id = this.tokens.findIndex((t) => t.contractId === contractId);
      this.tokens.splice(id, 1);
      const tokens = (await this._getTokens()).filter(
        (t) => t.network !== this.network.tag || t.contractId !== contractId
      );
      await this._setTokens(tokens);
    },
  },
};
</script>
<style scoped>
.container {
  min-height: 20em;
  margin: 4em 2em;
}

.advanced {
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1em;
}

.checkbox-wrapper-2 {
  margin-left: 8px;
}

.checkbox-wrapper-2 .ikxBAC {
  appearance: none;
  background-color: #dfe1e4;
  border-radius: 72px;
  border-style: none;
  flex-shrink: 0;
  height: 20px;
  margin: 0;
  position: relative;
  height: 0px;
  width: 10px;
  padding: 10px;
}

.checkbox-wrapper-2 .ikxBAC::before {
  bottom: -6px;
  content: "";
  left: -6px;
  position: absolute;
  right: -6px;
  top: -6px;
}

.checkbox-wrapper-2 .ikxBAC,
.checkbox-wrapper-2 .ikxBAC::after {
  transition: all 100ms ease-out;
}

.checkbox-wrapper-2 .ikxBAC::after {
  background-color: var(--primary-light);
  border-radius: 50%;
  content: "";
  height: 14px;
  left: 3px;
  position: absolute;
  top: 3px;
  width: 14px;
}

.checkbox-wrapper-2 input[type="checkbox"] {
  cursor: default;
}

.checkbox-wrapper-2 .ikxBAC:hover {
  background-color: #c9cbcd;
  transition-duration: 0s;
}

.checkbox-wrapper-2 .ikxBAC:checked {
  background-color: #6e79d6;
}

.checkbox-wrapper-2 .ikxBAC:checked::after {
  background-color: var(--primary-light);
  left: 13px;
}

.checkbox-wrapper-2 :focus:not(.focus-visible) {
  outline: 0;
}

.checkbox-wrapper-2 .ikxBAC:checked:hover {
  background-color: #535db3;
}

.token {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 1em;
}

.token .image {
  width: 3.5em;
  line-height: 0;
  margin-right: 1em;
}

.token .image img {
  max-width: 3.5em;
  max-height: 3.5em;
  border-radius: 50%;
  box-shadow: 0em 0em 1em rgb(151, 151, 151);
}

.token .token-details {
  display: flex;
  flex-direction: column;
  width: 50%;
}

.token .token-details .name {
  font-size: 1em;
}

.token .token-details .address {
  font-size: 0.7em;
}

.button-add {
  margin-top: 2em;
  width: unset;
}

.button-remove {
  background-color: var(--kondor-red);
  width: 1em;
  height: 1.3em;
  padding: 0.4em;
  margin: auto;
  border: unset;
}
</style>
