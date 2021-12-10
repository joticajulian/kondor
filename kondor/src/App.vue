<template>
  <div id="app">
    <iframe id="sandbox" src="sandbox.html"></iframe>
    <Nav/>
    <router-view/>
  </div>
</template>

<script>
import Nav from '@/components/Nav'

export default {
  components: { Nav },
};
</script>

