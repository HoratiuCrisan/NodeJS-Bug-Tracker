import Joi from "@bug-tracker/usermiddleware/node_modules/joi";

export const getItemVersionSchema = Joi.object({
    itemId: Joi.string().required().messages({

    }),
    versionId: Joi.string().required().messages({

    }),
    type: Joi.string().allow("ticket", "task", "log").required().messages({

    }),
});

export const getItemVersionsSchema = Joi.object({
    itemId: Joi.string().required().messages({

    }),
    type: Joi.string().allow("ticket", "task", "log").required().messages({

    }),
    limit: Joi.number().min(1).required().messages({

    }),
    startAfter: Joi.string().optional(),
});

export const deleteItemVersionSchema = Joi.object({
    itemId: Joi.string().required().messages({

    }),
    versions: Joi.array().items(Joi.string()).messages({

    }),

    type: Joi.string().allow("ticket", "task", "log").required().messages({

    }),
});

export const deleteItemSchema = Joi.object({
    itemId: Joi.string().required().messages({

    }),
    type: Joi.string().allow("ticket", "task", "log").required().messages({

    }),
});