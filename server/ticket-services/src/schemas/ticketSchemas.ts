import Joi from "@bug-tracker/usermiddleware/node_modules/joi";

export const createTicketSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    title: Joi.string().min(10).max(100).required().messages({
        "any.required": `"Title" is required to perform the operation`,
        "string.min": `"Title" should contain 10 or more characters`,
        "string.max": `"Title" should contain 100 or less characters`,
    }),
    description: Joi.string().min(10).max(500).required().messages({
        "any.required": `"Description" is required to perform the operation`,
        "string.min": `"Description" should contain 10 or more characters`,
        "string.max": `"Description" should contain 500 or less characters`,
    }),
    priority: Joi.string().allow("low", "medium", "high", "urgent").required().messages({
        "any.required": `"Priority" is required to perform the operation`,
        "string.empty": `"Priority" cannot be an empty string`,
    }),
    type: Joi.string().allow("bug", "feature").required().messages({
        "any.required": `"Type" is required to perform the operation`,
        "string.empty": `"Type" cannot be an empty string`,
    }),
    deadline: Joi.string().required().messages({
        "any.required": `"Deadline" is required to perform the operation`,
        "string.empty": `"Deadline" cannot be an empty string`,   
    }),
});

export const getAllTicketsSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    limit: Joi.number().min(1).max(50).required().messages({
        "number.min": `"Limit" must be a positive number equal or greater than 1`,
        "number.max": `"Limit" must be a positive number equal or lesser than 50`,
    }),
    orderBy: Joi.string().allow("status", "type", "title", "deadline", "priority").required().messages({
        "any.required": `"OrerBy" is required to perform the operation`,
        "string.empty": `"OrderBy" cannot be an empty string`,
    }),
    orderDirection: Joi.string().allow("asc", "desc").required().messages({
        "any.required": `"Order direction" is required to perform the operation`,
        "string.empty": `"Order direction" cannot be an empty string`,
    }),
    searchQuery: Joi.optional(),
    status: Joi.optional(),
    priority: Joi.optional(),
    startAfter: Joi.optional(),
});

export const getUserTicketsSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    limit: Joi.number().min(1).max(50).required().messages({
        "number.min": `"Limit" must be a positive number equal or greater than 1`,
        "number.max": `"Limit" must be a positive number equal or lesser than 50`,
    }),
    orderBy: Joi.string().allow("status", "type", "title", "deadline", "priority").required().messages({
        "any.required": `"OrerBy" is required to perform the operation`,
        "string.empty": `"OrderBy" cannot be an empty string`,
    }),
    orderDirection: Joi.string().allow("asc", "desc").required().messages({
        "any.required": `"Order direction" is required to perform the operation`,
        "string.empty": `"Order direction" cannot be an empty string`,
    }),
    searchQuery: Joi.optional(),
    status: Joi.optional(),
    priority: Joi.optional(),
    startAfter: Joi.optional(),
});

export const getTicketSchema = Joi.object({
    uuid: Joi.string().required().messages({
        "any.required": `"Uuid" is required to perform the operation`,
        "string.empty": `"Uuid" cannot be an empty string`,
    }),
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    ticketId: Joi.string().required().messages({
        "any.required": `"Ticket ID" is required to perform the operation`,
        "string.empty": `"Ticket ID" cannot be an empty string`,
    }),
    role: Joi.string().required().messages({
        "any.required": `"Role" is required to perform the operation`,
        "string.empty": `"Role" cannot be an empty string`,
    }),
});

export const updateTicketSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    ticketId: Joi.string().required().messages({
        "any.required": `"Ticket ID" is required to perform the operation`,
        "string.empty": `"Ticket ID" cannot be an empty string`,
    }),
    role: Joi.string().allow("user", "developer", "project-manager", "admin").required().messages({
        "any.required": `"Role" is required to perform the operation`,
        "string.empty": `"Role" cannot be an empty string`,
    }),
    data: Joi.any().required(),
});

export const assignTicketSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    handlerId: Joi.string().required().messages({
        "any.required": `"Handler ID" is required to perform the operation`,
        "string.empty": `"Hnalder ID" cannot be an empty string`,
    }),
    ticketId: Joi.string().required().messages({
        "any.required": `"Ticket ID" is required to perform the operation`,
        "string.empty": `"Ticket ID" cannot be an empty string`,
    }),
    handlerEmail: Joi.string().required().messages({
        "any.required": `"Handler Email" is required to perform the operation`,
        "string.empty": `"Handler Email" cannot be an empty string`,
    }),
    authorEmail: Joi.string().required().messages({
        "any.required": `"Author Email" is required to perform the operation`,
        "string.empty": `"Author Email" cannot be an empty string`,
    }),
});

export const deleteTicketSchema = Joi.object({
    uuid: Joi.string().required().messages({
        "any.required": `"Uuid" is required to perform the operation`,
        "string.empty": `"Uuid" cannot be an empty string`,
    }),
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    ticketId: Joi.string().required().messages({
        "any.required": `"Ticket ID" is required to perform the operation`,
        "string.empty": `"Ticket ID" cannot be an empty string`,
    }),
    role: Joi.string().allow("user", "developer", "project-manager", "admin").required().messages({
        "any.required": `"Role" is required to perform the operation`,
        "string.empty": `"Role" cannot be an empty string`,
    }),
    userEmail: Joi.string().email({minDomainSegments: 3, tlds: {allow: ['com', 'net', 'ro']}}).required().messages({
        "any.required": `"User Email" is required to perform the operation`,
        "string.empty": `"User Email" cannot be an empty string`,
    }),
    ticketTitle: Joi.string().min(10).max(100).required().messages({
        "any.required": `"Title" is required to perform the operation`,
        "string.min": `"Title" should contain 10 or more characters`,
        "string.max": `"Title" should contain 100 or less characters`,
    }),
});