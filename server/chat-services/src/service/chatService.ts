import { ChatRepository } from "../repository/chatRepository";
import { AppError } from "@bug-tracker/usermiddleware";
import { Conversation, Message, MessageMedia } from "../types/Conversation";
import { v4 } from "uuid";
import { SocketService } from "./socketService";

export class ChatService {
    private chatRepository: ChatRepository;
    private socketService: SocketService;

    constructor() {
        this.chatRepository = new ChatRepository();
        this.socketService = new SocketService();
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @param {string} receivedId The ID of the user at the other end of the conversation
     * @returns {Promsie<Conversation>} The conversation data
     */
    async createConversation(userId: string, receivedId: string): Promise<Conversation> {
        const conversation: Conversation = {
            id: v4(), /* Genereate an ID for the conversation */
            members: [userId, receivedId], /* Add the user and the receiver to the members list */
            createdAt: Date.now(),
            lastMessage: null, /* Set the last message to null since no message was sent to the conversation yet */
        }

        /* Send the conversation object to the repository layer */
        return await this.chatRepository.createConversation(conversation);
    }
    
    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @param {string} conversationId The ID of the conversation where the message is added to 
     * @param {string} text The message text 
     * @param {MessageMedia[] | null} media The message media
     * @returns {Promise<Message>} The message data
     */
    async addMessage(
        userId: string, 
        conversationId: string, 
        text: string, 
        media: MessageMedia[] | null
    ): Promise<Message> {
        /* Get the conversation data */
        const conversation = await this.getConversation(userId, conversationId);

        /* Get the id of the other user of the conversation */
        const unreadBy = conversation.members.filter((member: string) => member !== userId);

        /* Create the message object */
        const message: Message = {
            id: v4(), /* Generate the ID of the user */
            author: userId, /* Set the author of the message to the user ID */
            conversation: conversation.id,
            timestamp: Date.now(),
            status: "sent",
            edited: false,
            text,
            media,
            readBy: [{ /* Add the user ID and the timestamp to the readBy list */
                userId,
                timestamp: Date.now(),
            }],
            unreadBy,
        }

        /* Get the text of the last message */
        const lastMessage = this.isLastMessage(text, media);

        /* Update the last message of the conversation */
        await this.updateLastMessage(conversationId, lastMessage);

        /* Send the message to the socket room */
        this.socketService.emitEventToRoom(conversationId, `new-conversation-message`, message);

        /* Send the data to the repository layer */
        return await this.chatRepository.addMessage(conversationId, message);
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @returns {Promise<Conversation[]>} The list of conversations the user is part of
     */
    async getUserConversations(userId: string): Promise<Conversation[]> {
        return await this.chatRepository.getUserConversations(userId);
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @param {string} conversationId The ID of the conversation
     * @returns {Promise<Conversation>} The conversation data
     */
    async getConversation(userId: string, conversationId: string): Promise<Conversation> {
        /* Get the conversation data */
        const conversation = await this.chatRepository.getConversation(conversationId);

        /* Check if the user that sent the request is a member of the conversation */
        if (!conversation.members.includes(userId)) {
            throw new AppError(`UnauthorizedRequest`, 401, `Unauthorized request. User is not a conversation member`);
        }

        /* Return the conversation data */
        return conversation;
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {string} conversationId The ID of the conversation
     * @param {number} limit The number of messages retrieved at a time
     * @param {string | undefined} startAfter The ID of the last message retrieved at the last fetching request
     * @returns {Promise<Message[]>} The list of retrieved messages
     */
    async getConversationMessages(userId: string, conversationId: string, limit: number, startAfter?: string): Promise<Message[]> {
        /* Get the conversation data and check if the user is a member of the conversation */
        await this.getConversation(userId, conversationId);

        /* Send the data to the repository layer to retrieve the messages list */
        return await this.chatRepository.getConversationMessages(conversationId, limit, startAfter);
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @param {string} conversationId The ID of the conversation where the message is stored in
     * @param {string} messageId The ID of the message 
     * @returns 
     */
    async getMessage(userId: string, conversationId: string, messageId: string): Promise<Message> {
        /* Get the conversation data and check if the user is part of the conversation */
        await this.getConversation(userId, conversationId);

        /* Send the data to the repository layer */
        return this.chatRepository.getMessage(conversationId, messageId);
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {string} conversationId The ID of the conversation where the messages are stored in
     * @returns {Promise<Message[]>} The list of unread messages for the user 
     */
    async getUnreadMessages(userId: string, conversationId: string): Promise<Message[]> {
        /* Get the conversation data and check if the user is a member of the conversation */
        await this.getConversation(userId, conversationId);

        /* Send teh data to the repository layer to retireve the unread messages for the use */
        return await this.chatRepository.getUnreadMessages(userId, conversationId);
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {string} conversationId The ID of the conversation where the message is stored in
     * @param {string} messageId The ID of the message to be udated 
     * @param {string} text The new text message
     * @returns {Promise<Message>} The updated message data
     */
    async updateMessage(userId: string, conversationId: string, messageId: string, text: string): Promise<Message> {
        /* Get the conversation data */
        const conversation = await this.getConversation(userId, conversationId);

        /* Get the message data */
        let message = await this.getMessage(userId, conversationId, messageId);

        /* Check if the user that sent the request is the author of the message */
        this.isUserAuthor(userId, message.author);

        /* Get the text value of the message */
        const messageValue = this.isLastMessage(message.text, message.media);

        /* Check if the message to be updated is the last message of the conversation */
        if (conversation.lastMessage === messageValue) {
            /* Update the last message property of the conversation
            tto the new text messasge */
            await this.updateLastMessage(conversationId, text);
        }

        /* Send the data to the repository layer to update the message */
        const updatedMessage =  this.chatRepository.updateMessage(conversationId, messageId, text);

        /* Send the updated message data to the socket room */
        this.socketService.emitEventToRoom(conversationId, 'conversation-message-updated', updatedMessage);

        /* Return the updated message data */
        return updatedMessage;
    }

    /**
     * 
     * @param {string} conversationId The ID of the conversation to be updated
     * @param {string} message The last text message sent in the conversation
     * @returns {Promise<Conversation>} The updated conversation
     */
    async updateLastMessage(conversationId: string, message: string): Promise<Conversation> {
        /* Send the data to the repository layer to update the last message of the conversation */
        return await this.chatRepository.updateLastMessage(conversationId, message);
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {string} conversationId The ID of the conversation that stores the messages 
     * @param {string} messages The list with the IDs of the messages to be viewed 
     * @returns {Promise<Message[]>} The list with the updated messages
     */
    async viewMessages(userId: string, conversationId: string, messages: string[]): Promise<Message[]> {
        /* Create an array to add the updated messages to */
        const updatedMessages: Message[] = [];

        /* Map over the messages list */
        messages.forEach(async (messageId: string) => {
            /* For each message ID, send the data to the repository layer and update the readBy field */
            const updatedMessage = await this.chatRepository.viewMessage(userId, conversationId, messageId, Date.now());

            /* Add the updated message to the list created above */
            updatedMessages.push(updatedMessage);
        });

        /* Send the viewed messages to the socket room */
        this.socketService.emitEventToRoom(conversationId, "conversation-messages-viewed", updatedMessages);

        /* Return the list with the updated messages */
        return updatedMessages;
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @param {string} conversationId The ID of the conversation to be deleted 
     * @returns {Promise<string>} "OK" if the conversation was deelted for the user
     */
    async deleteConversation(userId: string, conversationId: string): Promise<string> {
        /* Check if the user is part of the conversation */
        await this.getConversation(userId, conversationId);

        /* Send the data to the repository layer, to remove the user from the conversation */
        return this.chatRepository.deleteUserConversation(userId, conversationId);
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @param {string} conversationId The ID of the conversation with the message to be deleted 
     * @param {string} messageId The ID of the message to be deleted 
     * @returns {Promsie<string>} "OK" if the message was deleted
     */
    async deleteMessage(userId: string, conversationId: string, messages: string[]): Promise<string> {
        /* Get the conversation data */
        const conversation = await this.getConversation(userId, conversationId);

        /* Get the message data */
        /* Check if the user is part of the conversation */
        messages.forEach(async (messageId: string) => {
            const message = await this.getMessage(userId, conversationId, messageId);

            /* Check if the user is the author of the message */
            this.isUserAuthor(userId, message.author);

            /* Get the text value for the message */
            const messageValue = this.isLastMessage(message.text, message.media);

            /* Check if the message to be deleted is the last message of the conversation */
            if (conversation.lastMessage === messageValue) {
                /* Replace the text message with a default deleted message text */
                await this.updateLastMessage(conversationId, `Message was deleted`);
            }

            /* Send the data to the repository layer, to delete the message */
            await this.chatRepository.deleteMessage(conversationId, messageId);
        });

        /* Send the deleted event to the socket room */
        this.socketService.emitEventToRoom(conversationId, "conversation-messages-deleted", messages);
        
        return "OK";
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @param {string} author The ID of the user that sent the message 
     * @returns {boolen} True if the user ID is equal to the author ID
     */
    isUserAuthor(userId: string, author: string): boolean {
        if (userId !== author) {
            throw new AppError(`UnauthorizedRequest`, 401, `Unauthorized Request. User is not the author of the message`);
        }

        return true;
    }

    /**
     * 
     * @param {string} text The text of the message 
     * @param {MessageMedia[] | null} media The media of the message
     * @returns {string} Either the text of the message or the name of the last media file
     */
    isLastMessage(text: string, media: MessageMedia[] | null): string {
        let lastMessage;

        /* Check if any media file has been sent and the the name of the last one */
        const mediaName = media?.at(media.length - 1)?.fileName;

        /* If the media file name exists and the text is an empty string,
         set the last message to the media file name */

        /* Set the last message to the text value otherwise */
        if (mediaName && text === "") {
            lastMessage = mediaName;
        } else { 
            lastMessage = text;
        }

        /* Return the last message value */
        return lastMessage;
    }
}