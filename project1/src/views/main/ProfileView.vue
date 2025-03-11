<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type { user } from '@/types'
import { onMounted } from 'vue'
import Modal from './modal.vue'

const router = useRouter()
const username = ref('')
const email = ref('')
const fname = ref('')
const lname = ref('')
const password = ref('')
const showModal = ref(false)
const editForm = ref({
	email: '',
	firstName: '',
	lastName: '',
	userName: '',
	password: '',
})
const originalData = ref({
	email: '',
	firstName: '',
	lastName: '',
	userName: '',
})

async function getUserData() {
	const url = 'https://hap-app-api.azurewebsites.net/user'

	const options = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token')}`,
		},
	}

	const response = await fetch(url, options)

	if (response.status === 200) {
		const data = (await response.json()) as user
		username.value = data.userName
		email.value = data.email
		fname.value = data.firstName
		lname.value = data.lastName

		editForm.value = {
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			userName: data.userName,
			password: '',
		}

		// storing original data for comparison
		originalData.value = {
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			userName: data.userName,
		}
	}

	if (response.status === 401) {
		console.log('Invalid token, could not get user data. Please try again.')
		return
	}
}

function validateEmail(email: string) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

async function saveChanges() {
	const url = 'https://hap-app-api.azurewebsites.net/user'

	if (!validateEmail(editForm.value.email)) {
		console.log('email is invalid')
		return
	}

	if (
		editForm.value.userName.length < 1 ||
		editForm.value.firstName.length < 1 ||
		editForm.value.lastName.length < 1
	) {
		console.log('new data is too short')
		return
	}

	// only pushing fields that have changed
	const changedFields: Partial<typeof editForm.value> = {}

	// probably a better way to do this but this works for now
	if (editForm.value.email !== originalData.value.email) {
		changedFields.email = editForm.value.email
	}
	if (editForm.value.userName !== originalData.value.userName) {
		changedFields.userName = editForm.value.userName
	}
	if (editForm.value.firstName !== originalData.value.firstName) {
		changedFields.firstName = editForm.value.firstName
	}
	if (editForm.value.lastName !== originalData.value.lastName) {
		changedFields.lastName = editForm.value.lastName
	}
	if (editForm.value.password) {
		changedFields.password = editForm.value.password
	}

	// checking if there are changes to push and not pushing if therer are none
	if (Object.keys(changedFields).length === 0) {
		showModal.value = false
		return
	}

	console.log(JSON.stringify(changedFields));

	const options = {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('token')}`,
		},
		body: JSON.stringify(changedFields),
	}

	const response = await fetch(url, options)

	if (response.status === 200) {
		showModal.value = false
		await getUserData()
	} else {
		console.log('Error updating profile. Please try again.')
	}
}

onMounted(() => {
	if (localStorage.getItem('token') === null) {
		router.push({ name: 'signin' })
	}
	getUserData()
})

function returnFromProfile() {
	router.back()
}
</script>

<template>
	<div class="profile-container introanim">
		<div class="controls-container">
			<h2 class="fs-secondary-heading fw-bold">Profile</h2>
			<div class="browse-controls">
				<button class="back-btn" @click="returnFromProfile">
					<span class="material-symbols-outlined">arrow_back</span>
				</button>
				<button class="edit-btn" @click="showModal = true">
					<span class="material-symbols-outlined">edit</span>
					<span class="text-sm">Edit Profile</span>
				</button>
			</div>
		</div>
		<div class="profile-content">
			<div class="user-info">
				<span class="username">Welcome, {{ username }}</span>
				<span class="email">Email: {{ email }}</span>
				<span class="lname">Last Name: {{ lname }}</span>
				<span class="fname">First Name: {{ fname }}</span>
			</div>
			<img src="/iphonegreen.png" alt="iphone" class="iphone" />
		</div>

		<Modal
			:show="showModal"
			@close="showModal = false"
			@save="saveChanges"
			@cancel="showModal = false"
		>
			<form @submit.prevent="saveChanges" class="edit-form">
				<div class="form-group">
					<label for="email">Email:</label>
					<input type="email" id="email" v-model="editForm.email" required />
				</div>
				<div class="form-group">
					<label for="userName">Username:</label>
					<input type="text" id="userName" v-model="editForm.userName" required />
				</div>
				<div class="form-group">
					<label for="firstName">First Name:</label>
					<input type="text" id="firstName" v-model="editForm.firstName" required />
				</div>
				<div class="form-group">
					<label for="lastName">Last Name:</label>
					<input type="text" id="lastName" v-model="editForm.lastName" required />
				</div>
				<div class="form-group">
					<label for="password">Password:</label>
					<input
						type="password"
						id="password"
						v-model="editForm.password"
						minlength="8"
					/>
				</div>
			</form>
		</Modal>
	</div>
</template>

<style scoped>
.profile-container {
	overflow: hidden;
	width: 100%;
	margin-top: var(--size-400);
	position: relative;
}

.profile-content {
	position: relative;
	margin-top: var(--size-500);
	display: flex;
	flex-direction: column;
}

.controls-container {
	align-items: start;
	display: flex;
	justify-content: space-between;
	position: relative;
	width: 100%;
	gap: .5em;
	/* align-items: center; */
}

.browse-controls {
	align-self: center;
	display: flex;
	align-items: center;
	align-content: center;
	justify-content: space-between;
	margin-bottom: var(--size-500);
	gap: var(--size-400);
}

.text-sm {
	font-size: var(--fs-400);
}

.back-btn,
.edit-btn {
	font-size: var(--fs-500);
	cursor: pointer;
	background: none;
	color: var(--clr-primary-400);
	border: 2px solid var(--clr-accent-400);
	border-radius: 8px;
	padding: var(--size-200) var(--size-300);
	display: flex;
	align-items: center;
	gap: var(--size-200);
	transition: all 0.2s ease;
}

.back-btn:hover,
.edit-btn:hover {
	background-color: var(--clr-accent-200);
	color: var(--clr-dark);
}

.user-info {
	user-select: none;
	display: flex;
	flex-direction: column;
	font-size: var(--fs-500);
	gap: var(--size-400);
	margin-bottom: var(--size-500);
}

.username {
	font-size: var(--fs-700);
	font-weight: var(--fw-bold);
	color: var(--clr-primary-400);
}

.edit-form {
	display: flex;
	flex-direction: column;
	gap: var(--size-200);
}

.form-group input {
	padding: var(--size-300);
	border: 1px solid var(--clr-accent-300);
	border-radius: 4px;
	font-size: var(--fs-400);
	width: 100%;
}

.form-group input:focus {
	outline: none;
	border-color: var(--clr-accent-400);
}

.introanim {
	animation-name: move-up-fade-in;
	animation-duration: 0.5s;
	animation-timing-function: ease-out;
	animation-fill-mode: forwards;
	opacity: 0;
}

@keyframes move-up-fade-in {
	0% {
		transform: translateY(10%);
		opacity: 0.2;
	}
	100% {
		transform: translateY(0);
		opacity: 1;
	}
}

@media (max-width: 768px) {
	.profile-container {
		padding: var(--size-400);
	}

	.browse-controls {
		flex-direction: column;
		gap: var(--size-400);
		align-items: stretch;
	}
}
</style>
