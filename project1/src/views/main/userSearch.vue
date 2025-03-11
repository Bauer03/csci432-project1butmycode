<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { user } from '@/types'

const searchQuery = ref('')
const users = ref<user[]>([])
const isSearching = ref(false)
const searchError = ref('')
const searchFilters = reactive({
    sortBy: 'firstName:asc',
    limit: 5
})
const hasSearched = ref(false)

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// stops too many API calls
let debounceTimeout: number | null = null
watch(searchQuery, (newValue) => {
    if (newValue.trim().length >= 2) {
        if (debounceTimeout) clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => {
            searchUsers()
        }, 500) as unknown as number
    }
})

async function searchUsers() {
    if (!searchQuery.value.trim()) {
        searchError.value = 'Please enter a search term'
        setTimeout(() => {
            searchError.value = ''
        }, 3000)
        return
    }

    isSearching.value = true
    searchError.value = ''
	await wait(400); // this just makes my animation show up, otherwise it would flash up and look weird

    try {
        const token = localStorage.getItem('token')

        if (!token) {
            searchError.value = 'You must be logged in to search users'
            isSearching.value = false
            return
        }

        const url = `https://hap-app-api.azurewebsites.net/users?search=firstName|lastName|userName:${searchQuery.value}&sortBy=${searchFilters.sortBy}&limit=${searchFilters.limit}`

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.status === 200) {
            const data = await response.json()
            users.value = data
            hasSearched.value = true
        } else if (response.status === 401) {
            searchError.value = 'Please sign in again to search users'
        } else {
            searchError.value = 'An error occurred while searching. Server could be down...'
        }
    } catch (e) {
        searchError.value = 'Unable to connect to the server'
    } finally {
        isSearching.value = false
    }
}

function handleSortChange(e: Event) {
    const target = e.target as HTMLSelectElement
    searchFilters.sortBy = target.value
    if (searchQuery.value.trim()) {
        searchUsers()
    }
}

function handleLimitChange(e: Event) {
    const target = e.target as HTMLSelectElement
    searchFilters.limit = parseInt(target.value)
    if (searchQuery.value.trim()) {
        searchUsers()
    }
}

function clearSearch() {
    searchQuery.value = ''
    users.value = []
    hasSearched.value = false
}
</script>

<template>
    <div class="user-search introanim">
        <h2 class="fs-secondary-heading fw-bold">Find Users</h2>

        <div class="search-form">
            <div class="form-group">
                <label for="search">Search for users</label>
                <div class="search-input-group">
                    <input
                        type="text"
                        id="search"
                        v-model="searchQuery"
                        placeholder="Enter name or username (min. 2 characters)"
                        :disabled="isSearching"
                    />
                    <button v-if="searchQuery" @click="clearSearch" class="clear-btn" :disabled="isSearching">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                    <button @click="searchUsers" class="search-btn" :disabled="isSearching || searchQuery.trim().length < 2">
                        <span v-if="!isSearching" class="material-symbols-outlined">search</span>
                        <span v-else class="material-symbols-outlined loading-anim">progress_activity</span>
                    </button>
                </div>
                <div v-if="searchError" class="error-message">{{ searchError }}</div>
            </div>

            <div class="search-filters">
                <div class="filter-group">
                    <label for="sort-by">Sort by</label>
                    <select id="sort-by" v-model="searchFilters.sortBy" @change="handleSortChange">
                        <option value="firstName:asc">First Name (A-Z)</option>
                        <option value="firstName:desc">First Name (Z-A)</option>
                        <option value="lastName:asc">Last Name (A-Z)</option>
                        <option value="lastName:desc">Last Name (Z-A)</option>
                        <option value="userName:asc">Username (A-Z)</option>
                        <option value="userName:desc">Username (Z-A)</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="limit">Results</label>
                    <select id="limit" :value="searchFilters.limit" @change="handleLimitChange">
                        <option value="5">5 users</option>
                        <option value="10">10 users</option>
                        <option value="20">20 users</option>
                        <option value="50">50 users</option>
                    </select>
                </div>
            </div>
        </div>

        <div v-if="isSearching" class="search-status loading">
            <span class="loading-anim material-symbols-outlined">progress_activity</span>
            <span>Searching for users...</span>
        </div>

        <div v-else-if="users.length > 0" class="user-results">
            <h3>Search Results</h3>
            <ul class="user-list">
                <li v-for="user in users" :key="user._id" class="user-item">
                    <RouterLink :to="`/user/${user._id}?name=${user.userName}`" class="user-link">
                        <div class="user-avatar">
                            <span class="material-symbols-outlined">person</span>
                        </div>
                        <div class="user-info">
                            <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                            <span class="user-username">@{{ user.userName }}</span>
                        </div>
                        <span class="material-symbols-outlined action-icon">chat</span>
                    </RouterLink>
                </li>
            </ul>
        </div>

        <div v-else-if="hasSearched && searchQuery.trim()" class="search-status no-results">
            <span class="material-symbols-outlined">person_off</span>
            <p>No users found matching "{{ searchQuery }}"</p>
            <p class="suggestion">Try a different search term or check your spelling</p>
        </div>

        <div v-else-if="!hasSearched" class="search-prompt">
			<span class="material-symbols-outlined">travel_explore</span>
			<span>
				<p>Enter a name or username to find users.</p>
				<p class="suggestion">Search by first name, last name, or username.</p>
			</span>
        </div>
    </div>
</template>

<style scoped>
.search-prompt {
	display: flex;
	gap: var(--size-400);
	justify-content: space-around;
	align-items: center;
	align-content: center;
}

.user-search {
    width: 100%;
    margin-top: var(--size-400);
}

.search-form {
    margin-top: var(--size-500);
    margin-bottom: var(--size-600);
}

.search-input-group {
    display: flex;
    align-items: center;
}

.search-input-group input {
    flex: 1;
    padding: var(--size-300);
    border: 1px solid var(--clr-accent-300);
    border-radius: 4px 0 0 4px;
    font-size: var(--fs-400);
    transition: border-color 0.2s;
}

.search-input-group input:focus {
    outline: none;
    border-color: var(--clr-accent-400);
}

.search-btn {
    background-color: var(--clr-accent-400);
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    padding: var(--size-300);
    cursor: pointer;
    display: flex;
    align-items: center;
	/* align-content: center; */
    justify-content: center;
    transition: background-color 0.2s;
	/* gap: var(--size-400); */
}

.clear-btn {
    background-color: var(--clr-accent-200);
    color: var(--clr-accent-500);
    border: none;
    padding: var(--size-300);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-btn:hover:not(:disabled), .clear-btn:hover:not(:disabled) {
    background-color: var(--clr-accent-500);
    color: white;
}

.search-btn:disabled, .clear-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.search-filters {
    display: flex;
    gap: var(--size-400);
    margin-top: var(--size-400);
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--size-200);
}

.filter-group select {
    padding: var(--size-200);
    border: 1px solid var(--clr-accent-300);
    border-radius: 4px;
    background-color: var(--clr-neutral-100);
    color: var(--clr-primary-400);
}

.user-results {
    margin-top: var(--size-500);
}

.user-list {
    list-style: none;
    padding: 0;
    margin-top: var(--size-400);
}

.user-item {
    margin-bottom: var(--size-300);
    border-radius: 4px;
    border: 1px solid var(--clr-accent-200);
    transition: background-color 0.2s;
}

.user-item:hover {
    background-color: var(--clr-accent-100);
}

.user-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--size-400);
    text-decoration: none;
    color: var(--clr-primary-400);
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: var(--fw-semi-bold);
}

.user-username {
    font-size: var(--fs-300);
    color: var(--clr-accent-400);
}

.search-status {
    margin-top: var(--size-500);
    color: var(--clr-accent-500);
    font-style: italic;
	display: flex;
	align-items: center;
	gap: var(--size-400);
}

.loading-anim {
    animation: loading-anim 1s infinite ease-out;
}

@keyframes loading-anim {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
