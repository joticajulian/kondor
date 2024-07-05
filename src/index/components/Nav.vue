<template>
  <nav class="navbar">
    <div class="navbar-left">
      <div class="avatar">MW</div>
      <span class="navbar-title">NFT Minting Wallet</span>
      <span class="material-icons">expand_more</span>
    </div>
    <div class="navbar-right">
      <button class="icon-button">
        <span class="material-icons">home</span>
      </button>
    </div>
  </nav>
</template>

<script>
export default {

}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #1a1a1a;
  color: white;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.navbar-right {
  display: flex;
  gap: 0.5rem;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.icon-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
}

.icon-button:hover {
  opacity: 0.8;
}

.material-icons {
  font-size: 1.25rem;
}
</style>
Last edited 8 minutes ago Claude
