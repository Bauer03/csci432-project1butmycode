<script setup lang="ts">
defineProps<{
  senderName: string
  updatedAt: string
  text: string
}>()

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<template>
  <div class="message-card">
    <div class="message-header">
      <span class="sender-name">{{ senderName }}</span>
      <span class="timestamp">{{ formatDate(updatedAt) }}</span>
    </div>
    <p class="message-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.message-card {
  background-color: var(--clr-accent-100);
  border: 1px solid var(--clr-accent-200);
  border-radius: 8px;
  padding: var(--size-400);
  margin-bottom: var(--size-300);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--size-200);
}

.sender-name {
  font-weight: var(--fw-semi-bold);
  color: var(--clr-primary-400);
}

.timestamp {
  font-size: var(--fs-300);
  color: var(--clr-accent-400);
}

.message-text {
  color: var(--clr-neutral-900);
  line-height: 1.5;
}
</style>
