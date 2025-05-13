import { GroupConversation, Message, MessageMedia } from "../types/Conversation";
import admin from "../../config/firebase";
import { executeWithHandling } from "@bug-tracker/usermiddleware";
import { AppError } from "@bug-tracker/usermiddleware";
import dotenv from "dotenv";
dotenv.config();

const db = admin.firestore();

export class GroupRepository {
    private dbGroupCollection: string;
    private dbMessageSubCollection: string;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.GROUP_COLLECTION || !process.env.GROUP_MESSAGE_SUBCOLLECTION) {
            throw new AppError(`InvalidEnvData`, 400, `Invalid group env. data`);
        }

        this.dbGroupCollection = process.env.GROUP_COLLECTION;
        this.dbMessageSubCollection = process.env.GROUP_MESSAGE_SUBCOLLECTION;
    }

    /**
     * 
     * @param {GroupConversation} groupConversation - The group data received as a parameter form the Service layer
     * @returns {GroupConversation} - Returns the group data if the group was created successfully,
     *  or an error message otherwise
     */
    async createGroup(groupConversation: GroupConversation): Promise<GroupConversation> {
        return executeWithHandling(
            async () => {
                /* Set a new group document with the ID generated in the Service layer for the current group */
                const groupRef = db.collection(this.dbGroupCollection).doc(groupConversation.id);

                /* Add the group data inside the new group document */
                await groupRef.set(groupConversation);  

                /* Return the group data if the group was created */
                return groupConversation;
            },
            `CreateGroupError`,
            500,
            `Failed to create group chat: ${groupConversation.title}`
        );
    }

    /**
     * 
     * @param {Message} message - The message data received as a parameter from the Service layer 
     * @returns {Message} - The message data if the message was added in the conversation,
     *  or an error otherwise
     */
    async addMessage(message: Message): Promise<Message> {
        return executeWithHandling(
            async () => {
                /* Create a message document inside the Messages subcollection for the Groups collection */
                const messageRef = db
                    .collection(this.dbGroupCollection)
                    .doc(message.conversation)
                    .collection(this.dbMessageSubCollection)
                    .doc(message.id);

                /* Add the message data in the new message document */
                await messageRef.set(message);

                /* Get the group data */
                const groupRef = db.collection(this.dbGroupCollection).doc(message.conversation);
                const groupDoc = await groupRef.get();

                if (!groupDoc.exists) {
                    throw new AppError(`GroupNotFound`, 404, `Group chat not found. Cannot update the last message`);
                }

                /* Update the last text message sent in the group with the message added above */
                await groupRef.update({
                    lastMessage: message.text
                });

                /* Return the message data */
                return message;
            },
            `CreateMessageError`,
            500,
            `Faild to send the message`
        );
    }

    /**
     * @param {string} groupId - The ID of the group chat
     * @returns {GroupConversation} - The data of the group if it exists
     */
    async getGroupData(groupId: string): Promise<GroupConversation> {
        return executeWithHandling(
            async () => {
                /* Get the document based on the group ID */
                const groupRef = db.collection(this.dbGroupCollection).doc(groupId);

                /* Fetch the group data based on the document */
                const groupData = await groupRef.get();

                /* Check if the group with the specific ID exists */
                if (!groupData.exists) {
                    throw new AppError(`GroupNotFound`, 404, `Group not found. Cannot fetch group data`);
                }

                /* Return the group data as a GroupConversation object */
                return groupData.data() as GroupConversation;
            },
            `GetGroupError`,
            500,
            `Failed to retrieve group data`
        );
    }

    /**
     * 
     * @param {string} messageId - The ID if the message 
     * @param {string} groupId - The ID of the group chat
     * @returns {Promise<Message>} - The data of the message based on its ID or an error message
     */
    async getMessageData(groupId: string, messageId: string): Promise<Message> {
        return executeWithHandling(
            async () => {
                /* Get the message document based on the group ID and message ID */
                const messageRef = db
                    .collection(this.dbGroupCollection)
                    .doc(groupId)
                    .collection(this.dbMessageSubCollection)
                    .doc(messageId);
                
                const message = await messageRef.get();

                /* Check if the message data exists */
                if (!message.exists) {
                    throw new AppError(`MessageNotFound`, 404, `Message not found`);
                }

                /* Return the data of the message */
                return message.data() as Message;
            },
            `GetMessageError`,
            500,
            `Failed to retrieve message`
        );
    }

    /**
     * 
     * @param {string} groupId - The ID of the group where the messages are stored in 
     * @param {number} limit - The number of messages returned at a time  
     * @param {string} lastMessageId - The ID of the last message after which the fetching will start 
     * @returns {Promise<Message[]>} - The collection of fetched messages
     */
    async getGroupMessages(groupId: string, limit: number, lastMessageId?: string): Promise<Message[]> {
        return executeWithHandling(
            async () => {
                /* Get the messages document collection for messages */
                const groupMessagesRef = db
                    .collection(this.dbGroupCollection)
                    .doc(groupId)
                    .collection(this.dbMessageSubCollection);

                /* Order the messages by timestamp */
                let orderedMessages = groupMessagesRef.orderBy("timestamp", "desc");

                /* Check if the last message ID was provided in the function parameters */
                if (lastMessageId) {
                    /* If the ID was provided, fetch the message document snapshot */
                    const lastMessageSnapshot = await groupMessagesRef.doc(lastMessageId).get();

                    /* If the snapshot exists, start the fetching after that message */
                    if (lastMessageSnapshot.exists) {
                        orderedMessages = orderedMessages.startAfter(lastMessageSnapshot);
                    }
                }

                /* Limit the number of messages fetched at a time*/
                const messagesRef = orderedMessages.limit(limit);

                /* Get the document data */
                const messagesData = await messagesRef.get();

                const messages: Message[] = [];

                /* Add each message to the collection */
                messagesData.forEach((doc) => {
                    messages.push(doc.data() as Message);
                });

                /* Return the message collection */
                return messages;
            },
            `GetMessagesError`,
            500,
            `Failed to retrieve the messages`
        );
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the request 
     * @param {string} groupId - The ID of the group containing the messages
     * @returns {Promise<Message[]>} - The array of group messages not viewed by the user 
     */
    async getUnreadMessages(userId: string, groupId: string): Promise<Message[]> {
        return executeWithHandling(
            async () => {
                /* Get the messages documents from the group */
                const messagesRef = db.collection(this.dbGroupCollection).doc(groupId).collection(this.dbMessageSubCollection);

                /* Filter the messages in order to fetch only the messages that the user has not viewed so far */
                const unreadMessages = await messagesRef.where("unreadBy", "array-contains", userId).get();

                /* Create a new array to add the messages to */
                const messages: Message[] = [];

                /* For each document fetched, add the message data to the messages array created above */
                unreadMessages.forEach((doc) => {
                    messages.push(doc.data() as Message);
                });

                /* Return the array with the messages not viewed by the user yet */
                return messages;
            },
            `GetUnreadMessagesError`,
            500,
            `Failed to retrieve unread messages`
        );
    }

    /**
     * 
     * @param {string} groupId - The ID of the group to be updated
     * @param {string} title - The new group title
     * @returns {Promise<GroupConversation>} - The group data with the updated title
     */
    async updateGroupTitle(groupId: string, title: string): Promise<GroupConversation> {
        return executeWithHandling(
            async () => {
                /* Get the group reference */
                const groupRef = db.collection(this.dbGroupCollection).doc(groupId);

                /* Get the group document */
                const groupDoc = await groupRef.get();

                /* Check if the group exists and throw an error otherwise */
                if (!groupDoc.exists) {
                    throw new AppError(`GroupNotFound`, 404, `Group not found`);
                }

                /* Update the group title */
                await groupRef.set({
                    title: title
                });

                /* Return group with the updated title */
                return (await groupRef.get()).data() as GroupConversation;
            },
            `UpdateGroupTitleError`,
            500,
            `Failed to update the group title`
        );
    }

    /**
     * 
     * @param {string} groupId - The ID of the group to be updated
     * @param {string} description - The new group description
     * @returns {Promise<GroupConversation>} - The group data with the updated description
     */
    async updateGroupDescription(groupId: string, description: string): Promise<GroupConversation> {
        return executeWithHandling(
            async () => {
                /* Get the group reference */
                const groupRef = db.collection(this.dbGroupCollection).doc(groupId);

                /* Get the group document */
                const groupDoc = await groupRef.get();

                /* Check if the group exists and throw an error otherwise */
                if (!groupDoc.exists) {
                    throw new AppError(`GroupNotFound`, 404, `Group not found`);
                }

                /* Update the group title */
                await groupRef.set({
                    title: description
                });

                /* Return group with the updated title */
                return (await groupRef.get()).data() as GroupConversation;
            },
            `UpdateGroupDescriptionError`,
            500,
            `Failed to update the group description`
        );
    }

     /**
     * 
     * @param {string} groupId - The ID of the group to be updated
     * @param {string} photoUrl - The new group photoUrl
     * @returns {Promise<GroupConversation>} - The group data with the updated photoUrl
     */
     async updateGroupPhoto(groupId: string, photoUrl: string): Promise<GroupConversation> {
        return executeWithHandling(
            async () => {
                /* Get the group reference */
                const groupRef = db.collection(this.dbGroupCollection).doc(groupId);

                /* Get the group document */
                const groupDoc = await groupRef.get();

                /* Check if the group exists and throw an error otherwise */
                if (!groupDoc.exists) {
                    throw new AppError(`GroupNotFound`, 404, `Group not found`);
                }

                /* Update the group title */
                await groupRef.set({
                    title: photoUrl
                });

                /* Return group with the updated title */
                return (await groupRef.get()).data() as GroupConversation;
            },
            `UpdateGroupPhotoError`,
            500,
            `Failed to update the group photoUrl`
        );
    }

    /**
     * 
     * @param {string} groupId - The ID of the group  
     * @param {string} members - The updated collection of members 
     * @returns {Promise<GroupConversation>} - The group data with the updated members collection
     */
    async updateGroupMembers(groupId: string, members: string[]): Promise<GroupConversation> {
        return executeWithHandling(
            async () => {
                /* Get the group document data*/
                const groupRef = db.collection(this.dbGroupCollection).doc(groupId);

                /* Get the group document */
                const groupDoc = await groupRef.get();

                /* Check if the group exists */
                if (!groupDoc.exists) {
                    throw new AppError(`GroupNotFound`, 404, `Group not found`);
                }

                /* Update the members collection of the group */
                await groupRef.update({
                    members: members
                });

                /* Get the group data */
                const groupData = (await groupRef.get()).data() as GroupConversation;

                /* Return the updated group data */
                return groupData;
            },
            `UpdateGroupMembersError`,
            500,
            `Failed to update the group members`
        );
    }

    /**
     * 
     * @param {string} messageId - The ID of the message to be updated 
     * @param {string} groupId - The ID of the group where the message is stored in 
     * @param {Message} message - The new message data 
     * @returns {Promise<Message>} - The message data if the message was updated or 
     *  an error otherwise 
     */
    async updateGroupMessage(messageId: string, groupId: string, message: Message): Promise<Message> {
        return executeWithHandling(
            async () => {
                /* Get the message document data based on the group and message IDs from the service layer*/
                const messageRef = db
                    .collection(this.dbGroupCollection)
                    .doc(groupId)
                    .collection(this.dbMessageSubCollection)
                    .doc(messageId);
                
                /* Get the message document */
                const messageDoc = await messageRef.get();

                /* Check if the message exists */
                if (!messageDoc.exists) {
                    throw new AppError(`MessageNotFound`, 404, `Message not found. Cannot update message data`);
                }

                /* Update the message data in the database */
                await messageRef.update({
                    ...message
                });

                /* Return the message data */
                return message;
            },
            `UpdateMessageError`,
            500,
            `Failed to update the message data`
        );
    }

    /**
     * 
     * @param {string} groupId - The ID of the group  
     * @param {string} messageId - The ID of the message the user viewed 
     * @param {{string, number}[]} readBy - The array of user IDs and timestamps of the users who viewed the message 
     * @param {string[]} unreadBy - The updated array of user IDs that have not viewed the message 
     * @returns {Promise<Message>} - The updated message data
     */
    async viewMessage(groupId: string, messageId: string, readBy: {userId: string, timestamp: number}[], unreadBy: string[]): Promise<Message> {
        return executeWithHandling(
            async () => {
                /* Get the message document using the group ID and the message ID from the service layer as parameters */
                const messageRef = db
                    .collection(this.dbGroupCollection)
                    .doc(groupId)
                    .collection(this.dbMessageSubCollection)
                    .doc(messageId);

                /* Get the message document */
                const messageDoc = await messageRef.get();

                /* Check if the message exists */
                if (!messageDoc.exists) {
                    throw new AppError(`MessageNotFound`, 404, `Message not found. Cannot view message`);
                }
                
                /* Update the readBy array with the new readBy array containing the user ID that sent the request 
                    and the current time that the user viewed it */
                await messageRef.update({
                    readBy: readBy
                });

                /* Update the unreadBy array with the new unreadBy array from which the user that sent the request has been removed */
                await messageRef.update({
                    unreadBy: unreadBy
                });

                /* Get the updated message data */
                const message = (await messageRef.get()).data() as Message;

                /* Return the message */
                return message;
            },
            `UpdateMessageError`,
            500,
            `Failed to view message`
        );
    }

    /**
     * 
     * @param {string} groupId - The ID of the group to be deleted 
     * @returns {string} - "OK" if the group was deleted or an error otherwise
     */
    async deleteGroup(groupId: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get the group document based on the id */
                const groupRef = db.collection(this.dbGroupCollection).doc(groupId);

                /* Get the group document */
                const gorupDoc = await groupRef.get();

                /* Check if the group exists */
                if (!gorupDoc.exists) {
                    throw new AppError(`GroupNotFound`, 404, `Group not found. Cannot delete the group`);
                }

                /* Delete the group document from the collection */
                await groupRef.delete();

                /* Return a success message if the group was deleted */
                return "OK";
            },
            `DeleteGroupError`,
            500,
            `Failed to delete the group ${groupId}`
        );
    }

    /**
     * 
     * @param {string} messageId - The ID of the message to be deleted 
     * @param {string} groupId - The ID of the group chat where the messages are stored in
     * @returns {Promsie<string>} - "OK" if the message was deleted or an error otherwise
     */
    async deleteGroupMessage(messageId: string, groupId: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get the message document based on the ID received as a parameter */
                const messageRef = db
                    .collection(this.dbGroupCollection)
                    .doc(groupId)
                    .collection(this.dbMessageSubCollection)
                    .doc(messageId);

                /* Get the group document */
                const messageDoc = await messageRef.get();

                /* Check if the group exists */
                if (!messageDoc.exists) {
                    throw new AppError(`MessageNotFound`, 404, `Message not found. Cannot delete the message`);
                }

                /* Delete the message */
                await messageRef.delete();

                /* Return "OK" if the message was deleted */
                return "OK";
            },
            `DeleteGroupMessageError`,
            500,
            `Failed to delete the message`
        );
    }
}