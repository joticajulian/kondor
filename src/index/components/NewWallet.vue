<template>
  <div>
    <h1>New to Kondor?</h1>
    <div>
      <img src="" alt="" />
      <div>No, I already have a seed phrase</div>
      <div>Import your existing wallet using a 12 word seed phrase</div>
      <button @click="importWallet">Import wallet</button>
    </div>
    <div>
      <img src="" alt="" />
      <div>No, I already have a private key</div>
      <div>Import your private key</div>
      <button @click="importPrivateKey">Import private key</button>
    </div>
    <div>
      <img src="" alt="" />
      <div>Yes, let's setup a new wallet</div>
      <div>This will create a new wallet and seed phrase</div>
      <button>Create wallet</button>
    </div>
  </div>
</template>

<script>
import router from "@/index/router";
import AlertHelper from "@/shared/mixins/AlertHelper";

export default {
  mixins: [AlertHelper],
  methods: {
    async importPrivateKey() {
      router.push("/importPrivateKey");
    },

    async importWallet() {},
  },
};
</script>
