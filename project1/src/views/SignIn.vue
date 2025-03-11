<script setup lang="ts">
import Header from '../components/HeaderNav.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type { userData } from '../types'

const router = useRouter()
const email = ref('')
const error = ref('')
const password = ref('')

function validateEmail(email: string) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

async function signIn() {
	if (email.value.length < 1 || password.value.length < 1) {
		return
	}

	const url = 'https://hap-app-api.azurewebsites.net/user/login'

	if (!validateEmail(email.value)) {
		error.value = 'Please enter a valid email address'
		return
	}

	const data = {
		email: email.value,
		password: password.value,
	}

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	}

	const response = await fetch(url, options)

	if (response.status === 200) {
		const data: userData = await response.json()

		localStorage.setItem('token', data.token)
		console.log(data)
		localStorage.setItem('username', data.user.userName)

		router.push({
			name: 'main',
		})
	} else if (response.status === 400) {
		error.value = 'Invalid email or password.'
	}
}
</script>

<template>
	<Header>
		<nav>
			<RouterLink to="/">Home</RouterLink>
			<RouterLink to="/join">Join</RouterLink>
		</nav>
	</Header>

	<main class="padding-block-700">
		<section class="container">
			<form @submit.prevent="signIn" class="form-container">
				<div class="form-group">
					<label for="email">Email:</label>
					<input type="email" id="email" v-model="email" required />
				</div>

				<div class="form-group">
					<label for="password">Password:</label>
					<input type="password" id="password" v-model="password" required />
				</div>

				<p v-if="error" class="error-message">{{ error }}</p>

				<button type="submit" class="button">Sign In</button>
			</form>
		</section>
	</main>
</template>
<style>
Header { /* here because of my shenanigans using z-index for my animated svg header */
	position: relative;
	z-index: 1;
}
</style>
