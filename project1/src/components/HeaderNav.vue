<script setup lang="ts">
import Logo from './Logo.vue'
</script>

<template>
		<header class="header">
				<div class="container">
						<Logo />
						<slot></slot>
				</div>
		</header>
</template>

<style scoped>
.header {
	padding-top: 140px;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: 2em;
  padding-inline: 4em;

  position: fixed;
  top: 0;
  width: 100dvw;
  z-index: -1;

  user-select: none;
  -webkit-user-select: none;
}

.container::after {
  position: fixed;
  background: url('/wave.svg') no-repeat;
  object-fit: cover;
  content: '';
  width: 100%;
  height: 100%;
  top: -30px;
  left: 0;
  z-index: -2;
  pointer-events: none;
}

:slotted(*) {
	display: flex;
	gap: 4em;
}

:slotted(a) {
	cursor: pointer;
}
</style>
