<script setup lang="ts">
import Header from '../components/HeaderNav.vue'
import { ref } from 'vue';
</script>

<template>
    <Header>
        <nav>
            <RouterLink to="/signin">Sign In</RouterLink>
            <RouterLink to="/join">Join</RouterLink>
        </nav>
    </Header>

    <main class="padding-block-900">
        <section class="container center vertical">
            <h1 class="fs-primary-heading">Home</h1>
            <p>Vous êtes chez vous.</p>
        </section>
    </main>
</template>

<style scoped>

:deep(a) {
    text-decoration: none;
}

Header { /* here because of my shenanigans using z-index for my animated svg header */
	position: relative;
	z-index: 1;
}
</style>
