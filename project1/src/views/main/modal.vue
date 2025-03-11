<script setup lang="ts">
defineProps({
	show: {
		type: Boolean,
		required: true,
	},
})

const emit = defineEmits(['close', 'save', 'cancel'])
// these 'emits' are sent by the modal and can be handled in profile.vue, or wherever else the modal is mounted.
</script>

<template>
	<Teleport to="body">
		<div v-if="show" class="modal-overlay" @click="emit('close')">
			<div class="modal" @click.stop>
				<div class="modal-header">
					<h2>Edit Profile</h2>
					<button class="close-btn" @click="emit('close')">&times;</button>
				</div>
				<div class="modal-content">
					<slot></slot>
				</div>
				<div class="modal-footer">
					<button class="cancel-btn" @click="emit('cancel')">Cancel</button>
					<button class="save-btn" @click="emit('save')">Save Changes</button>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.modal {
	background: var(--clr-accent-100);
	border-radius: 8px;
	padding: 1.5rem;
	width: 90%;
	max-width: 500px;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.close-btn {
	background: none;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
	margin-top: 1.5rem;
}

button {
	padding: 0.5rem 1rem;
	border-radius: 4px;
	cursor: pointer;
	border: none;
}

.save-btn {
	background: var(--clr-primary);
	color: white;
}

.cancel-btn {
	background: var(--clr-accent-200);
}
</style>
