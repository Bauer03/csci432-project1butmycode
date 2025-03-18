<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Message, MessageCount } from '@/types'

// Define the prop for userId passed from the router
const props = defineProps({
    userId: {
        type: String,
        required: true
    }
})

// butler i am writing this so you understand the suffering i went through to get you my code. discord refused to open, so i tried to use email. but email wasn't uploading the file, so I compressed it and tried again. the wifi is so slow my phone and laptop have a 3hr time difference.
// Then, my computer just disconnected. so i bluetoothed the compressed file to my phone and tried discord agian, no luck. gmail gave me an error i have never seen before about my acct being unavailable on my laptop at this poit. so i pasted it into my phhone email and if you see this, it eventually sent. there are 2 crying babies next to me. i have no legroom.

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const receiverName = ref(route.query.name?.toString() || 'User')
const messages = ref<Message[]>([])
const newMessage = ref('')
const isLoading = ref(true)
const isSending = ref(false)
const error = ref('')
const messageCount = ref(0)
const successMessage = ref('')
const showSuccess = ref(false)
const loadMoreLoading = ref(false)
const noMoreMessages = ref(false)
const limit = ref(20)

// Get current user ID from the store instead of localStorage
const currentUserId = computed(() => userStore.getUserId)

// sort messages by date
const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    )
})

// Group messages by date for better display
const groupedMessages = computed(() => {
    const groups: Record<string, Message[]> = {}

    sortedMessages.value.forEach(message => {
        const date = new Date(message.updatedAt).toLocaleDateString()
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(message)
    })

    return groups
})

// scroll to latest message when messages are loaded
const messagesContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
        setTimeout(() => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
            }
        }, 100) // might tweak if it's too fast or if I want a smoother animation
}

// load msg between current user and selected user
async function loadMessages(before?: string) {
    if (!before) {
        isLoading.value = true
    } else {
        loadMoreLoading.value = true
    }

    error.value = ''

    try {
        const token = userStore.getToken

        if (!token) {
            router.push({ name: 'signin' })
            return
        }

        let url = `https://hap-app-api.azurewebsites.net/messages/${props.userId}?limit=${limit.value}`

        if (before) {
            url += `&before=${before}`
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.status === 200) {
            const data = await response.json() as Message[]

            if (before) {
                // If loading earlier messages, prepend them to start
                if (data.length === 0) {
                    noMoreMessages.value = true
                } else {
                    messages.value = [...data, ...messages.value]
                }
            } else {
                // Initial load or refresh
                messages.value = data
                scrollToBottom()
            }

            await getMessageCount()
        } else if (response.status === 401) {
            router.push({ name: 'signin' })
        } else {
            error.value = 'Failed to load messages'
        }
    } catch (e) {
        error.value = 'Unable to connect to the server'
    } finally {
        isLoading.value = false
        loadMoreLoading.value = false
    }
}

// Load earlier messages when scrolling to the top
function handleScroll(event: Event) {
    const target = event.target as HTMLElement

    if (target.scrollTop < 50 && !loadMoreLoading.value && !noMoreMessages.value && messages.value.length > 0) {
        loadMoreMessages()
    }
}

// Load more messages (older ones)
async function loadMoreMessages() {
    if (messages.value.length > 0) {
        const oldestMessage = [...messages.value].sort((a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )[0]

        await loadMessages(oldestMessage.updatedAt)
    }
}

// Get the count of messages
async function getMessageCount() {
    try {
        const token = userStore.getToken

        if (!token) return

        const url = `https://hap-app-api.azurewebsites.net/messages/${props.userId}/count`

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.status === 200) {
            const data = await response.json() as MessageCount
            messageCount.value = data.total
        }
    } catch (e) {
        console.error('Error fetching message count:', e)
    }
}

// Format date for display
function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

// Check if a message was sent by the current user
function isCurrentUserMessage(message: Message): boolean {
    // Use the computed property instead of directly accessing localStorage
    return message.senderId === currentUserId.value
}

// Send a new message
async function sendMessage() {
    if (!newMessage.value.trim()) {
        error.value = 'Message cannot be empty'
        setTimeout(() => { error.value = '' }, 3000)
        return
    }

    if (newMessage.value.length > 280) {
        error.value = 'Message must be less than 280 characters'
        setTimeout(() => { error.value = '' }, 3000)
        return
    }

    isSending.value = true
    error.value = ''

    try {
        const token = userStore.getToken

        if (!token) {
            router.push({ name: 'signin' })
            return
        }

        const url = `https://hap-app-api.azurewebsites.net/message/${props.userId}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: newMessage.value })
        })

        if (response.status === 201) {
            successMessage.value = 'Message sent!'
            showSuccess.value = true
            setTimeout(() => { showSuccess.value = false }, 3000)
            newMessage.value = ''
            await loadMessages() // Reload messages to include the new one
        } else if (response.status === 401) {
            router.push({ name: 'signin' })
        } else if (response.status === 400) {
            error.value = 'Invalid message format'
        } else {
            error.value = 'Failed to send message'
        }
    } catch (e) {
        error.value = 'Unable to connect to the server'
    } finally {
        isSending.value = false
    }
}

// Handle enter key to send message (Shift+Enter for new line)
function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
    }
}

// Watch for changes in userId to reload messages
watch(() => props.userId, () => {
    receiverName.value = route.query.name?.toString() || 'User'
    messages.value = []
    noMoreMessages.value = false
    loadMessages()
})

// Initial load of messages
onMounted(() => {
    loadMessages()
})

// is there a way to restore search state?
function goBack() {
    router.back()
}
</script>

<template>
    <div class="private-message-container introanim">
        <div class="controls-container">
            <h2 class="fs-secondary-heading fw-bold">Messages with {{ receiverName }}</h2>
            <button class="back-btn" @click="goBack">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </div>

        <div v-if="messageCount > 0" class="message-count">
            {{ messageCount }} message{{ messageCount !== 1 ? 's' : '' }} in conversation
        </div>

        <div
            v-if="isLoading"
            class="loading-container"
        >
            <span class="loading-anim material-symbols-outlined">progress_activity</span>
            <span>Loading messages...</span>
        </div>

        <div
            v-else-if="messages.length === 0"
            class="no-messages"
        >
            No messages yet. Start the conversation!
        </div>

        <div
            v-else
            ref="messagesContainer"
            class="messages-container"
            @scroll="handleScroll"
        >
            <div v-if="loadMoreLoading" class="load-more-indicator">
                <span class="loading-anim material-symbols-outlined">progress_activity</span>
                <span>Loading more messages...</span>
            </div>

            <div v-if="noMoreMessages" class="no-more-messages">
                No more messages to load
            </div>

            <template v-for="(messagesForDate, date) in groupedMessages" :key="date">
                <div class="date-separator">
                    <span>{{ formatDate(messagesForDate[0].updatedAt) }}</span>
                </div>

                <div
                    v-for="message in messagesForDate"
                    :key="message.messageId"
                    class="message"
                    :class="{ 'sent': isCurrentUserMessage(message), 'received': !isCurrentUserMessage(message) }"
                >
                    <div class="message-content">
                        <div class="message-text">{{ message.text }}</div>
                        <div class="message-meta">
                            <span class="message-time">
                                {{ new Date(message.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                            </span>
                            <span class="message-sender">
                                {{ isCurrentUserMessage(message) ? 'You' : message.senderName }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <div class="message-form">
            <div class="form-group">
                <label for="new-message">Send a message</label>
                <textarea
                    id="new-message"
                    v-model="newMessage"
                    :maxlength="280"
                    placeholder="Type your message..."
                    :disabled="isSending"
                    @keydown="handleKeyDown"
                ></textarea>
                <div class="char-count" :class="{ 'near-limit': newMessage.length > 250 }">
                    {{ newMessage.length }}/280
                </div>
                <div class="send-hint">Press Enter to send. Shift+Enter for new line.</div>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>

            <div v-if="showSuccess" class="success-message">{{ successMessage }}</div>

            <button
                v-if="!isSending"
                @click="sendMessage"
                class="button"
            >
                Send Message
            </button>

            <button
                v-else
                class="button loading-btn"
                disabled
            >
                <span>Sending...</span>
                <span class="loading-anim material-symbols-outlined">progress_activity</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.private-message-container {
    width: 100%;
    margin-top: var(--size-400);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.controls-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--size-500);
}

.back-btn {
    font-size: var(--fs-500);
    cursor: pointer;
    background: none;
    color: var(--clr-primary-400);
    border: 2px solid var(--clr-accent-400);
    border-radius: 8px;
    padding: var(--size-200) var(--size-300);
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
}

.back-btn:hover {
    background-color: var(--clr-accent-200);
    color: var(--clr-dark);
}

.message-count {
    font-size: var(--fs-300);
    color: var(--clr-accent-400);
    margin-bottom: var(--size-400);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--size-700);
    color: var(--clr-accent-400);
    gap: var(--size-400);
}

.loading-container .loading-anim {
    font-size: var(--fs-800);
}

.no-messages {
    text-align: center;
    padding: var(--size-700);
    color: var(--clr-accent-400);
    font-style: italic;
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: var(--size-300);
    margin-bottom: var(--size-500);
    display: flex;
    flex-direction: column;
    gap: var(--size-400);
    max-height: 400px;
    border: 1px solid var(--clr-accent-200);
    border-radius: 4px;
    background-color: var(--clr-neutral-100);
}

.date-separator {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: var(--size-400) 0;
}

.date-separator span {
    background-color: var(--clr-accent-200);
    padding: var(--size-100) var(--size-300);
    border-radius: 100vmax;
    font-size: var(--fs-300);
    color: var(--clr-primary-400);
}

.load-more-indicator, .no-more-messages {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--size-200);
    padding: var(--size-300);
    font-size: var(--fs-300);
    color: var(--clr-accent-400);
}

.message {
    display: flex;
    flex-direction: column;
    max-width: 75%;
    margin-bottom: var(--size-300);
}

.message.sent {
    align-self: flex-end;
}

.message.received {
    align-self: flex-start;
}

.message-content {
    padding: var(--size-300);
    border-radius: 8px;
}

.message.sent .message-content {
    background-color: var(--clr-accent-300);
    color: white;
}

.message.received .message-content {
    background-color: var(--clr-accent-200);
    color: var(--clr-primary-400);
}

.message-text {
    margin-bottom: var(--size-200);
    word-wrap: break-word;
    white-space: pre-wrap;
}

.message-meta {
    display: flex;
    justify-content: space-between;
    font-size: var(--fs-300);
    opacity: 0.8;
}

.message-form {
    margin-top: auto;
    padding-top: var(--size-400);
}

textarea {
    width: 100%;
    min-height: 100px;
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

.send-hint {
    font-size: var(--fs-300);
    color: var(--clr-accent-400);
    margin-top: var(--size-100);
    font-style: italic;
}

.error-message {
    color: var(--clr-error);
    margin-bottom: var(--size-300);
}

.success-message {
    color: var(--clr-accent-500);
    margin-bottom: var(--size-300);
}

.loading-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
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
</style>
