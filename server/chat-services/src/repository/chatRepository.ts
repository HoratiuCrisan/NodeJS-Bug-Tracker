import admin from "../config/firebase";
import { Message, Conversation } from "../types/Conversation";
import { executeWithHandling, AppError } from "@bug-tracker/usermiddleware";
import env from "dotenv";
env.config();

const db = admin.firestore();

export class ChatRepository {
    private dbConversationCollection: string;
    private dbMessageCollection: string;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.CONVERSATION_COLLECTION || !process.env.CONVERSATION_MESSAGE_SUBCOLLECTION) {
            throw new AppError(`InvalidEnvData`, 400, `Invalid env. data`);
        }

        this.dbConversationCollection = process.env.CONVERSATION_COLLECTION;
        this.dbMessageCollection = process.env.CONVERSATION_MESSAGE_SUBCOLLECTION;
    }

    /**
     * 
     * @param {Conversation} conversation The conversation object created at the service layer 
     * @returns {Promise<Conversation>} The conversation data stored in the database
     */
    async createConversation(conversation: Conversation): Promise<Conversation> {
        return executeWithHandling(
            async () => {
                /* Create the conversation document with the ID generated at the service layer */
                const conversationRef = db.collection(this.dbConversationCollection).doc(conversation.id);

                /* Add the conversation data inside the document */
                await conversationRef.set(conversation);

                /* Return the conversation data from the document */
                return (await conversationRef.get()).data() as Conversation;
            },
            `CreateConversationError`,
            500,
            `Failed to create the conversation`
        );
    }

    /**
     * 
     * @param {string} conversationId The ID of the conversation where the message is added  
     * @param {Message} message The message object created in the service layer  
     * @returns {Promsie<Message>} The message data 
     */
    async addMessage(conversationId: string, message: Message): Promise<Message> {
        return executeWithHandling(
            async () => {
                /* Create a new message document inside the conversation document */
                const messageRef = db.collection(this.dbConversationCollection)
                    .doc(conversationId)
                    .collection(this.dbMessageCollection)
                    .doc(message.id);
                
                /* Add the data inside the message document */
                await messageRef.set(message);

                /* Return the data of the created message */
                return (await messageRef.get()).data() as Message;
            },
            `CreateMessageError`,
            500,
            `Failed to send the message`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @returns {Conversation[]} The list of conversations the user is part of
     */
    async getUserConversations(userId: string): Promise<Conversation[]> {
        return executeWithHandling(
            async () => {
                /* Get the conversation reference */
                const conversationsRef = db.collection(this.dbConversationCollection);

                /* Get all the conversation in which the user is part of */
                const conversationsSnapshot = await conversationsRef.where("members", "array-contains", userId).orderBy("lastMessageTimestamp", "desc").get();

                const conversations: Conversation[] = [];
                
                /* Map over each conversation document and add the conversation to the list created above */
                conversationsSnapshot.forEach((doc) => {
                    conversations.push(doc.data() as Conversation)    
                });

                /* Return the conversations list */
                return conversations;
            },
            `GetConversationsError`,
            500,
            `Failed to retrieve conversations`
        )
    }

    /**
     * 
     * @param {string} conversationId The ID of the conversation
     * @returns {Promise<Conversation>} The conversation data
     */
    async getConversation(conversationId: string): Promise<Conversation> {
        return executeWithHandling(
            async () => {
                /* Get the conversation reference */
                const conversationRef = db.collection(this.dbConversationCollection).doc(conversationId);

                /* Get the conversation document */
                const conversation = await conversationRef.get();
                
                /* If the document does not exist throw a not found error */
                if (!conversation.exists) {
                    throw new AppError(`ConversationNotFound`, 404, `Conversation not found`);
                }   

                /* Return the conversation data */
                return conversation.data() as Conversation;
            },
            `GetConversationError`,
            500,
            `Failed to retrieve conversation`
        );
    }

    async checkConversation(userId1: string, userId2: string): Promise<Conversation | null> {
        return executeWithHandling(
            async () => {
                const conversationRef = db.collection(this.dbConversationCollection).where("members", "array-contains", userId1);

                const conversationSnapshot = await conversationRef.get();

                if (conversationSnapshot.empty) {
                    return null;
                }

                const conersation = conversationSnapshot.docs.find(doc => {
                    const data = doc.data() as Conversation;
                    const members = data.members || [];

                    return members.includes(userId2) && members.length === 2;
                });

                if (!conersation) return null;

                return conersation.data() as Conversation;
            },
            `FailedToCheckConversation`,
            500,
            `Failed to check if direct conversation exists`
        );
    }

    /**
     * 
     * @param {string} conversationId The ID of the conversation where the messages are stored in
     * @param {number} limit The number of messages fetched at a time
     * @param {string | undefined} startAfter The last message retrieved at the last fetching request
     * @returns {Promise<Message[]>} The list of messages retrieved
     */
    async getConversationMessages( 
        conversationId: string, 
        limit: number, 
        startAfter?: string
    ): Promise<Message[]> {
        return executeWithHandling(
            async () => {
                /* Get the messages subcollection from the conversation document */
                const messagesRef = db
                    .collection(this.dbConversationCollection)
                    .doc(conversationId)
                    .collection(this.dbMessageCollection);

                /* Order the messages by the timestamp*/
                let orderedMessages = messagesRef.orderBy("timestamp", "desc");

                if (startAfter) {
                    /* If the ID of the last message fetched, get the document for that message */
                    const lastDocSnapshot = await messagesRef.doc(startAfter).get();

                    /* If the document exists, start the fetching after it */
                    if (lastDocSnapshot.exists) {
                        orderedMessages = orderedMessages.startAfter(startAfter);
                    }
                }

                /* Limit the number of messages fetched at a time */
                orderedMessages = orderedMessages.limit(limit);

                /* Get the documents fetched */
                const messageCollection = await orderedMessages.get();
                
                const messages: Message[] = [];

                /* Add each message to the messages list created above */
                messageCollection.forEach((doc) => {
                    messages.push(doc.data() as Message)
                });

                /* Return the list of messages */
                return messages.reverse();
            },
            `GetMessagesError`,
            500,
            `Failed to retrieve messages`
        );
    }

    /**
     * 
     * @param {string} conversationId  The ID of the conversation where the message is stored in
     * @param {string} messageId The ID of the message 
     * @returns {Promise<Message>} The message data 
     */
    async getMessage(conversationId: string, messageId: string): Promise<Message> {
        return executeWithHandling(
            async () => {
                /* Get the message reference */
                const messageRef = db
                    .collection(this.dbConversationCollection)
                    .doc(conversationId)
                    .collection(this.dbMessageCollection)
                    .doc(messageId);

                /* Get the message document */
                const messageDoc = await messageRef.get();

                /* Check if the message document exists */
                if (!messageDoc.exists) {
                    throw new AppError(`MessageNotFound`, 404, `Message not found`);
                }

                /* Return the message */
                return messageDoc.data() as Message;
            },
            `GetMessageError`,
            500,
            `Failed to retrieve message`
        )
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request
     * @param {string} conversationId The ID of the conversation
     * @returns {Promise<Message[]>} The list of messages the user has not read from the conversation
     */
    async getUnreadMessages(userId: string, conversationId: string): Promise<Message[]> {
        return executeWithHandling(
            async () => {
                /* Get the messages reference */
                const messagesRef = db
                    .collection(this.dbConversationCollection)
                    .doc(conversationId)
                    .collection(this.dbMessageCollection);

                /* Get the snapshots for the messages the user has not read */
                let messagesSnapshot = messagesRef.where("unreadBy", "array-contains", userId);

                const messages: Message[] = [];

                /* Get the messages documents */
                const messagesDocs = await messagesSnapshot.get();

                /* For each message document, add the message data to the list created above */
                messagesDocs.forEach((doc) => {
                    messages.push(doc.data() as Message);
                });

                /* Return the messages list */
                return messages;    
            },
            `GetUnreadMessagesError`,
            500,
            `Faild to retireve unread messages`
        );
    }

    

    /**
     * 
     * @param {string} conversationId The ID of the conversation where the message is stored in 
     * @param {string} messageId The ID of the message
     * @param {string} text The updated text of the message
     * @returns {Promise<Message>} The updated message data
     */
    async updateMessage(conversationId: string, messageId: string, text: string): Promise<Message> {
        return executeWithHandling(
            async () => {
                /* Get the message reference */
                const messageRef = db
                    .collection(this.dbConversationCollection)
                    .doc(conversationId)
                    .collection(this.dbMessageCollection)
                    .doc(messageId);
                
                /* Get the message document */
                const messageDoc = await messageRef.get();

                /* Check if the message exists */
                if (!messageDoc.exists) {
                    throw new AppError(`MessageNotFound`, 404, `Message not found. Failed to update message`);
                }
                
                /* Update the message text and switch the edited field to true */
                await messageRef.update({
                    text,
                    edited: true,
                });

                /* Return the updated message data */
                return (await messageRef.get()).data() as Message;
            },
            `UpdateMessageError`,
            500,
            `Failed to update message`
        )
    }

    /**
     * 
     * @param {string} conversationId The ID of the conversation to be udpated 
     * @param {string} message The last text message of the conversation 
     * @returns {Promise<Conversation>} The updated conversation
     */
    async updateLastMessage(conversationId: string, message: string): Promise<Conversation> {
        return executeWithHandling(
            async () => {
                /* Get the conversation reference */
                const conversationRef = db.collection(this.dbConversationCollection).doc(conversationId);

                /* Get the conversation document */
                const conversationDoc = await conversationRef.get();

                /* Check if the conversation document exists */
                if (!conversationDoc.exists) {
                    throw new AppError(`ConversationNotFound`, 404, `Conversation not found. Failed to update the last message`);
                }

                /* Update the last message property of the conversation */
                await conversationRef.update({
                    lastMessage: message,
                    lastMessageTimestamp: Date.now(),
                });

                /* Return the updated conversation */
                return (await conversationRef.get()).data() as Conversation;
            },
            `UpdateLastMessageError`,
            403,
            `Failed to update the last message of the conversation`,
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the request 
     * @param {string} conversationId The ID of the conversation where the message is stored in
     * @param {string} messageId The ID of the message 
     * @param {number} timestamp The timestamp when the user viewed the message 
     * @returns {Promsie<Message>} The updated message data
     */
    async viewMessage(userId: string, conversationId: string, messageId: string, timestamp: number): Promise<Message> {
        return executeWithHandling(
            async () => {
                /* Get the message reference */
                const messageRef = db
                    .collection(this.dbConversationCollection)
                    .doc(conversationId)
                    .collection(this.dbMessageCollection)
                    .doc(messageId);

                /* Get the message document */
                const messageDoc = await messageRef.get();

                /* Check if the document exists */
                if (!messageDoc.exists) {
                    throw new AppError(`MessageNotFound`, 404, `Message not found. Failed to view message`);
                }

                /* Add the user ID and the timestamp the user viewed the message */
                await messageRef.update({
                    readBy: admin.firestore.FieldValue.arrayUnion({
                        userId,
                        timestamp,
                    }),
                    unreadBy: [],
                });

                /* Return the updated message data */
                const viewed = (await messageRef.get()).data() as Message;

                console.log("viewed: ", viewed);

                return viewed;
            },
            `UpdateMessageError`,
            500,
            `Failed to update message`
        )
    }

    /**
     * 
     * @param {string} conversationId The ID of the conversation where the message is stored in 
     * @param {string} messageId The ID of the message
     * @returns {Promsie<string>} "OK" if the message was deleted
     */
    async deleteMessage(conversationId: string, messageId: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get the message reference */
                const messageRef = db
                    .collection(this.dbConversationCollection)
                    .doc(conversationId)
                    .collection(this.dbMessageCollection)
                    .doc(messageId);

                /* Get the message document */
                const messageDoc = await messageRef.get();

                /* Check if the message document exists */
                if (!messageDoc.exists) {
                    throw new AppError(`MessageNotFound`, 404, `Message not found. Failed to delete message`);
                }

                /* Delete the message document */
                await messageRef.delete();

                /* Return "OK" if the message was deleted */
                return "OK";
            },
            `DeleteMessageError`,
            500,
            `Failed to delete message`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user to be removed from the conversation 
     * @param {string} conversationId The ID of the conversation
     * @returns {Promsie<string>} "OK" if the user was removed from the conversation
     */
    async deleteUserConversation(userId: string, conversationId: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get the conversation reference */
                const conversationRef = db.collection(this.dbConversationCollection).doc(conversationId);

                /* Get the document data */
                const conversationDoc = await conversationRef.get();

                if (!conversationDoc.exists) {
                    throw new AppError(`ConversationNotFound`, 404, `Conversation not found. Failed to delete conversation`);
                }

                /* Remove the user from the conversation in order for the other user to have access to the conersation data */
                await conversationRef.update({
                    members: admin.firestore.FieldValue.arrayRemove(userId)
                });

                return "OK";
            },
            `DeleteConversationError`,
            500,
            `Failed to delete conversation`
        );
    }
}