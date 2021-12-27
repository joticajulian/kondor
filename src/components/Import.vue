<template>
  <div>
    <h1>Import Existing Wallet</h1>
    <img src="" alt=""/>
    <input id="private-key" v-model="privateKey" type="password" placeholder="Private key"/>
    <input id="password1" v-model="password1" type="password" placeholder="Set password"/>
    <input id="password2" v-model="password2" type="password" placeholder="Confirm password"/>
    <button @click="importKey">Import now</button>
  </div>
</template>

<script>
import router from '@/router'
import Storage from '@/mixins/Storage'

export default {
  data() {
    return {
      privateKey: '',
      password1: '',
      password2: '',
    }
  },
  mixins: [Storage],
  methods: {
    async importKey() {
      if (this.password1 !== this.password2)
        throw new Error("password mismatch");
      const enc = await this.encrypt({ privateKey: this.privateKey }, this.password1);
      await this.setAccounts(enc);
      router.push('/dashboard');
    }
  }
}
</script>