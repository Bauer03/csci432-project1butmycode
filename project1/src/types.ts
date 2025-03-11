export interface userData {
	user: user,
	token: string
}

export interface user {
	_id: string
	email: string
	userName: string
	firstName: string
	lastName: string
}

export interface Message {
	text: string
	updatedAt: string
	messageId: string
	senderId: string
	senderName: string
	receiverId: string
	receiverName: string
}

export interface MessageCount {
	total: number
}
