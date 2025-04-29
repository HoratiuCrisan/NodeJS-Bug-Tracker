import Joi from "@bug-tracker/usermiddleware/node_modules/joi";

export const createTicketSchema = Joi.object({
    userId: Joi.string().required().messages({

    }),
    title: Joi.string().min(10).max(100).required().messages({

    }),
    description: Joi.string().min(10).max(500).required().messages({

    }),
    priority: Joi.string().allow("low", "medium", "high", "urgent").required().messages({

    }),
    type: Joi.string().allow("bug", "feature").required().messages({

    }),
    deadline: Joi.string().required().messages({
        
    }),
});

export const getAllTicketsSchema = Joi.object({
    limit: Joi.number().min(1).max(50).required().messages({

    }),
    orderBy: Joi.string().allow("status", "type", "title", "deadline", "priority").required().messages({

    }),
    orderDirection: Joi.string().allow("asc", "desc").required().messages({

    }),
    status: Joi.optional(),
    priority: Joi.optional(),
    startAfter: Joi.optional(),
});

export const getUserTicketsSchema = Joi.object({
    userId: Joi.string().required().messages({

    }),
    limit: Joi.number().min(1).max(50).required().messages({

    }),
    orderBy: Joi.string().allow("status", "type", "title", "deadline", "priority").required().messages({

    }),
    orderDirection: Joi.string().allow("asc", "desc").required().messages({

    }),
    status: Joi.optional(),
    priority: Joi.optional(),
    startAfter: Joi.optional(),
});

export const getTicketSchema = Joi.object({
    uuid: Joi.string().required().messages({

    }),
    userId: Joi.string().required().messages({

    }),
    ticketId: Joi.string().required().messages({

    }),
    role: Joi.string().allow("user", "developer", "project-manager", "admin").required().messages({

    }),
});

export const updateTicketSchema = Joi.object({
    uuid: Joi.string().required().messages({

    }),
    userId: Joi.string().required().messages({

    }),
    ticketId: Joi.string().required().messages({

    }),
    role: Joi.string().allow("user", "developer", "project-manager", "admin").required().messages({

    }),
    data: Joi.any().required(),
});

export const assignTicketSchema = Joi.object({
    userId: Joi.string().required().messages({

    }),
    handlerId: Joi.string().required().messages({

    }),
    ticketId: Joi.string().required().messages({

    }),
    handlerEmail: Joi.string().required().messages({

    }),
    authorEmail: Joi.string().required().messages({

    }),
});

export const deleteTicketSchema = Joi.object({
    uuid: Joi.string().required().messages({

    }),
    userId: Joi.string().required().messages({

    }),
    ticketId: Joi.string().required().messages({

    }),
    role: Joi.string().allow("user", "developer", "project-manager", "admin").required().messages({

    }),
    userEmail: Joi.string().required().messages({

    }),
    ticketTitle: Joi.string().min(10).max(100).required().messages({

    }),
});