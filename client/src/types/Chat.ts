export type ChatConversation = {
    id: string,
    members: string[],
    createdAt: number,
    lastMessage: null | string,
    lastMessageTimestamp: null | number;
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
    lastMessageTimestamp: null | number,
}

export type Message = {
    id: string,
    timestamp: number,
    authorId: string,
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