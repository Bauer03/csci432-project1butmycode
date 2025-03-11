<script setup lang="ts">
import ScrollableMessages from './scrollableMessages.vue'
</script>

<template>
  <div class="right-side">
    <h2 class="fs-secondary-heading fw-bold">Messages</h2>
    <div class="messages-wrapper">
      <ScrollableMessages />
    </div>
  </div>
</template>

<style scoped>
.right-side {
  width: 100%;
  height: calc(100vh - 300px);
  display: flex;
  flex-direction: column;
  gap: var(--size-400);
  margin-top: var(--size-400);
}

.messages-wrapper {
  flex: 1;
  height: calc(100% - 60px);
  background-color: var(--clr-neutral-100);
  border-radius: 8px;
  box-shadow: 0 2px 50px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
