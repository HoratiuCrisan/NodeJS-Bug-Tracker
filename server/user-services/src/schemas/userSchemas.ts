import Joi from "@bug-tracker/usermiddleware/node_modules/joi";

export const createUserSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    displayName: Joi.string().min(5).required().messages({
        "any.required": `"Display name" is required to perform the operation`,
        "string.empty": `"Display name" cannot be an empty string`,
        "string.min": `"Display name" must be at least 5 characters long`
    }),
    email: Joi.string().email({minDomainSegments: 3, tlds: {allow: ['com', 'net', 'ro']}}).required().messages({
        "any.required": `"Email" is required to perform the operation`,
        "string.empty": `"Email" cannot be an empty string`,
    }),
    photoUrl: Joi.string().uri().required().messages({
        "string.base": `"photoUrl" must be a string`,
        "string.empty": `"PhotoUrl" cannot be an empty string`,
    }),
    role: Joi.string().required().messages({
        "any.required": `"Role" is required to perform the operation`,
        "string.empty": `"Role" cannot be an empty string`,
    }),
});

export const loginUserSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
});

export const getUsersSchema = Joi.object({
    orderBy: Joi.string().required().messages({
        "any.required": `"orerBy" is required to perform the operation`,
        "string.empty": `"orderBy" cannot be an empty string`,
    }),
    orderDirection: Joi.string().min(3).max(3).required().messages({
        "any.required": `"order direction" is required to perform the operation`,
        "string.empty": `"order direction" cannot be an empty string`,
        "string.min": `"order direction" can be only "asc" or "desc"`,
        "string.max": `"order direction" can be only "asc" or "desc"`,
    }),
    limit: Joi.number().min(1).max(100).required().messages({
        "number.min": `"limit" must be a positive number equal or greater than 1`,
        "number.max": `"limit" must be a positive number equal or lesser than 100`,
    }),
    startAfter: Joi.string().optional(),
});

export const getUserSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
});

export const updateDisplayNameSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    displayName: Joi.string().min(5).required().messages({
        "any.required": `"Display name" is required to perform the operation`,
        "string.empty": `"Display name" cannot be an empty string`,
        "string.min": `"Display name" must be at least 5 characters long`
    }),
});

export const updateEmailSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    email: Joi.string().email({minDomainSegments: 3, tlds: {allow: ['com', 'net', 'ro']}}).required().messages({
        "any.required": `"Email" is required to perform the operation`,
        "string.empty": `"Email" cannot be an empty string`,
    }),
});

export const updatePhotoUrlSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    photoUrl: Joi.string().uri().required().messages({
        "string.base": `"photoUrl" must be a string`,
        "string.empty": `"PhotoUrl" cannot be an empty string`,
    }),
});

export const updatePasswordSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    password: Joi.string().required().messages({
        // TODO: ADD PASSWORD MESSAGES
    }),
});

export const updateUserRoleSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    role: Joi.string().required().messages({
        "any.required": `"Role" is required to perform the operation`,
        "string.empty": `"Role" cannot be an empty string`,
    }),
});

export const updateUserStatusSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    status: Joi.string().valid("online", "offline").required().messages({
        "any.required": `"Status" is required to perform the operation`,
        "string.empty": `"Status" cannot be an empty string`,
    }),
});

export const deleteUserSchema = Joi.object({
    uuid: Joi.string().required().messages({
        "any.required": `"uuid" is required to perform the operation`,
        "string.empty": `"uuid" cannot be an empty string`,
    }),
    role: Joi.string().required().messages({
        "any.required": `"Role" is required to perform the operation`,
        "string.empty": `"Role" cannot be an empty string`,
    }),
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
});