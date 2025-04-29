import Joi from "@bug-tracker/usermiddleware/node_modules/joi";

export const getNotificationSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    notificationId: Joi.string().required().messages({
        "any.required": `"Notification ID" is required in order to perform the operation`,
        "string.empty": `"Notification ID" cannot be an empty string`, 
    }),
});

export const getUserNotificationsSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required in order to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    limit: Joi.number().min(1).max(50).required().messages({
        "any.required": `"Limit" is required in order to perform the operation`,
        "number.min": `"Limit" should be equal or higher than 1`,
        "number.max": `"Limit" should be equal or lower than 50`,
    }),
    startAfter: Joi.optional(),
});

export const updateNotificationSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    notificationId: Joi.string().required().messages({
        "any.required": `"Notification ID" is required in order to perform the operation`,
        "string.empty": `"Notification ID" cannot be an empty string`, 
    }),
});

