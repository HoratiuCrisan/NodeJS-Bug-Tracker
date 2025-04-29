import Joi, { string } from "joi";

/* Schema for creating a group chat */
export const createGroupSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    title: Joi.string().min(5).max(100).required().messages({
        "string.min": `"Title" should have a minimum length of 5 characters`,
        "string.max": `"Title" should have a maximum length of 100 characters`,
    }), 
    description: Joi.string().min(5).max(500).required().messages({
        "string.min": `"Description" should have a minimum length of 5 characters`,
        "string.max": `"Description" should have a maximum length of 500 characters`,
    }), 
    members: Joi.array().items(Joi.string().required()).min(2).required().messages({
        "array.base": `"Members" must be an array of strings`,
        "array.min": `"Members" should contain at least 1 member`,
        "any.required": `"Members" is requreied and cannot be undefined`,
    }), 
    photoUrl: Joi.string().uri().required().messages({
        "string.base": `"PhotoUrl" must be a string`,
        "string.empty": `"PhotoUrl" cannot be an empty string`,
    }),
});

/* Schema for adding a new message to a group chat */
export const addMessageSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
    text: Joi.string().max(255).required().messages({
        "string.max": `"Text" should have a maximum length of 255 characters`
    }),
    media: Joi.any(),
});

/* Schema for retrieving the group chat data */
export const getGroupDataSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
});

/* Schema for retrieve a message's data from the group chat */
export const getGroupMessagesSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
    limit: Joi.number().min(1).max(10).required().messages({
        "any.required": `"Limit" is required in order to perform the operation`,
        "number.min": `"Limit" must be equal or higher than 1`,
        "number.max": `"Limit" must be equal or lower than 10`,
    }),
    lastMessage: Joi.optional(),
});

/* Schema for retrieving unread messages from the group chat */
export const getUnreadMessagesSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
});

/* Schema for updating the group chat title */
export const updateGroupTitleSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
    title: Joi.string().min(5).max(100).required().messages({
        "string.min": `"Title" should have a minimum length of 5 characters`,
        "string.max": `"Title" should have a maximum length of 100 characters`
    }),
});

/* Schema for updating the group chat description */
export const updateGroupDescriptionSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
    description: Joi.string().min(5).max(500).required().messages({
        "string.min": `"Description" should have a minimum length of 5 characters`,
        "string.max": `"Description" should have a maximum length of 500 characters`
    }),
});

/* Schema for updating the group chat photo */
export const updateGroupPhotoSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
    photoUrl: Joi.string().required().messages({
        "string.base": `"PhotoUrl" must be a string`,
        "string.empty": `"PhotoUrl" cannot be an empty string`,
    }),
});

/* Schema for updating the members of the group chat */
export const membersSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
    members: Joi.array().items(Joi.string()).min(1).required().messages({
        "array.base": `"Members" must be an array of strings`,
        "array.min": `"Members" should contain at least 1 member`,
        "any.required": `"Members" is requreied and cannot be undefined`,
    }),
});

/* Schema for updating the group chat messages readBy property */
export const viewMessagesSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
    messages: Joi.array().items(Joi.string()).min(1).required().messages({
        "array.base": `"Messages" must be an array of string`,
        "array.min": `"Messages" should contain at least 1 message ID`,
        "any.required": `"Messages" is required and cannot be undefined`,
    }),
});

/* Schema for deleting the group chat data */
export const deleteGroupSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
});

/* Schema for deleting messages from the group chat */
export const deleteGroupMessagesSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    groupId: Joi.string().required().messages({
        "any.required": `"Group ID" is required to perform the operation`,
        "string.empty": `"Group ID" cannot be an empty string`,
    }),
    messageId: Joi.string().required().messages({
        "any.required": `"Message ID" is required and cannot be undefined`,
        "string.empty": `"Message ID" cannot be an empty string`,
    }),
});