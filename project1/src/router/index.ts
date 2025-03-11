import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SignIn from '../views/SignIn.vue'
import Main from '../views/Main.vue'
import Join from '../views/Join.vue'
import profile from '../views/main/ProfileView.vue'
import left from '../views/main/messagePrompt.vue'
import right from '../views/main/rightSide.vue'
import defaultView from '../views/main/defaultView.vue'
import UserSearch from '../views/main/userSearch.vue'
import PrivateMessage from '../views/main/privateMessage.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home,
			meta: {
				authRequired: false,
				checkSignedIn: true
			}
		},
		{
			path: '/signin',
			name: 'signin',
			component: SignIn,
			meta: {
				authRequired: false
			}
		},
		{
			path: '/main',
			component: Main,
			meta: {
				authRequired: true
			},
			children: [
				{
					path: '',
					name: 'main',
					components: {
						left: left,
						middle: defaultView,
						right: right,
					},
					meta: {
						authRequired: true
					}
				},
				{
					path: 'profile',
					components: {
						left: left,
						middle: profile,
						right: right,
					},
					meta: {
						authRequired: true
					}
				},
				{
					path: 'search',
					name: 'user-search',
					components: {
						left: left,
						middle: UserSearch,
						right: right,
					},
					meta: {
						authRequired: true
					}
				}
			],
		},
		{
			path: '/user/:userId',
			name: 'private-message',
			component: Main,
			props: true,
			meta: {
				authRequired: true
			},
			children: [
				{
					path: '',
					components: {
						left: left,
						middle: PrivateMessage,
						right: right,
					},
					props: {
						middle: true
					},
					meta: {
						authRequired: true
					}
				}
			]
		},
		{
			path: '/join',
			name: 'join',
			component: Join,
			meta: {
				authRequired: false
			}
		},
		{
			path: '/:pathMatch(.*)*',
			redirect: { name: 'home' }
		}
	],
})

// Global navigation guard
router.beforeEach((to, from, next) => {
	const isAuthenticated = !!localStorage.getItem('token')
	const checkSignedIn = to.meta.checkSignedIn

	if (to.meta.authRequired && !isAuthenticated) {
		next({ name: 'home' })
	} else {
		next()
	}
})

export default router
