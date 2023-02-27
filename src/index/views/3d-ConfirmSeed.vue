<template>
  <div class="middle">
    <div class="container">
      <h1 class="heading">
        Confirm seed
      </h1>
      <div>
        <img
          src=""
          alt=""
        >
        <p>Please select the words of the seed in the correct order.</p>
        <textarea
          id="seed"
          v-model="mnemonic"
          class="width-96"
          rows="3"
          disabled
        />
      </div>
      <div class="mb-1">
        <button
          v-for="word in words"
          :key="word"
          class="word-button"
          @click="addWord(word)"
        >
          {{ word }}
        </button>
      </div>
      <div class="mb-1">
        <button @click="confirmSeed">
          confirm
        </button>
      </div>
    </div>
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
      mnemonic: "",
      words: [],
    };
  },

  created() {
    this.words = this.$store.state.mnemonic
      .split(" ")
      .sort(() => (Math.random() > 0.5 ? 1 : -1));
  },

  methods: {
    addWord(word) {
      if (this.mnemonic) this.mnemonic += ` ${word}`;
      else this.mnemonic = word;
    },

    async confirmSeed() {
      try {
        if (this.mnemonic !== this.$store.state.mnemonic)
          throw new Error("The words are not in the correct order");

        await this._storeSeedPhrase(0);
        await this._addAccount({
          name: "Account 0",
          passwordId: 0,
        });

        this.alertClose();
        router.push("/dashboard");
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },
  },
};
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}
.heading {
  text-align: center;
}
.middle {
  display: flex;
  justify-content: center;
  margin: 1em 0;
}

.width-96 {
  width: 96%;
}
.item-checkbox {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 1em;
}

.word-button {
  width: auto;
  margin: 10px;
}
</style>
