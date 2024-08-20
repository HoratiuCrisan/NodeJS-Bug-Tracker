import { Timestamp } from "firebase/firestore";

export interface Message {
    messageId: string;
    senderId: string;
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    timestamp: Timestamp;
}

export interface Conversation {
    id: string;
    participants: string[];
    messages: Message[];
}