import {CustomRequest} from "@bug-tracker/usermiddleware";
import { NextFunction, Response } from "express";
import { GroupService } from "../service/groupService";
import { validateData, handleResponseSuccess, measureTime } from "@bug-tracker/usermiddleware";
import { 
    addMessageSchema, 
    createGroupSchema, 
    getGroupDataSchema, 
    getGroupMessagesSchema,
    getUnreadMessagesSchema,
    updateGroupTitleSchema,
    updateGroupDescriptionSchema,
    updateGroupPhotoSchema,
    membersSchema,
    viewMessagesSchema,
    deleteGroupSchema,
    deleteGroupMessagesSchema,
} from "../schemas/groupSchemas";

const groupService = new GroupService();

export class GroupController {
    /* POST requests */

    public static async createGroup(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the ID of the user from the request */
                    title: req.body.title, /* Get the title, description, members and photoUrl from the request body */
                    description: req.body.description,
                    members: req.body.members,
                    photoUrl: req.body.photoUrl,
                },
                createGroupSchema /* Validate the inputs based on the schema */
            );

            /* Send the data to the service layer to create a new group chat */
            const { data: group, duration } = await measureTime(async () => groupService.createGroup(
                inputData.userId!,
                inputData.title,
                inputData.description,
                inputData.members,
                inputData.photoUrl
            ), `Create-group-conversation`);

            /* Create the log message message */
            const logDetails = {
                message: `Group "${group.title}" created by ${group.admin}`,
                type: "audit",
                status: 201,
                duration,
                user: req.user!,
                data: {id: group.id},
            };

            /* Generate the user notification data for each group member */
            const notificationUsers = group.members.map(member => {
                return {
                    id: member,
                    email: undefined,
                    message: `You have been added to the group ${group.title}`
                }
            });
            /* Create the notification message */
            const notificationDetails = {
                users: notificationUsers,
                type: "in-app",
                data: group.id,
            };

            /* Send the data in order to generate the log and the notification
                and return the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Group created successfully`,
                data: group,
                logDetails,
                notificationDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async addMessage(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                    text: req.body.text, /* Get the message text and media from the request body */
                    media: req.body.media,
                },
                addMessageSchema /* Validate the input data using the schema */
            );

            /* send the data to the service layer to add the message in the group chat */
            const { data: message, duration } = await measureTime(async () => groupService.addMessage(
                inputData.userId!,
                inputData.groupId,
                inputData.text,
                inputData.media
            ), `Add-message`);

            /* Return the success message and message data */
            await handleResponseSuccess({
                req, 
                res, 
                httpCode: 201, 
                message:`Message sent successfully`,
                data: message,
            });
        } catch (error) {
            next(error);
        }
    }

    /* GET requests */

    public static async getGroupData(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                },
                getGroupDataSchema, /* Validate the input data using the schema */
            );

            /* Send the data to the service layer to fetch the group data */
            const { data: group, duration } = await measureTime(
                async () => groupService.getGroupData(inputData.userId!, inputData.groupId),
                `Get-group-data`
            );

            /* Generate the log data */
            const logDetails = {
                message: `Group data retrieved successfully`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: group.id,
            };

            /* Send the success message and group data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Group data retrieved successfully`,
                data: group,
                logDetails,
            });

        } catch (error) {
            next(error);
        }
    }

    public static async getGroupMessages(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                    limit: Number(req.query.limit), /* Get the amount of messages to retrieve from the request query */
                    lastMessage: String(req.query.lastMessage), /* Get the last message retrieved before from the request query */
                },
                getGroupMessagesSchema, /* Validate the input data using the schema */
            )

            /* Send the data to the service layer to retrieved "limit" number of messages */
            const {data: groupMessages, duration} = await measureTime(async () => groupService.getGroupMessages(
                inputData.userId!,
                inputData.groupId,
                inputData.limit,
                inputData.lastMessage,
            ), `Get group messages`);
            
            /* Return the success message with the messages list */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Group messages retrieved succesfully`,
                data: groupMessages,
            })
        } catch (error) {
            next(error);
        }
    }

    public static async getUnreadMessages(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                },
                getUnreadMessagesSchema, /* Validate the input data using the schema */
            );

            /* Send the data to the service layer to retrieve the unred messages for the user */
            const { data: messages, duration } = await measureTime(async () => groupService.getUnreadMessages(
                inputData.userId!,
                inputData.groupId
            ), `Get-unread-messages`);
            
            /* Return the success message and the message list */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Unread messages retrived successfully`,
                data: messages,
            });
        } catch (error) {
            next(error);
        }
    }

    /* PUT requests */

    public static async updateGroupTitle(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                    title: req.body.title, /* Get the new group title from the request body */
                },
                updateGroupTitleSchema, /* Validate the input data using the schema */
            );

            /* Send the data to the service layer to update the group title */
            const { data: updatedGroup, duration } = await measureTime(async () => groupService.updateGroupTitle(
                inputData.userId!, 
                inputData.groupId, 
                inputData.title
            ), `Update-group-title`);
            
            /* Return the success message with the updated group data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Group title updated successfully`,
                data: updatedGroup,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async updateGroupDescription(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                    description: req.body.description, /* Get the new group description from the request body */
                },
                updateGroupDescriptionSchema, /* Validate the input data using the schema */
            );

            /* Send the data to the service layer to update the group description */
            const { data: updatedGroup, duration } = await measureTime(async () => groupService.updateGroupDescription(
                inputData.userId!,
                inputData.groupId,
                inputData.description
            ), `Update-group-description`);

            /* Return the success message with the updated group data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Group description updated successfully`,
                data: updatedGroup,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async updateGroupPhoto(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                    photoUrl: req.body.photoUrl, /* Get the new group photo from the request body */
                },
                updateGroupPhotoSchema, /* Validate the input data using the schema */
            );

            /* Send the data to the service layer to update the group photo */
            const { data: updatedGroup, duration } = await measureTime(async () => groupService.updateGroupPhoto(
                inputData.userId!,
                inputData.groupId,
                inputData.photoUrl
            ), `Update-group-photo`);

            /* Return the success message with the updated group data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Group photo updated successfully`,
                data: updatedGroup,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async addMembers(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                    members: req.body.members, /* Get the new group members from the request body */
                },
                membersSchema, /* Validate the input data using the schema */
            );

            /* Send the data to the service layer to add the new members to the group chat */
            const { data: updatedGroup, duration } = await measureTime(async () => groupService.addGroupMembers(
                inputData.userId!,
                inputData.groupId,
                inputData.members,
            ), `Add-group-members`);

            /* Return the success message with the updated group data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Members added successfully`,
                data: updatedGroup,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async removeMembers(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                    members: req.body.members /* Get the members to remove from the request body */
                },
                membersSchema, /* Validate the input data using the schema */
            );

            /* Send the data to the service layer to remove the members from the group */
            const { data: updatedGroup, duration } = await measureTime(async () => groupService.removeGroupMembers(
                inputData.userId!,
                inputData.groupId,
                inputData.members
            ), `Remove-group-members`);

            /* Return the success message with the updated group data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: inputData.members.length > 1 ? `Members removed successfully` : `Member removed successfully`,
                data: updatedGroup,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async viewMessages(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData (
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                    messages: req.body.messages, /* Get the viewed messages from the request body */
                },
                viewMessagesSchema, /* Validate the input data using the schema */
            );

            /* Send the data to the service layer to update the readBy property for the messages received */
            const { data: viewedMessages, duration } = await measureTime(async () => groupService.viewMessages(
                inputData.userId!,
                inputData.groupId,
                inputData.messages,
            ), `View-group-messages`);

            /* Return the success message with the viewed messages */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Messages viewed successfully`,
                data: viewedMessages,
            });
        } catch (error) {
            next(error);
        }
    }

    /* DELETE requests */

    public static async deleteGroup(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                },
                deleteGroupSchema, /* Validate the input data using the schema */
            );

            /* Get group data in order to have access to the group members to send them the delete notification */
            const groupData = await groupService.getGroupData(inputData.userId!, inputData.groupId);

            /* Send the data to the service layer to delete the group data */
            const { data: deletedGroup, duration } = await measureTime(
                async () =>  groupService.deleteGroup(inputData.userId!, inputData.groupId),
                `Delete-group`
            );

            /* Generate the log data */
            const logDetails = {
                message: `Group "${inputData.groupId}" deleted successfully`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: deletedGroup,
            };

            /* Generate the user notification details for each group member */

            const notificationUsers = groupData.members.map((member) => {
                return {
                    id: member,
                    email: undefined,
                    message: `Group ${inputData.groupId} was deleted`,
                }
            });

            /* Generate the notification data */
            const notificationDetails = {
                users: notificationUsers,
                type: "in-app",
                data: undefined,
            };

            /* Return the success message with the deleted group data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Group "${inputData.groupId}" deleted successfully`,
                data: deletedGroup,
                logDetails,
                notificationDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async deleteGroupMessages(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* Get the user ID from the request */
                    groupId: req.params.groupId, /* Get the group ID from the request params */
                    messages: req.body.messages, /* Get the group messages to delete from the request body */
                },
                deleteGroupMessagesSchema, /* Validate the input data using the schema */
            );

            /* Send the data to the service layer to delete the list of messages received */
            const { data: deletedMessages, duration } = await measureTime(async () => groupService.deleteGroupMessages(
                inputData.userId!,
                inputData.groupId,
                inputData.messages
            ), `Delete-group-messages`);

            /* Return the success message with the deleted messages list */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Messages deleted successfully`,
                data: deletedMessages,
            });
        } catch (error) {
            next(error);
        }
    }
}