<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MessageCard from './messageCard.vue'

interface Message {
  senderName: string
  updatedAt: string
  text: string
}

const messages = ref<Message[]>([])
const containerRef = ref<HTMLElement | null>(null)
const newMessageCount = ref(0)
const isLoading = ref(false)
const lastMessageDate = ref('')
const firstMessageDate = ref('')

async function fetchMessages(limit = 20, before?: string) {
  isLoading.value = true
  try {
    let url = `https://hap-app-api.azurewebsites.net/messages?limit=${limit}`
    if (before) {
      url += `&before=${before}`
    }

    console.log('Fetching messages from URL:', url)
    const token = localStorage.getItem('token')
    console.log('Token available:', !!token)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log('Response status:', response.status)
    if (response.ok) {
      const newMessages = await response.json()
      console.log('Fetched messages:', newMessages.length)
      if (newMessages.length > 0) {
        messages.value = [...messages.value, ...newMessages]
        lastMessageDate.value = newMessages[newMessages.length - 1].updatedAt
        if (!firstMessageDate.value) {
          firstMessageDate.value = newMessages[0].updatedAt
        }
      }
    } else {
      const errorText = await response.text()
      console.error('Error response:', errorText)
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
  } finally {
    isLoading.value = false
  }
}

async function checkNewMessages() {
  if (!firstMessageDate.value) return

  try {
    const url = `https://hap-app-api.azurewebsites.net/messages/count?after=${firstMessageDate.value}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      newMessageCount.value = data.total
    }
  } catch (error) {
    console.error('Error checking new messages:', error)
  }
}

async function loadNewMessages() {
  if (newMessageCount.value === 0) return

  try {
    let url = `https://hap-app-api.azurewebsites.net/messages?limit=${newMessageCount.value}`
    if (firstMessageDate.value) {
      url += `&after=${firstMessageDate.value}`
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (response.ok) {
      const newMessages = await response.json()
	  console.log('New messages:', newMessages)
	  // newMessages is an array of message objects
      messages.value = [...newMessages, ...messages.value]
      if (newMessages.length > 0) {
        firstMessageDate.value = newMessages[0].updatedAt
      }
      newMessageCount.value = 0
    }
  } catch (error) {
    console.error('Error loading new messages:', error)
  }
}

function handleScroll() {
  if (!containerRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = containerRef.value
  const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 50

  console.log('Scroll detected:', {
    scrollTop,
    scrollHeight,
    clientHeight,
    scrolledToBottom,
    isLoading: isLoading.value
  })

  // at bottom of container, check for new messages
  if (scrolledToBottom && !isLoading.value) {
    console.log('Loading more messages...')
    fetchMessages(10, lastMessageDate.value)
  }

  // at top of container, check for new messages
  if (scrollTop === 0) {
    console.log('Checking for new messages...')
    checkNewMessages()
  }
}

onMounted(() => {
  fetchMessages()
  setInterval(checkNewMessages, 15000) // Check for new messages every 15 seconds
})
</script>

<template>
  <div class="messages-container" ref="containerRef" @scroll="handleScroll">
    <div v-if="newMessageCount > 0" class="new-messages-banner" @click="loadNewMessages">
      {{ newMessageCount }} new message{{ newMessageCount === 1 ? '' : 's' }} available
    </div>

    <div class="messages-list">
      <MessageCard
        v-for="message in messages"
        :key="message.updatedAt"
        :sender-name="message.senderName"
        :updated-at="message.updatedAt"
        :text="message.text"
      />
    </div>

    <div v-if="isLoading" class="loading-indicator">
      Loading...
    </div>
  </div>
</template>

<style scoped>
.messages-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
  padding: var(--size-400);
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS, or safari stuff */
}

.new-messages-banner {
  position: sticky;
  top: 0;
  background-color: var(--clr-accent-400);
  color: var(--clr-neutral-100);
  padding: var(--size-300);
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: var(--size-400);
  z-index: 1;
  transition: background-color 0.2s;
}

.new-messages-banner:hover {
  background-color: var(--clr-accent-300);
}

.loading-indicator {
  text-align: center;
  padding: var(--size-400);
  color: var(--clr-accent-400);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--size-300);
}
</style>
