<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
    <div @click="router.push({ name: 'home' })">
      <svg xmlns="http://www.w3.org/2000/svg" class="logo" viewBox="0 -960 960 960" fill="#e8eaed"><path d="M280-120v-248l-44 70-68-42 312-500 312 500-68 42-44-70v248H280Zm80-80h80v-120h80v120h80v-296L480-688 360-496v296Zm80-200v-80h80v80h-80Zm-80 200h240-240Z"/></svg>
    </div>
</template>

<style>
.logo {
  fill: var(--clr-primary-400);
  height: 2rem;
  transition: fill 0.2s;

  &:hover {
    cursor: pointer;
    fill: var(--clr-accent-400);
  }
}
</style>
