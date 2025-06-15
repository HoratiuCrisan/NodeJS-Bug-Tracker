import Joi from "joi";

/* Schema for creating a conversation */
export const createConversationSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    receiverId: Joi.string().required().messages({
        "any.required": `"Receiver ID" is required to perform the operation`,
        "string.empty": `"Receiver ID" cannot be an empty string`,
    }),
});

export const checkConversationSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    receiverId: Joi.string().required().messages({
        "any.required": `"Receiver ID" is required to perform the operation`,
        "string.empty": `"Receiver ID" cannot be an empty string`,
    }),
})

/* Schema for adding a new message to a conversation */
export const addMessageSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    conversationId: Joi.string().required().messages({
        "any.required": `"Conversation ID" is required to perform the operation`,
        "string.empty": `"Conversation ID" cannot be an empty string`,
    }),
    text: Joi.string().max(255).required().messages({
           "string.max": `"Text" should have a maximum length of 255 characters`
    }),
    media: Joi.any(),
});

/* Schema for fetching the conversations of a user */
export const getUserConversationsSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
});

/* Schema for fetching the messages of a conversation */
export const getConversationMessagesSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    conversationId: Joi.string().required().messages({
        "any.required": `"Conversation ID" is required to perform the operation`,
        "string.empty": `"Conversation ID" cannot be an empty string`
    }),
    limit: Joi.number().min(1).max(10).required().messages({
        "any.required": `"Limit" is required to perform the operation`,
        "number.min": `"Limit" should be at equal or greater than 1`,
        "number.max": `"Limit" should be equal or lower than 10`,
    }),
    startAfter: Joi.optional(),
});

/* Schema for fetching the conversation data */
export const getConversationSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    conversationId: Joi.string().required().messages({
        "any.required": `"Conversation ID" is required to perform the operation`,
        "string.empty": `"Conversation ID" cannot be an empty string`
    }),
});

/* Schema for fetching the data of a conversation message */
export const getMessageSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    conversationId: Joi.string().required().messages({
        "any.required": `"Conversation ID" is required to perform the operation`,
        "string.empty": `"Conversation ID" cannot be an empty string`
    }),
    messageId: Joi.string().required().messages({
        "any.required": `"Message ID" is required to perform the operation`,
        "string.empty": `"Message ID" cannot be an empty string`
    }),
});

/* Schema for fetching unread messages of a conversation */
export const getUnreadUserMessagesSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    conversationId: Joi.string().required().messages({
        "any.required": `"Conversation ID" is required to perform the operation`,
        "string.empty": `"Conversation ID" cannot be an empty string`
    }),
});

/* Schema for updating the message of a conversation */
export const updateMessageSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    conversationId: Joi.string().required().messages({
        "any.required": `"Conversation ID" is required to perform the operation`,
        "string.empty": `"Conversation ID" cannot be an empty string`
    }),
    messageId: Joi.string().required().messages({
        "any.required": `"Message ID" is required to perform the operation`,
        "string.empty": `"Message ID" cannot be an empty string`
    }),
});

/* Schema for viewing the unread messages of a conversation */
export const viewMessagesSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    conversationId: Joi.string().required().messages({
        "any.required": `"Conversation ID" is required to perform the operation`,
        "string.empty": `"Conversation ID" cannot be an empty string`
    }),
    messages: Joi.array().items(Joi.string()).min(1).required().messages({
        "array.base": `"Messages" must be an array of string`,
        "array.min": `"Messages" should contain at least 1 message ID`,
        "any.required": `"Messages" is required and cannot be undefined`,
    }),
});

/* Schema for removing the user from a conversation */
export const deleteUserConversationSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    conversationId: Joi.string().required().messages({
        "any.required": `"Conversation ID" is required to perform the operation`,
        "string.empty": `"Conversation ID" cannot be an empty string`
    }),
});

/* Schema for deleting messages from a conversation */
export const deleteMessagesSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    conversationId: Joi.string().required().messages({
        "any.required": `"Conversation ID" is required to perform the operation`,
        "string.empty": `"Conversation ID" cannot be an empty string`
    }),
    messages: Joi.array().items(Joi.string()).min(1).required().messages({
        "array.base": `"Messages" must be an array of string`,
        "array.min": `"Messages" should contain at least 1 message ID`,
        "any.required": `"Messages" is required and cannot be undefined`,
    }),
});