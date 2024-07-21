<template>
  <div class="app-status">
    <div class="message">
      <img
        src="../../../public/images/kondor-mark.svg"
        alt="Kondor logo mark"
      >
      <span class="title">
        {{ title }}
      </span>
    </div>
    <div class="indicator-container">
      <div
        class="status-indicator"
        :class="{ active: isActive }"
      />
    </div>
  </div>
</template>
  
<script>
export default {
  name: 'Status',
  props: {
    title: {
      type: String,
      default: 'Room for short messages'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}
</script>
  
  <style scoped>
  .message {
    display: flex;
    align-items: center;
    gap: 1em;
  }
  .app-status {
    background: #1a1a1a;
    color: #777777;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: .5em 1em;
  }
  
  .menu-button {
    background: none;
    border: none;
    color: #777777;
    cursor: pointer;
  }
  
  .title {
    font-size: 1em;
    font-weight: normal;
    margin: 0;
    padding: .5em 0;
  }
  
  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #32CD32;
  }
  
  .status-indicator.active {
    background-color: #32CD32;
  }
  .indicator-container {
    height: 100%;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .bottom-decoration {
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    height: 20px;
    background-color: #7B68EE;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .icon-container {
    background-color: #7B68EE;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .icon {
    color: white;
    font-size: 24px;
  }
  </style>