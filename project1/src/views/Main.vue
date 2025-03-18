<script setup lang="ts">
import Header from '../components/HeaderNav.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const username = computed(() => userStore.getUserData.value?.userName || '')
const data = ref('')
const dropdownOpen = ref(false)

onMounted(() => {
	// Check authentication from the store
	if (!userStore.getIsAuthenticated.value) {
		router.push({ name: 'home' })
		return
	}
});

// Handle logout
async function logout() {
	const url = 'https://hap-app-api.azurewebsites.net/user/logout'

	const options = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${userStore.getToken.value}`,
		},
	}

	const response = await fetch(url, options)

	if (response.status === 200) {
		userStore.logout()
		router.push({ name: 'home' })
		return
	} else {
		console.log('An error occurred while logging out. Please try again.')
		return
	}
}

function toggleAccountDropdown() {
	dropdownOpen.value = !dropdownOpen.value
}

async function deleteAccount() {
	const confirm = toggleDeleteAccountModal()
	if (!confirm) {
		return
	}

	const url = 'https://hap-app-api.azurewebsites.net/user'

	const options = {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${userStore.getToken.value}`,
		},
	}
	const response = await fetch(url, options)

	if (response.status === 200) {
		userStore.logout()
		router.push({ name: 'home' })
		return
	} else if (response.status === 401) {
		// eventually transition to notification of some kind
		console.log('Invalid token, could not delete account. Please try again.')
		return
	} else {
		// server error
		console.log('An error occurred while deleting your account. Please try again.')
		return
	}
}

function toggleDeleteAccountModal() {
	return confirm('Are you sure you want to delete your account? This action cannot be undone.')
	// open modal to confirm deletion
}

function cycleTheme() {
	// logic to cycle theme
}

function navigateToSearch() {
    router.push({ name: 'user-search' })
}
</script>

<template>
	<Header>
		<nav>
			<a @click="navigateToSearch">Find Users</a>
			<a @click="logout">Sign Out</a>
			<div class="account-dropdown">
				<a @click="toggleAccountDropdown" class="account-trigger">
					<span class="material-symbols-outlined">account_circle</span>
					<span class="material-symbols-outlined">arrow_drop_down</span>
				</a>
				<div v-if="dropdownOpen" class="dropdown-menu">
					<a @click="deleteAccount"
						>Delete Account<span class="material-symbols-outlined">delete</span></a
					>
					<a @click="cycleTheme"
						>Change Theme<span class="material-symbols-outlined">palette</span></a
					>
					<RouterLink to="/main/profile"
						>Profile
						<span class="material-symbols-outlined">account_circle</span></RouterLink
					>
				</div>
			</div>
		</nav>
	</Header>

	<main>
		<div class="main-container">
			<RouterView name="left" />
			<RouterView name="middle" />
			<RouterView name="right" />
		</div>
	</main>
</template>

<style scoped>
Header {
	position: relative;
	z-index: 1;
}

main {
	width: 100%;
	padding-top: var(--size-700);
}

.main-container {
	display: grid;
	grid-template-columns: 2fr 3fr 2fr;
	padding-inline: var(--size-1100);
	gap: var(--size-1100);
	justify-items: start;
	justify-content: space-between;
	align-items: start;
}

.account-dropdown {
	position: relative;
}

.dropdown-menu {
	position: absolute;
	right: 0;
	top: 150%;
	height: fit-content;
	background: var(--clr-accent-100);
	border-radius: 4px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	gap: var(--size-200);
	padding-block: var(--size-200);
}

.account-trigger {
	display: flex;
	align-items: center;
	gap: var(--size-200);
	cursor: pointer;
	z-index: 2;
	justify-content: center;
}

.dropdown-menu a {
	padding: var(--size-200) var(--size-400);
	white-space: nowrap;
	display: flex;
	gap: var(--size-400);
	align-items: center;
	justify-content: space-between;
	font-size: var(--fs-400);
	transition: background-color 0.2s, color 0.2s;
}

.dropdown-menu a:hover {
	background-color: var(--clr-accent-200);
	color: var(--clr-dark);
}

@media (max-width: 768px) {
	.main-container {
		grid-template-columns: 1fr;
		gap: var(--size-700);
		padding-inline: var(--size-400);
	}
}
</style>
