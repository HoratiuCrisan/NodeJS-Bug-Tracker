import Joi from "joi"

export const getLogSchema = Joi.object({
    logId: Joi.string().required().messages({
        "any.required": `"Log Id" is required to perform the operation`,
        "string.empty": `"Log Id" cannot be an empty string`,
    }),
    day: Joi.string().required().messages({
        "any.required": `"day" is required to perform the operation`,
        "string.empty": `"day" cannot be an empty string`,
    }),
    type: Joi.string().required().messages({
        "any.required": `"type" is required to perform the operation`,
        "string.empty": `"type" cannot be an empty string`,
    }),
});

export const getLogsSchema = Joi.object({
    day: Joi.string().required().messages({
        "any.required": `"day" is required to perform the operation`,
        "string.empty": `"day" cannot be an empty string`,
    }),
    type: Joi.string().required().messages({
        "any.required": `"type" is required to perform the operation`,
        "string.empty": `"type" cannot be an empty string`,
    }),
    limit: Joi.number().required().messages({
        "number.min": `"limit" must be at least of 1 item`,
        "any.required": `"limit" is required in order to perform the operation`,
    }),
    startAfter: Joi.string().optional(),
});

export const updateLogSchema = Joi.object({
    logId: Joi.string().required().messages({
        "any.required": `"Log Id" is required to perform the operation`,
        "string.empty": `"Log Id" cannot be an empty string`,
    }),
    day: Joi.string().required().messages({
        "any.required": `"day" is required to perform the operation`,
        "string.empty": `"day" cannot be an empty string`,
    }),
    type: Joi.string().required().messages({
        "any.required": `"type" is required to perform the operation`,
        "string.empty": `"type" cannot be an empty string`,
    }),
});

export const deleteLogSchema = Joi.object({
    logId: Joi.string().required().messages({
        "any.required": `"Log Id" is required to perform the operation`,
        "string.empty": `"Log Id" cannot be an empty string`,
    }),
    day: Joi.string().required().messages({
        "any.required": `"day" is required to perform the operation`,
        "string.empty": `"day" cannot be an empty string`,
    }),
    type: Joi.string().required().messages({
        "any.required": `"type" is required to perform the operation`,
        "string.empty": `"type" cannot be an empty string`,
    }),
});