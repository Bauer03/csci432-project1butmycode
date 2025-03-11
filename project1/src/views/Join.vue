<script setup lang="ts">
import Header from '../components/HeaderNav.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type { userData } from '../types'

const router = useRouter();
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const firstName = ref('');
const lastName = ref('');

function validateEmail(email: string) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

async function join() {
	error.value = ''

	if (!validateEmail(email.value)) {
		error.value = 'Please enter a valid email address'
		return
	}

	if (password.value !== confirmPassword.value) {
		error.value = 'Passwords do not match'
		return
	}

	const url = 'https://hap-app-api.azurewebsites.net/user'

	const data = {
		userName: username.value,
		email: email.value,
		password: password.value,
		firstName: firstName.value,
		lastName: lastName.value,
	}

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	}

	const response = await fetch(url, options)

	if (response.status === 201) {
		const data: userData = await response.json()
		localStorage.setItem('token', data.token)
		localStorage.setItem('username', data.user.userName)
		router.push({ name: 'main' })
	} else if (response.status === 400) {
		error.value = 'Invalid email or username.'
	} else {
		error.value = 'An error occurred. Please try again.'
	}
}
</script>

<template>
	<Header>
		<nav>
			<RouterLink to="/">Home</RouterLink>
			<RouterLink to="/signin">Sign In</RouterLink>
		</nav>
	</Header>

	<main class="padding-block-700">
		<section class="container">
			<form @submit.prevent="join" class="form-container">
				<div class="form-row">
					<div class="form-group">
						<label for="firstName">First Name:</label>
						<input type="text" id="firstName" v-model="firstName" required />
					</div>

					<div class="form-group">
						<label for="lastName">Last Name:</label>
						<input type="text" id="lastName" v-model="lastName" required />
					</div>
				</div>

				<div class="form-group">
					<label for="username">Username:</label>
					<input type="text" id="username" v-model="username" required />
				</div>

				<div class="form-group">
					<label for="email">Email:</label>
					<input type="email" id="email" v-model="email" required />
				</div>

				<div class="form-group">
					<label for="password">Password:</label>
					<input
						type="password"
						id="password"
						v-model="password"
						required
						:minlength="8"
					/>
				</div>

				<div class="form-group">
					<label for="confirmPassword">Confirm Password:</label>
					<input
						type="password"
						id="confirmPassword"
						v-model="confirmPassword"
						required
						:minlength="8"
					/>
				</div>

				<p v-if="error" class="error-message">{{ error }}</p>

				<!-- Alternative way to get form data: binding :value to 'username' in the input element -->

				<button class="button">Join</button>
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
