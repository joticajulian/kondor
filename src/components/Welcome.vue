<template>
  <div>
    <Logo/>
    <LogoText/>
    <input type="password" placeholder="Password">
    <button @click="clicked">unlock</button>
    <router-link to="/newWallet">import using Secret Recovery Phrase</router-link>
  </div>
</template>

<script>
import router from '@/router'
import Logo from '@/components/Logo'
import LogoText from '@/components/LogoText'
import Storage from '@/mixins/Storage'

export default {
  name: 'Welcome',
  mixins: [Storage],
  components: { Logo, LogoText },
  methods: {
    async clicked() {
      router.push("/dashboard")
    }
  }
}
</script>
