import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { userData, user } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State as refs
  const user = ref<user | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = ref(false)
  
  // Getters as computed properties with proper typing
  const getUserId = computed((): string => user.value?._id || '')
  const getToken = computed((): string | null => token.value)
  const getUserData = computed((): user | null => user.value)
  const getIsAuthenticated = computed((): boolean => isAuthenticated.value)
  
  // Actions as functions
  function setUserData(userData: userData) {
    user.value = userData.user
    token.value = userData.token
    isAuthenticated.value = true
    
    // Still store in localStorage for persistence across browser refreshes
    localStorage.setItem('userData', JSON.stringify(userData.user))
    localStorage.setItem('userId', userData.user._id)
    localStorage.setItem('token', userData.token)
  }
  
  function initializeFromStorage() {
    // Initialize store from localStorage on app start
    const storedToken = localStorage.getItem('token')
    const userDataJson = localStorage.getItem('userData')
    
    if (storedToken && userDataJson) {
      try {
        const userData = JSON.parse(userDataJson)
        user.value = userData
        token.value = storedToken
        isAuthenticated.value = true
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e)
        logout()
      }
    }
  }
  
  function logout() {
    // Clear state
    user.value = null
    token.value = null
    isAuthenticated.value = false
    
    // Clear localStorage
    localStorage.removeItem('userData')
    localStorage.removeItem('userId')
    localStorage.removeItem('token')
  }
  
  // Reset function similar to your example
  function $reset() {
    user.value = null
    token.value = null
    isAuthenticated.value = false
  }
  
  return {
    // State
    user,
    token,
    isAuthenticated,
    
    // Getters
    getUserId,
    getToken,
    getUserData,
    getIsAuthenticated,
    
    // Actions
    setUserData,
    initializeFromStorage,
    logout,
    $reset
  }
}) 