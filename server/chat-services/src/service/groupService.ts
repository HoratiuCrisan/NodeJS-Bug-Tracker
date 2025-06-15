import { GroupConversation, Message } from "../types/Conversation";
import { v4 } from "uuid";
import { MessageMedia } from "../types/Conversation";
import { GroupRepository } from "../repository/groupRepository";
import { socketService } from "./socketService";
import { AppError } from "@bug-tracker/usermiddleware";

export class GroupService {

    private groupRepository: GroupRepository;
    // private socketService: SocketService;

    constructor() {
        this.groupRepository = new GroupRepository();
        // this.socketService = new SocketService();
    }
    /**
     * 
     * @param {string} userId - The ID of the user that creates the group 
     * @param {string} title - The name of the group (up to 30 characters long) 
     * @param {string} description - The group description (optional and up to 255 characters long)
     * @param {string[]} members - The IDs of the group members (at least 2 members)
     * @param {string} photoUrl - The group image 
     */
    async createGroup(
        userId: string, 
        title: string, 
        description: string, 
        members: string[], 
        photoUrl: string
    ): Promise<GroupConversation> {
        /* Get the time of when the group is being created */
        const creationTimestamp = Date.now();

        /* Add the group creator to the members list */
        members.push(userId);

        /* Create the group object with the data from the funciton parameters */
        const group: GroupConversation = {
            id: v4(), /* Generate an ID for the grou */
            title,
            description,
            admin: userId, /* The creator is the admin of the group */
            members,
            photoUrl,
            createdAt: creationTimestamp,
            lastMessage: null,
            lastMessageTimestamp: null,
        };

        /* Return the group data, after being added in the database inside the repository layer */
        return await this.groupRepository.createGroup(group);
    }

    /**
     * 
     * @param {string} userId - The sender of the message
     * @param {string} groupId - The ID of the group where the message was sent at 
     * @param {string} text - The caption of the message  
     * @param {MessageMedia} media - The files sent with the message
     * @returns {Promise<Message>} - The message if the data was stored in the database
     */
    async addMessage(userId: string, groupId: string, text: string, media: MessageMedia[] | null): Promise<Message> {
        /* Get the time when the message was sent by the user */
        const creationTimestamp = Date.now();
        const readBy = [{
            userId,
            timestamp: creationTimestamp
        }];

        /* Get the group data */
        const groupData = await this.getGroupData(userId, groupId);

        /* Get all the members except for the one who sent the message */
        const members = groupData.members.filter(member => member !== userId)

        /* Create the Message object with the data form the function parameters*/
        const message: Message = {
            id: v4(), /* Generate a unique ID for the message */
            authorId: userId, /* The author is the ID of the user that sent the message */
            conversation: groupId, /* The group in wich the message was sent */
            text,
            media,
            timestamp: creationTimestamp,
            edited: false,
            status: "sent", 
            readBy,  /* List of users that have read the message */
            unreadBy: members, /* Add all the members of the group into a list to know which users did not view the message */
        };
        
        console.log("Group id: ", groupId)
        const response = await this.groupRepository.addMessage(message);

        /* Send the message to the group chat room */
        try {
            socketService.emitEventToRoom(groupId, "new-group-message", JSON.parse(JSON.stringify(response)));
        } catch (error) {
            console.error("Socket emit failed: ", error);
        }

        /* Send the message to the repository layer to add it to the group chat database */
        /* Return the message data */
        return response;
    }

    async getUserGroups(userId: string): Promise<GroupConversation[]> {
        return await this.groupRepository.getUserGroups(userId);
    }

    /**
     * 
     * @param {string} userId - The ID of the user should be inside the members list in order to get the data of the group 
     * @param {string} groupId - The ID of the group 
     * @returns {Promise<GroupConversation>} - The group data if the user that made the request is a member of the group,
     *  and an error otherwise
     */
    async getGroupData(userId: string, groupId: string): Promise<GroupConversation> {
        /* Get the group data based on the group ID */
        const group: GroupConversation = await this.groupRepository.getGroupData(groupId);

        /* Check if the user that made the request is a member of the group */
        /* If the user is not a member throw an error */
        if (!group.members.includes(userId)) {
            throw new AppError(`UnauthorizedRequest`, 403, `Failed to get group data. User is not a group member`);
        }

        /* Return the data of the group */
        return group;
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the fetching request 
     * @param {string} groupId - The ID of the group where the messages are stored in 
     * @param {number} limit - The number of messages that will be fetched at a time 
     * @param {string} lastMessage - The ID of the last message fetched at the last request
     * @returns {Promise<Message[]>} - The collection of fetched messages
     */
    async getGroupMessages(userId: string, groupId: string, limit: number, lastMessage?: string): Promise<Message[]> {
        /* Get the data of the group and check if the user is a member of the group
        by calling the service layer method to get the group data */
        await this.getGroupData(userId, groupId);
        
        /* Get the messages collection from the repository layer */
        return await this.groupRepository.getGroupMessages(groupId, limit, lastMessage);
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the request
     * @param {string} groupId - The ID of the group containing the messages
     * @returns {Promise<Message[]>} - An array of messages that the user has not viewed yet
     */
    async getUnreadMessages(userId: string, groupId: string): Promise<Message[]> {
        /* Get the data of the group and check if the user is a member of the group
        by calling the service layer method to get the group data */
        await this.getGroupData(userId, groupId);

        /* Get the unread message array from the repository layer based on the user ID and group ID */
        return await this.groupRepository.getUnreadMessages(userId, groupId);
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the udpate request 
     * @param {string} groupId - The ID of the group to be updated 
     * @param {string} title - The new group title 
     * @returns {Promise<GroupConversation>} - The group data with the updated title
     */
    async updateGroupTitle(userId: string, groupId: string, title: string): Promise<GroupConversation> {
        /* Fetch the group data */
        const groupData = await this.getGroupData(userId, groupId);
        
        /* Check if the user that sent the request is the admin of the group */
        this.isUserAdmin(userId, groupData.admin);

        /* Send the data to the repository layer to update the group title */
        const updatedGroup = await this.groupRepository.updateGroupTitle(groupId, title);

        /* Send the updated group data to the group chat room */
        socketService.emitEventToRoom(groupId, "group-title-updated", updatedGroup);

        /* Return the updated group data */
        return updatedGroup;
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the udpate request 
     * @param {string} groupId - The ID of the group to be updated 
     * @param {string} description - The new group description 
     * @returns {Promise<GroupConversation>} - The group data with the updated description
     */
    async updateGroupDescription(userId: string, groupId: string, description: string): Promise<GroupConversation> {
        /* Fetch the group data */
        const groupData = await this.getGroupData(userId, groupId);

        /* Check if the user that sent the request is the admin of the group */
        this.isUserAdmin(userId, groupData.admin);

        /* Send the data to the repository layer to update the group description */      
        const updatedGroup = await this.groupRepository.updateGroupDescription(groupId, description);

        /* Send the updated group data to the group chat room */
        socketService.emitEventToRoom(groupId, "group-description-updated", updatedGroup);
 
        /* Return the updated group data */
        return updatedGroup;
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the udpate request 
     * @param {string} groupId - The ID of the group to be updated 
     * @param {string} photoUrl - The new group photo 
     * @returns {Promise<GroupConversation>} - The group data with the updated photo
     */
    async updateGroupPhoto(userId: string, groupId: string, photoUrl: string): Promise<GroupConversation> {
        /* Fetch the group data */
        const groupData = await this.getGroupData(userId, groupId);

        /* Check if the user is the admin of the group */
        this.isUserAdmin(userId, groupData.admin);

        /* Send the data to the repository layer to update the group photo */
        const updatedGroup = await this.groupRepository.updateGroupPhoto(groupId, photoUrl);

        /* Send the updated group data to the group chat room */
        socketService.emitEventToRoom(groupId, "group-photo-updated", updatedGroup);

        /* Return the updated group data */
        return updatedGroup;
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the message update request 
     * @param {string} messageId - The ID of the message to be updated 
     * @param {string} groupId - The ID of the group where the message is stored in 
     * @param {string} text - The edited text message 
     * @returns {Promsie<Message>} - The updated message data
     */
    async updateGroupMessage(userId: string, messageId: string, groupId: string, text: string): Promise<Message> {
        /* Get the message data based on the group and message ID */
        let messageData = await this.groupRepository.getMessageData(groupId, messageId);

        /* Check if the user that sent the request is the author of the message */
        /* Throw an error if the user is not the author */
        if (userId !== messageData.authorId) {
            throw new AppError(`UnauthorizedRequest`, 403, `Failed to update the message. User is the author of the message`);
        }

        /* Mark the edited field to true and update the textd data */
        messageData.edited = true;
        messageData.text = text;
        
        /* Send the updated data to the repository layer */
        const updatedMessage = await this.groupRepository.updateGroupMessage(messageId, groupId, messageData);

        /* Send the updated message to the group chat room */
        socketService.emitEventToRoom(groupId, "group-message-updated", updatedMessage);

        /* Return the updated message data */
        return updatedMessage;
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the updating request 
     * @param {string} groupId - The ID of the group to be updated
     * @param {string} newMembers - The collection with the new members 
     * @returns {Promise<GroupConversation>} - The updated data of the group
     */
    async addGroupMembers(userId: string, groupId: string, newMembers: string[]): Promise<GroupConversation> {
        /* Get the group data */
        const groupData = await this.getGroupData(userId, groupId);

        /* Check if the user that sent the request is the admin of the grou */
        /* If the user is not the admin throw a new error */
        if (userId !== groupData.admin) {
            throw new AppError(`UnauthorizedRequest`, 403, `Failed to add members. User is not an admin`);
        }

        /* Create a new set from combining the new members list with the original one in case of duplicates*/
        const membersSet = new Set(groupData.members.concat(...newMembers));

        /* Convert the set to a list again and perform the update */
        const updatedGroup = await this.groupRepository.updateGroupMembers(groupId, Array.from(membersSet));

        /* Send the updated group data to the group chat room */
        socketService.emitEventToRoom(groupId, "group-members-updated", updatedGroup);

        /* Return the updated group data */
        return updatedGroup;
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the update reqeust 
     * @param {string} groupId - The ID of the group where the members are in
     * @param {string[]} removedMembers - The list with the IDs of the members to be removed 
     * @returns {Promise<GroupConversation>} - The updated group data 
     */
    async removeGroupMembers(userId: string, groupId: string, removedMembers: string[]): Promise<GroupConversation> {
        /* Get the group data */
        const groupData = await this.getGroupData(userId, groupId);

        /* Check if the user that sent the request is the admin of the group */
        /* If the user is not the admin, throw a new error */
        if (userId !== groupData.admin) {
            throw new AppError(`UnauthorizedRequest`, 403, `Failed to remove users. User is not an admin`);
        }   

        /* Remove the members from the group members list */
        const updatedMembers = groupData.members.filter((member: string) => !removedMembers.includes(member));

        /* Update the group data with the new members list */
        const updatedGroup = await this.groupRepository.updateGroupMembers(groupId, updatedMembers);
    
        /* Send the updated group data to the group chat room */
        socketService.emitEventToRoom(groupId, "group-members-removed", updatedGroup);

        /* Return the updated group data */
        return updatedGroup;
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the request
     * @param {string} groupId - The ID of the group that contains the messages 
     * @param {string} messages - An array with the IDs of the messages viewed by the user  
     * @returns {Promise<Message[]>} - The array with the updated messages
     */
    async viewMessages(userId: string, groupId: string, messages: string[]): Promise<Message[]> {
        /* Get the data of the group and check if the user is a member of the group
        by calling the service layer method to get the group data */
        await this.getGroupData(userId, groupId);
        
        /* Store the updated viewed messages into a new array */
        const viewedMessages: Message[] = [];

        /* For each message ID sent by the user, updated the message */
        messages.forEach(async (messageId: string) => {
            /* Get the message data based on its ID and the gorup Id */
            const messageData = await this.groupRepository.getMessageData(groupId, messageId);

            /* Update the readBy array field by adding the ID of the user to it,
            in order to mark that the user viewed the message */
            let readBy = messageData.readBy;
            readBy.push({
                userId,
                timestamp: Date.now(),
            });

            /* Get the unreadBy array of user IDs, 
            and remove the ID of the user that sent the request from it */
            const unreadBy = messageData.unreadBy.filter((member: string) => member !== userId);

            /* Update the data of the message with the new readBy and unreadBy arrays */
            const updatedMessage = await this.groupRepository.viewMessage(groupId, messageId, readBy, unreadBy);

            /* Add the updated message to the array created above */
            viewedMessages.push(updatedMessage);
        }); 

        /* Send the viewed messages to the group chat room */
        socketService.emitEventToRoom(groupId, "group-messages-viewed", viewedMessages);

        /* Return the array with the updated messages */
        return viewedMessages;
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the deletion request 
     * @param {string} groupId - The ID of the group with the messages to be deleted
     * @param {string[]} messages - The IDs of the messages to be deleted 
     * @returns {Promise<string>} - "OK" if the messages were deleted
     */
    async deleteGroupMessages(userId: string, groupId: string, messages: string[]): Promise<string> {
        /* Get the data of the group based on the ID received as a parameter */
        const groupData = await this.groupRepository.getGroupData(groupId);

        /* Map over each message ID of the list */
        messages.forEach(async (messageId: string) => {
            /* Get the data of each message from the list */
            const messageData = await this.groupRepository.getMessageData(groupId, messageId);

            /* The message can be deleted if the user that sent the request is:
                the admin of the group
                the author of the message */
            if (messageData.authorId !== userId || userId !== groupData.admin) {
                throw new AppError(`UnauthorizedRequest`, 403, `Failed to delete message. User is not the author or an admin`);
            }

            /* Send the IDs of the deleted messages to the group chat room */
           socketService.emitEventToRoom(groupId, "group-message-deleted", messageId);

            /* Delete the message from the group chat */
            await this.groupRepository.deleteGroupMessage(messageId, groupId);
        });

        return "OK";
    }

    /**
     * 
     * @param {string} userId - The ID of the user that made the deletion request 
     * @param {string} groupId - The ID of the group to be deleted 
     * @returns {string} - "OK" if the group was deleted, and an error otherwise
     */
    async deleteGroup(userId: string, groupId: string): Promise<string> {
        /* Get the group data based on the id*/
        const groupData = await this.getGroupData(userId, groupId);

        /* Check if the user that made the deletion request is the admin of the group */
        if (userId !== groupData.admin) {
            throw new AppError(`UnauthorizedRequest`, 403, `Failed to delete group chat. User is not an admin`);
        }

        /* Delete the group document */
        /* Return a success message if the group was deleted */
        return await this.groupRepository.deleteGroup(groupId);
    }

    /**
     * 
     * @param {string[]} members - The IDs of the members to be notified about the emit
     * @param {string} event - The name of the event that happened 
     * @param {unknown} data - The data that the user will receive from the socket 
     * @param {string | undefined} userId - The ID of the author that will not receive the notification 
     */
    alertMembers(members: string[], event: string, data: unknown, userId?: string): void {
        /* Check if the author was passed as an parameter and remove the ID from the list */
        if (userId) {
            members = members.filter((member) => {
                member !== userId
            });
        }

        /* Notify each member from the members list about the event */
        members.forEach((member: string) => {
            socketService.emitEventToRoom(member, event, data);
        });
    }

    /**
     * 
     * @param {string} userId - The ID of the user that sent the request 
     * @param admin - The admin of a group chat
     * @returns {boolean} - True if the user ID is equal to the admin ID
     */
    isUserAdmin(userId: string, admin: string): boolean {
        if (userId !== admin) {
            throw new AppError(`UnauthorizedRequest`, 401, `Cannot update the group chat. User is not an admin`);
        }

        return true;
    }
}