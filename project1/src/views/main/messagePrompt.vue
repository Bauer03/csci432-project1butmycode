<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')
const error = ref('')
const isPosting = ref(false)
const successMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)

function dismissSuccess() {
    showSuccess.value = false
}

function dismissError() {
    showError.value = false
}

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function postMessage() {
    if (!message.value.trim()) {
        error.value = 'Message cannot be empty'
        showError.value = true
        setTimeout(() => {
            showError.value = false
        }, 3000)
        return
    }

    if (message.value.length > 280) {
        error.value = 'Message must be less than 280 characters'
        showError.value = true
        setTimeout(() => {
            showError.value = false
        }, 3000)
        return
    }

    isPosting.value = true
	await wait(500);
    error.value = ''
    successMessage.value = ''
    showError.value = false

    try {
        const url = 'https://hap-app-api.azurewebsites.net/message'
        const token = localStorage.getItem('token')

        if (!token) {
            error.value = 'You must be logged in to post messages'
            showError.value = true
            setTimeout(() => {
                showError.value = false
            }, 3000)
            return
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: message.value })
        }

        const response = await fetch(url, options)

        if (response.status === 201) {
            successMessage.value = 'Message posted successfully!'
            message.value = ''
            showSuccess.value = true
            setTimeout(() => {
                showSuccess.value = false
            }, 3000)
        } else if (response.status === 401) {
            error.value = 'Please sign in again to post messages'
            showError.value = true
            setTimeout(() => {
                showError.value = false
            }, 3000)
        } else if (response.status === 400) {
            error.value = 'Invalid message format'
            showError.value = true
            setTimeout(() => {
                showError.value = false
            }, 3000)
        } else {
            error.value = 'An error occurred while posting your message'
            showError.value = true
            setTimeout(() => {
                showError.value = false
            }, 3000)
        }
    } catch (e) {
        error.value = 'Unable to connect to the server'
        showError.value = true
        setTimeout(() => {
            showError.value = false
        }, 3000)
    } finally {
        isPosting.value = false
    }
}
</script>

<template>
    <div class="left-side introanim">
        <h2 class="fs-secondary-heading fw-bold">Message Board</h2>

        <div class="message-form">
            <div class="form-group">
                <label for="message">Post a Message</label>
                <textarea
                    id="message"
                    v-model="message"
                    :maxlength="280"
                    placeholder="What's on your mind?"
                    :disabled="isPosting"
                ></textarea>
                <div class="char-count" :class="{ 'near-limit': message.length > 250 }">
                    {{ message.length }}/280
                </div>
            </div>

            <div v-if="showError" class="error-toast">
                <span>{{ error }}</span>
                <button class="dismiss-button" @click="dismissError">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div v-if="showSuccess" class="success-message">
                <span>{{ successMessage }}</span>
                <button class="dismiss-button" @click="dismissSuccess">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <button
                v-if="!isPosting"
                @click="postMessage"
                class="button"
            >
                Post
            </button>

            <button
                v-else
                @click="postMessage"
                class="button loading-btn"
                disabled
            >
                <span>Posting...</span><span class="loading-anim material-symbols-outlined">progress_activity</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.loading-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
}

.left-side {
    width: 100%;
    margin-top: var(--size-400);
}

.message-form {
    margin-top: var(--size-500);
}

textarea {
    width: 100%;
    min-height: 120px;
    padding: var(--size-300);
    border: 1px solid var(--clr-accent-300);
    border-radius: 4px;
    font-size: var(--fs-400);
    font-family: var(--ff-body);
    resize: vertical;
    transition: border-color 0.2s;
}

textarea:focus {
    outline: none;
    border-color: var(--clr-accent-400);
}

.char-count {
    text-align: right;
    font-size: var(--fs-300);
    color: var(--clr-accent-400);
    margin-top: var(--size-200);
}

.char-count.near-limit {
    color: var(--clr-error);
}

.success-message,
.error-toast {
    position: fixed;
    top: var(--size-400);
    right: var(--size-400);
    padding: var(--size-300);
    border-radius: 4px;
    font-size: var(--fs-400);
    display: flex;
    align-items: center;
    gap: var(--size-300);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    animation: slide-in 0.3s ease-out;
}

.success-message {
    background-color: var(--clr-accent-100);
    color: var(--clr-accent-500);
    border: 1px solid var(--clr-accent-300);
}

.error-toast {
    background-color: hsl(0, 100%, 97%);
    color: var(--clr-error);
    border: 1px solid hsl(0, 65%, 90%);
}

.dismiss-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.success-message .dismiss-button {
    color: var(--clr-accent-400);
}

.success-message .dismiss-button:hover {
    color: var(--clr-accent-500);
}

.error-toast .dismiss-button {
    color: var(--clr-error);
}

.error-toast .dismiss-button:hover {
    color: hsl(0, 65%, 41%);
}

@keyframes slide-in {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
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

button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loading-anim {
    animation: loading-anim 1s infinite ease-out;
    font-size: var(--fs-500);
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
