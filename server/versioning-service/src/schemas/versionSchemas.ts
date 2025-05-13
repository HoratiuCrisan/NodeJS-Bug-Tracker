import Joi from "@bug-tracker/usermiddleware/node_modules/joi";

export const getItemVersionSchema = Joi.object({
    itemId: Joi.string().required().messages({
        "any.required": `"Item ID" is required to perform the operation`,
        "string.empty": `"Item ID" cannot be an empty string`,
    }),
    versionId: Joi.string().required().messages({
        "any.required": `"Version ID" is required to perform the operation`,
        "string.empty": `"Version ID" cannot be an empty string`,
    }),
    type: Joi.string().allow("ticket", "task", "subtask").required().messages({
        "any.required": `"Type" is required to perform the operation`,
        "string.empty": `"Type" cannot be an empty string`,
    }),
});

export const getItemVersionsSchema = Joi.object({
    itemId: Joi.string().required().messages({
        "any.required": `"Item ID" is required to perform the operation`,
        "string.empty": `"Item ID" cannot be an empty string`,
    }),
    type: Joi.string().allow("ticket", "task", "subtask").required().messages({
        "any.required": `"Type" is required to perform the operation`,
        "string.empty": `"Type" cannot be an empty string`,
    }),
    limit: Joi.number().min(1).max(50).required().messages({
        "number.min": `"Limit" must be a positive number equal or greater than 1`,
        "number.max": `"Limit" must be a positive number equal or lesser than 50`,
    }),
    startAfter: Joi.string().optional(),
});

export const deleteItemVersionSchema = Joi.object({
    itemId: Joi.string().required().messages({
        "any.required": `"Item ID" is required to perform the operation`,
        "string.empty": `"Item ID" cannot be an empty string`,
    }),
    versions: Joi.array().min(1).items(Joi.string()).messages({
        "array.base": `"Versions" must be an array of string`,
        "array.min": `"Versions" should contain at least 1 version ID`,
        "any.required": `"Versions" is required and cannot be undefined`,
    }),
    type: Joi.string().allow("ticket", "task", "log").required().messages({
        "any.required": `"Type" is required to perform the operation`,
        "string.empty": `"Type" cannot be an empty string`,
    }),
});

export const deleteItemSchema = Joi.object({
    itemId: Joi.string().required().messages({
        "any.required": `"Item ID" is required to perform the operation`,
        "string.empty": `"Item ID" cannot be an empty string`,
    }),
    type: Joi.string().allow("ticket", "task", "log").required().messages({
        "any.required": `"Type" is required to perform the operation`,
        "string.empty": `"Type" cannot be an empty string`,
    }),
});