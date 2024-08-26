<template>
  <div class="middle">
    <div class="container">
      <h1 class="heading">
        Confirm seed
      </h1>
      <div class="w-100">
        <p>Confirm your seed phrase</p>
        <div class="mnemonic-display">
          <textarea
            id="seed"
            v-model="mnemonic"
            class=""
            rows="3"
            disabled
          />
          <button
            v-if="mnemonic"
            class="reset-button"
            @click="reset"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
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
      <button
        :disabled="words.length > 0"
        @click="confirmSeed"
      >
        confirm
      </button>
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
    this.initialWords = this.$store.state.mnemonic0
      .split(" ")
      .sort(() => (Math.random() > 0.5 ? 1 : -1));
    this.words = this.initialWords;
  },

  methods: {
    addWord(word) {
      if (this.mnemonic) this.mnemonic += ` ${word}`;
      else this.mnemonic = word;

      this.words = this.words.filter((item) => item !== word);
    },

    reset() {
      this.mnemonic = "";
      this.words = this.initialWords;
    },

    async confirmSeed() {
      try {
        if (this.mnemonic !== this.$store.state.mnemonic0)
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
  height: 100%;
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

.mnemonic-display {
  position: relative;
}
.reset-button {
  position: absolute;
  top: 1px;
  right: 1px;
  margin: 0;
  padding: 0;
  width: auto;
  background: white;
  border-color: var(--kondor-light);
  color: black;
}

.reset-button span {
  font-size: 1.5em;
}

.mnemonic-display textarea {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding-right: 2em;
  background: none;
  color: var(--kondor-light);
}
</style>
