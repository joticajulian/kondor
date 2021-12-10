<template>
  <div>
    <span>{{address}}</span>
  </div>
</template>

<script>
//import { Signer } from 'koilib'

export default {
  data() {
    return {
      address: 'loading '
    }
  },

  created() {
    //(async () => {
      //this.address = Signer.fromSeed("julian").getAddress();
    //})()
  }
}
</script>