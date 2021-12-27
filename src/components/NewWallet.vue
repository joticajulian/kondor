<template>
  <div>
    <h1>New to Kondor?</h1>
    <div>
      <img src="" alt=""/>
      <div>No, I already have a seed phrase</div>
      <div>Import your existing wallet using a 12 word seed phrase</div>
      <button @click="importWallet">Import wallet</button>
    </div>
    <div>
      <img src="" alt=""/>
      <div>Yes, let's setup a new wallet</div>
      <div>This will create a new wallet and seed phrase</div>
      <button>Create wallet</button>
    </div>
  </div>
</template>

<script>
import router from '@/router'

export default {
  methods: {
    async importWallet() {
      router.push("/import")
    }
  }
};
</script>