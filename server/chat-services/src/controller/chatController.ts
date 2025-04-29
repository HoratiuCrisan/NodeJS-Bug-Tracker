import { NextFunction, Response } from "express";
import { ChatService } from "../service/chatService";
import { 
    validateData,
    CustomRequest,
    measureTime,
    handleResponseSuccess,
} from "@bug-tracker/usermiddleware";
import {
    createConversationSchema,
    addMessageSchema,
    getConversationSchema,
    getMessageSchema,
    getUserConversationsSchema,
    getConversationMessagesSchema,
    getUnreadUserMessagesSchema,
    updateMessageSchema,
    viewMessagesSchema,
    deleteMessagesSchema,
    deleteUserConversationSchema,
} from "../schemas/chatSchemas";

const chatService = new ChatService();

export class ChatController {
    /* POST requests */

    public static async createConversation(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    receiverId: req.body.receiverId, /* The ID of the user at the other end of the conversation */
                },
                createConversationSchema /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to create the conversation */
            const { data: conversation, duration } = await measureTime(
                async () => chatService.createConversation(inputData.userId!, inputData.receiverId),
                `Create-conversation`
            );

            /* Return the success message with the conversation data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Conversation created successfully`,
                data: conversation,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async addMessage(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData( 
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    conversationId: req.params.conversationId, /* The ID of the conversation where the message is stored in */
                    text: req.body.text, /* The text of the message */
                    media: req.body.media, /* The media files of the message */
                },
                addMessageSchema, /* Validate the data based on the schema */
            );
            
            /* Send the data to the service layer to add the message to the conversation */
            const { data: message, duration } = await measureTime(async () => chatService.addMessage(
                inputData.userId!, 
                inputData.conversationId, 
                inputData.text, 
                inputData.media
            ), `Add-conversation-message`);
            
            /* Return the success message with the message data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Message sent successfully`,
                data: message,
            });
        } catch (error) {
            next(error);
        }
    }

    /* GET requests */

    public static async getConversation(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    conversationId: req.params.conversationId, /* The ID of the conversation to retrieve */
                },
                getConversationSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to retirieve the conversation data */
            const { data: conversation, duration } = await measureTime(
                async () => chatService.getConversation(inputData.userId!, inputData.conversationId),
                `Get-conversation-data`
            );

            /* Return the success message with the converesation data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Conversation retrieved successfully`,
                data: conversation,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getUserConversations(req: CustomRequest, res: Response, next: NextFunction) {
        try {

            const inputData = validateData(
                {
                    userId: req.user?.user_id /* The ID of the user that sent the request */
                },
                getUserConversationsSchema, /* Validate the user ID based on the schema */
            );

            /* Send the ID to the service layer to retrieve the user conversations */
            const { data: userConversations, duration } = await measureTime(
                () => chatService.getUserConversations(inputData.userId!),
                `Get-user-conversations`
            );

            /* Return the success message with the conversations list */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Conversations retrieved successfully`,
                data: userConversations,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getConversationMessages(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    conversationId: req.params.conversationId, /* The ID of the conversation */
                    limit: req.query.limit, /* The max number of messages to retirieve */
                    startAfter: req.query.startAfter, /* The last message retrieved at the previous fetching */
                },
                getConversationMessagesSchema, /* Validate the data based on the schema */
            );

            let lastMessage = undefined;

            /* If the ID of the last message was passed, convert it to a string */
            if (inputData.startAfter) {
                lastMessage = String(inputData.startAfter);
            }

            /* Send the data to the service layer to retireve the list of messages */
            const { data: messages, duration } = await measureTime(() => chatService.getConversationMessages(
                inputData.userId!,
                inputData.conversationId,
                Number(inputData.limit), /* Convert the limit to a number  */
                lastMessage,
            ),
            `Get-conversation-messages`);

            /* Return the success message with the conversations list */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `${inputData.limit} messages fetched successfully`,
                data: messages,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getUnreadMessages(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    conversationId: req.params.conversationId, /* The ID of the conversation */
                }, 
                getUnreadUserMessagesSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to retrieve the unread conversation messages for the user */ 
            const { data: unreadMessages, duration } = await measureTime(
                async () => chatService.getUnreadMessages(inputData.userId!, inputData.conversationId),
                `Get-unread-messages`
            );

            /* Return the success message with the messages lists */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Unread messages retrieved successfully`,
                data: unreadMessages,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getMessage(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    conversationId: req.params.conversationId, /* The ID of the conversation */
                    messageId: req.params.messageId, /* The ID of the message to retrieve */
                },
                getMessageSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to retrieve the message */
            const { data: message, duration } = await measureTime(async () => chatService.getMessage(
                inputData.userId!,
                inputData.conversationId,
                inputData.messageId
            ), `Get-message-data`);

            /* Return the success message with the message data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Message data retrieved successfully`,
                data: message,
            });
        } catch (error) {
            next(error);
        }
    }

    /* PUT requests */

    public static async updateMessage(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    conversationId: req.params.conversationId, /* The ID of the conversation */
                    messageId: req.params.messageId, /* The ID of the message to update */
                    text: req.body.text, /* The new text for the message */
                },
                updateMessageSchema, /* Validate the data based on the schema */
            );  

            /* Send the data to the service layer to update the message text value */
            const { data: updatedMessage, duration } = await measureTime(async () => chatService.updateMessage(
                inputData.userId!, 
                inputData.conversationId, 
                inputData.messageId, 
                inputData.text
            ), `Update-message-data`);

            /* Return the success message with the updated message data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Message updated successfully`,
                data: updatedMessage,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async viewMessages(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    conversationId: req.params.conversationId, /* The ID of the conversation */
                    messages: req.body.messages, /* The messages IDs */
                },
                viewMessagesSchema /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to update the messages readBy param */
            const { data: viewedMessages, duration } = await measureTime(async () => chatService.viewMessages(
                inputData.userId!, 
                inputData.conversationId, 
                inputData.messages
            ), `View-unread-messages`);

            /* Return the success message with the updated messages list */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Viewed messages successfully`,
                data: viewedMessages,
            });
        } catch (error) {
            next(error);
        }
    }

    /* DELETE requests */

    public static async deleteConversation(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    conversationId: req.params.conversationId, /* The ID of the conversation to delete */
                },
                deleteUserConversationSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to remove the user from the conversation */
            const { data: deletedConversation, duration } = await measureTime(
                async () => chatService.deleteConversation(inputData.userId!, inputData.conversationId),
                `Delete-conversation`
            );

            /* Return the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Conversation deleted successfully`,
                data: deletedConversation,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async deleteMessages(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    conversationId: req.params.conversationId, /* The ID of the conversation */
                    messages: req.body.messages, /* The ID of the message to be deleted */
                },
                deleteMessagesSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to delete the message */
            const { data: deletedMessage, duration } = await measureTime(async () => chatService.deleteMessage(
                inputData.userId!,
                inputData.conversationId,
                inputData.messages,
            ), `Delete-conversation-messages`);

            /* Return the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Message deleted successfully`,
                data: deletedMessage,
            });
        } catch (error) {
            next(error);
        }
    } 
}