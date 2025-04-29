export type Conversation = {
    id: string,
    members: string[],
    createdAt: number,
    lastMessage: null | string,
}

export type GroupConversation = {
    id: string,
    members: string[],
    createdAt: number,
    title: string,
    description: string,
    admin: string,
    photoUrl: string,
    lastMessage: null | string,
}

export type Message = {
    id: string,
    timestamp: number,
    author: string,
    conversation: string,
    status: string,
    edited: boolean,
    text: string,
    media: null | MessageMedia[],
    readBy: {userId: string, timestamp: number}[],
    unreadBy: string[],
}

export type MessageMedia = {
    url: string,
    fileType: string,
    fileName: string,
}

