<template>
  <div class="container">
    <div class="proper heading">
      New to Kondor?
    </div>
    <div class="section">
      <div class="title">
        No, I have the secret information
      </div>
      <div class="body">
        Import your existing wallet using your 12 word seed phrase or private
        key
      </div>
      <button
        class=""
        @click="importSeedPhrase"
      >
        12 word phrase
      </button>

      <button
        class=""
        @click="importPrivateKey"
      >
        use private key
      </button>
    </div>
    <div class="section">
      <img
        src
        alt
      >
      <div class="proper title">
        Yes, let's setup a new wallet
      </div>
      <div class="body">
        This will create a new wallet and seed phrase
      </div>
      <button
        class="link"
        @click="generateSeed"
      >
        new wallet
      </button>
    </div>
  </div>
</template>

<script>
import router from "@/index/router";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";

export default {
  mixins: [ViewHelper],
  data() {
    return {
      publicPath: process.env.BASE_URL,
    };
  },
  methods: {
    async importPrivateKey() {
      this.alertClose();
      router.push("/importPrivateKey");
    },
    async importSeedPhrase() {
      this.alertClose();
      router.push("/importSeedPhrase");
    },
    async generateSeed() {
      this.alertClose();
      router.push("/generateSeed");
    },
  },
};
</script>
<style scoped>
.container {
  font-family: "Poppins", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1em;
}
img {
  width: 100px;
  margin-right: 2em;
}
.proper {
  text-transform: capitalize;
}
.title {
  text-transform: capitalize;
  padding-bottom: 0.3em;
}
.body {
  text-transform: capitalize;
  color: var(--kondor-gray);
  font-size: 0.8em;
  padding-bottom: 1em;
  line-height: 1.5em;
  text-align: center;
}
.section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5em 0;
  width: 80%;
}
.left-image {
  margin-right: 1em;
}
.disabled {
  color: var(--kondor-gray);
  cursor: not-allowed;
}

button {
  margin: 1em 0;
}
</style>
