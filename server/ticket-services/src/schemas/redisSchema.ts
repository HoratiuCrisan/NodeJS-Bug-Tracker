import Joi from "@bug-tracker/usermiddleware/node_modules/joi";

export const lockTicketSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    ticketId: Joi.string().required().messages({
        "any.required": `"Ticket ID" is required to perform the operation`,
        "string.empty": `"Ticket ID" cannot be an empty string`,
    }),
});

export const isTicketLockedSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    ticketId: Joi.string().required().messages({
        "any.required": `"Ticket ID" is required to perform the operation`,
        "string.empty": `"Ticket ID" cannot be an empty string`,
    }),
});

export const unlockTicketSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": `"User ID" is required to perform the operation`,
        "string.empty": `"User ID" cannot be an empty string`,
    }),
    ticketId: Joi.string().required().messages({
        "any.required": `"Ticket ID" is required to perform the operation`,
        "string.empty": `"Ticket ID" cannot be an empty string`,
    }),
});