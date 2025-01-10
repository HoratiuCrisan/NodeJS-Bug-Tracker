import {Response} from "express";
import { TicketService } from "#/services/ticketService";
import { TicketObject, Ticket, LockTicketData } from "#/utils/interfaces/Ticket";
import CustomRequest from "#/utils/interfaces/Error";
import { RedisService } from "#/services/redisService";
import Joi from "joi";
import { logRequest, logSystemMessage } from "#/middleware/logRequest";

const logAudit = "log.audit.ticket";
const logError = "log.error.ticket";
const logInfo = "log.monitor.ticket";

const ticketService = new TicketService();
const redisService = new RedisService();

export class TicketController {
    /**
     * 
     * @param {CustomRequest} req The body of the request should cotain:
     *  the ticket form data
     *  the author of the ticket
     *  the profile picture of the author 
     * @param {Response} res The server response to the request 
     * @returns {Promise<Response>} A confirmation message if the ticket was created and
     *  an error message otherwise
     */
    public static async createTicket(req: CustomRequest, res: Response): Promise<Response> {
        const startTime = Date.now();
        try {
            const inputs = {
                name: req.user?.name,
                picture: req.user?.picture,
            };
            
            /* Store the author and the author profile picture into a map
                in order to check if the data is valid */
            const schema = Joi.object({
                name: Joi.string().optional(),
                picture: Joi.string().optional()
            });

            const query = schema.validate(inputs);

            /* Log the invalid user data error */
            if (query.error) {
                const logErrorMessage = await logRequest(req, res, "error", startTime, `${query.error.details[0].message}`);
                await ticketService.sendMessageToQueue(logError, JSON.stringify(logErrorMessage));
                return res.status(400).json({error: query.error.details[0].message});
            }

            /* Get the user information */
            const { name: author, picture: authorPicture} = query.value;

            /* Get the ticket data from the body of the request */
            const {formData } = req.body;
            
            /* Create a new ticket object */
            const ticketData: Ticket = {
                Title: formData.Title,
                Description: formData.Description,
                Author: author,
                AuthorPicture: authorPicture,
                Priority: formData.Priority,
                Type: formData.Type,
                Status: formData.Status,
                Handler: "",
                HandlerId: "",
                Response: "",
                Deadline: formData.Deadline,
                CreatedAt: new Date().toISOString(),
                ClosedAt: null,
                Notified: false,
                Files: [],
            };

            /* Send the ticket data to the Ticket Service to validate its data
                and to add it to the database */
            const createdTicketData: TicketObject = await ticketService.createTicket(ticketData);
            
            /* Send the audit confirmation message to the Logger service */
            const message = `Ticket with the title ${ticketData.Title} created sucessfully`;
            const logAuditMessage = await logRequest(req, res, "audit", startTime, message, createdTicketData);

            await ticketService.sendMessageToQueue(logAudit, JSON.stringify(logAuditMessage));
            return res.status(200).send({message});
        } catch (error) {
            /* Send the error message to the Logger service */
            const logErrorMessage = await logRequest(req, res, "error", startTime, `${error}`);
            await ticketService.sendMessageToQueue(logError, JSON.stringify(logErrorMessage));
            return res.status(500).send({error});
        }
    }

    /**
     * 
     * @param {CustomRequest} req The query of the request should contain:
     *  @limit The limit number of tickets fetched at a time
     *  @orderBy The field to order the collection by
     *  @orderDirection The order direction
     *  @status Filtered by a specific ticket status
     *  @priority Filtered by a specific ticket priority
     *  @startAfter The ID of the last requested ticket before the current request 
     * @param {Resopnse} res The server response to the request
     * @returns {Promise<Response>} A confirmation message if the collection was fetched 
     * and an error message otherwise
     */
    static async getAllTickets(req: CustomRequest, res: Response): Promise<Response> {
        const startTime = Date.now();
        try {
            /* Declare a schema with the data received 
                from the query */
            const schema = Joi.object({
                limit: Joi.number().integer().min(1).default(10),
                orderBy: Joi.string().valid("Title", "CreatedAt", "Deadline", "Type", "Priority", "Status"),
                orderDirection: Joi.string().valid("asc", "desc"),
                status: Joi.string().optional(),
                priority: Joi.string().optional(),
                startAfter: Joi.string().optional(),
            });

            /* Validate the data from the schema */
            const {value, error} = schema.validate(req.query);

            /* If any of the data from the schema is not valid return an error response */
            if (error) {
                return res.status(400).send({error: error.details[0].message});
            }

            /* Get the data from the request query */
            const {
                limit,
                orderBy,
                orderDirection,
                status,
                priority,
                startAfter
            } = value;

            /* Fetch the collection from the database */
            const tickets: TicketObject[] = await ticketService.getAllTickets(limit, orderBy, orderDirection, status, priority, startAfter);
            
            /* Send the successful monitoring message to the Logging service*/
            const logInfoMessage = await logRequest(req, res, "info", startTime, 
                `${req.user?.name} successfully fetched ${limit} tickets from the collection:\n[\n${tickets.map(ticket => ticket.id).join(',\n')} ]`
            );
            await ticketService.sendMessageToQueue(logInfo, JSON.stringify(logInfoMessage));
            
            /* Return the fetched tickets collection to the user */
            return res.status(200).json(tickets);
        } catch (error) {
            /* Log the failed monitoring error to the Logging service and to the user */
            const logErrorMessage = await logRequest(req, res, "error", startTime, `${error}`);
            await ticketService.sendMessageToQueue(logError, JSON.stringify(logErrorMessage));
            return res.status(500).send({error});
        }
    }

    /**
     * 
     * @param {CustomRequest} req The query of the request should contain:
     *  @username The author or the handler of the ticket the role is not admin
     *  @limit The limit number of tickets fetched at a time
     *  @orderBy The field to order the collection by
     *  @orderDirection The order direction
     *  @status Filtered by a specific ticket status
     *  @priority Filtered by a specific ticket priority
     *  @startAfter The ID of the last requested ticket before the current request 
     *  @role Should be admin if the user is not the author or the handler of the ticket
     * @param {Resopnse} res The server response to the request
     * @returns {Promise<Response>} A confirmation message if the collection was fetched 
     * and an error message otherwise
     */
    static async getUserTickets(req: CustomRequest, res: Response): Promise<Response> {
        const startTime = Date.now();
        try {
            /* Get the data from the request query and params */
            const inputs = {...req.query, ...req.params};

            /* Create a new Joi schema */
            const schema = Joi.object({
                username: Joi.string(),
                limit: Joi.number().integer().min(1).default(10),
                orderBy: Joi.string().valid("Title", "CreatedAt", "Deadline", "Type", "Priority", "Status"),
                orderDirection: Joi.string().valid("asc", "desc"),
                status: Joi.string().optional(),
                priority: Joi.string().optional(),
                startAfter: Joi.string().optional(),
            });

            /* Validate the data from the schema */
            const {value, error} = schema.validate(inputs);

            /* If any of the data from the schema is not valid return an error response */
            if (error) {
                return res.status(400).send({error: error.details[0].message});
            }

            /* Get the data from the request query */
            const {
                username,
                limit,
                orderBy,
                orderDirection,
                status,
                priority,
                startAfter,
            } = value;

            /* Fetch the filtered tickes collection */
            const tickets: TicketObject[] = await ticketService.getUserTickets(username, limit, orderBy, orderDirection, status, priority, startAfter);
            
            /* Send the successful monitoring message to the Logging service*/
            
            const logInfoMessage = await logRequest(req, res, "info", startTime, 
                `${req.user?.name} successfully fetched ${limit} tickets from the collection:\n[${tickets.map(ticket => ticket.id).join(',\n')}]`
            );

            await ticketService.sendMessageToQueue(logInfo, JSON.stringify(logInfoMessage));
            /* Return the collection to the user */
            return res.status(200).json(tickets);
        } catch (error) {
            /* Log the failed monitoring error to the Logging service and to the user */
            const logErrorMessage = await logRequest(req, res, "error", startTime, `${error}`);
            await ticketService.sendMessageToQueue(logError, JSON.stringify(logErrorMessage));
            return res.status(500).send({error})
        }
    }

    /**
     * 
     * @param {CustomRequest} req The query of the request should have:
     *  @username The user should be the author or the handler of the ticket if not an admin
     *  @ticketId The ID of the ticket
     * @param {Resopnse} res The server response to the request
     * @returns {Promise<Response>} The ticket data if the ticket exists or 
     *  an error message otherwise
     */
    static async getUserTicketById(req: CustomRequest, res: Response): Promise<Response> {
        const startTime = Date.now();
        try {
            const inputs = {...req.params};
            inputs.role = req.user?.role ? req.user.role : "";

            /* Define the Joi schema with the values from the request params */
            const schema = Joi.object({
                username: Joi.string(),
                id: Joi.string(),
                role: Joi.string(),
            });

            /* Validate the data from the schema */
            const {value, error} = schema.validate(inputs);

            /* If the received data is not valid return an error */
            if (error) {
                return res.status(400).send({error: error.details[0].message});
            }

            const {username, id: ticketId, role} = value;

            /* Check if the ticket is not present in the redis data base */
            const cacheResult = await redisService.isTicketCached(ticketId);

            let ticket: TicketObject;

            /* Set the data if the ticket was found in the redis database */
            if (cacheResult) {
                const parsedResult: {
                    ticket: TicketObject,
                    ticketId: string,
                    timeout: number
                } = JSON.parse(cacheResult);

                ticket = parsedResult.ticket;
            } else {
                /* Fetch the data from the firebase database if the ticket was not found in the redis one */
                ticket = await ticketService.getUserTicketById(username, ticketId, role);

                /* Cache the ticket into the redis database */
                await redisService.cacheTicket(ticketId, ticket, 12 * 60 * 60);
            }

            const logInfoMessage = await logRequest(req, res, "info", startTime, `User ${username} fetched the data form the ticket "${ticketId}"`);
            /* Send the successful monitoring message to the Logging service*/
            await ticketService.sendMessageToQueue(logInfo, JSON.stringify(logInfoMessage));
            
            /* Return the ticket data tot the user */
            return res.status(200).json(ticket);
        } catch (error) {
            /* Log the failed monitoring error to the Logging service and to the user */
            const logErrorMessage = await logRequest(req, res, "error", startTime, `${error}`);
            await ticketService.sendMessageToQueue(logError, JSON.stringify(logErrorMessage));
            return res.status(404).send({error});
        }
    }

    /**
     * 
     * @param {CustomRequest} req The request parameters should have:
     *  @ticketId The ID of the ticket
     *  The request body should have:
     *  @updateDate The updated ticket data
     *  @author The user that updated the ticket
     * @param {Response} res The server response to the request
     * @returns {Promise<Response>} The updated ticket data if the ticket was updated 
     *  and an error message otherwise
     */
    static async updateTicketById(req: CustomRequest, res: Response): Promise<Response> {
        const startTime = Date.now();
        try {
            /* Get the data from the request body */
            const {updateData, ...filteredData} = req.body;
            const inputs = {...req.params, ...filteredData};
            inputs.role = req.user?.role;

            /* Create a Joi schema with the data from the request body and the request params */
            const schema = Joi.object({
                id: Joi.string(),
                author: Joi.string(),
                role: Joi.string().optional(),
            });

            /* Validate the schema data */
            const {error, value} = schema.validate(inputs);
            console.log(value);

            /* Return an error with the invalid data */
            if (error) {
                await ticketService.sendMessageToQueue(
                    logError, 
                    `Invalid update data: ${error.details[0].message}`
                );
                return res.status(400).send({error: error.details[0].message});
            }

            const {
                id: ticketId, 
                author, 
                role,
            } = value;

            /* Check if the ticket is currently locked by another user */
            const isTicketLocked = await redisService.isTicketLocked(ticketId);

            /* If the ticket is locked get the data from it */
            if (isTicketLocked) {
                const parsedLockData: LockTicketData = JSON.parse(isTicketLocked);

                /* If the user that locked the ticket is not the current user 
                    deny the user from updating the ticket */
                if (parsedLockData.lockedBy !== author) {
                    /* Log the error message and send it to the user */
                    await ticketService.sendMessageToQueue(logError, `${author} failed to update the ticket: ${ticketId}. Reason: locked ticket`);
                    return res.status(500).send({error: `The ticket is currently being updated by another user`});
                }
            } else {
                /* Lock the ticket if it is not locked */
                await redisService.lockTicket(author, ticketId);
            }
            
            const ticketExists: TicketObject = await ticketService.getUserTicketById(author, ticketId, role);

            /* Update the ticket data */
            const ticket: TicketObject = await ticketService.updateTicketById(updateData, author, ticketId, role);

            /* Unlock the ticket */
            await redisService.unlockTicket(ticketId);

            /* Add the ticket to the cache redis database */
            const cacheTimeout = 12 * 60 * 60;
            const updateCachedTicket: boolean = await redisService.cacheTicket(ticketId, ticket, cacheTimeout);

            /* Log the failed caching error to the Logging service */
            if (!updateCachedTicket) {
                await ticketService.sendMessageToQueue(logError, `Failed to cache the ticket: ${ticketId}`);
            }

            /* Store the users that will be notify about the update into an array */
            let usersToNotify: string[] = ticketService.getUsersToNotify(author, ticket);

            /* Send the message to the audit Logging service and notify the users */
            const notificationMsg = `${author} successfully updated ticket ${ticketId}`;
            await ticketService.notifyUsers(usersToNotify, "audit", notificationMsg)
         
            /* Return the updated data to the user */
            return res.status(200).json(ticket);
        } catch (error) {
            /* Log the failed audit error to the Logging service and to the user */
            const logErrorMessage = await logRequest(req, res, "error", startTime, `${error}`);
            await ticketService.sendMessageToQueue(logError, JSON.stringify(logErrorMessage));
            return res.status(500).json({error});
        }
    }

    /**
     * 
     * @param {CustomRequest} req The request params should have:
     *  @ticketId The id of the ticket
     *  The request body should have:  
     *  @handler The user that will be assign the ticket 
     *  @handlerId The ID of the handler 
     *  @author /The user that assigns the ticket to the handler
     * @param {Response} res The server response to the request
     * @returns {Promsie<Response>} The assigned ticket if it was updated 
     *  and and error message otherwise
     */
    static async assignTicket(req: CustomRequest, res: Response): Promise<Response> {
        const startTime = Date.now();
        try {
            /* Store the reqest body and params data into a inputs variable 
                to validate it using Joi */
            const inputs = {...req.params, ...req.body};

            /* Create a new schema using the data from the inputs */
            const schema = Joi.object({
                id: Joi.string(),
                handler: Joi.string(),
                handlerId: Joi.string(),
                author: Joi.string(),
            });

            /* Validate the schema data */
            const {value, error} = schema.validate(inputs);

            /* Return an error with the invalid data */
            if (error) {
                /* Log the error to the Logging service */
                await ticketService.sendMessageToQueue(logError, `Invalid update data: ${error.details[0].message}`);
                return res.status(400).send({error: `${error.details[0].message}`});
            }

            const {
                id: ticketId,
                handler,
                handlerId,
                author 
            } = value;
            
            /* Check if the ticket is currently locked by another user */
            const isTicketLocked = await redisService.isTicketLocked(ticketId);

            /* If the ticket is locked get the data from it */
            if (isTicketLocked) {
                const parsedLockData: LockTicketData = JSON.parse(isTicketLocked);

                /* If the user that locked the ticket is not the current user 
                    deny the user from updating the ticket */
                if (parsedLockData.lockedBy !== author) {
                    /* Log the error message and send it to the user */
                    await ticketService.sendMessageToQueue(logError, `${author} failed to update the ticket: ${ticketId}. Reason: locked ticket`);
                    return res.status(500).send({error: `The ticket is currently being updated by another user`});
                }
            } else {
                /* Lock the ticket if it is not locked */
                await redisService.lockTicket(author, ticketId);
            }

            /* Update the ticket by assigning the handler and the handler ID */
            const ticket: TicketObject = await ticketService.assignTicket(handler, handlerId, ticketId);

            /* Unlock the ticket from the redis database */
            await redisService.unlockTicket(ticketId);

            /* Add the ticket to the cache redis database */
            const cacheTimeout = 12 * 60 * 60;
            const updateCachedTicket: boolean = await redisService.cacheTicket(ticketId, ticket, cacheTimeout);

            /* Log the failed caching error to the Logging service */
            if (!updateCachedTicket) {
                await ticketService.sendMessageToQueue(logError, `Failed to cache the ticket: ${ticketId}`);
            }

            /* Notify the author that the ticket now has a handler */
            await ticketService.notifyUsers([ticket.data.Author], "audit", `Your ticket ${ticket.data.Title} as assinged to the user: ${handler}`);
            
            /* Notify the handler that he was assigned the ticket */
            await ticketService.notifyUsers([handler], "audit", `You were assigned a new ticket: ${ticket.data.Title}`);
            
            /* Send the audit message to the Logging service */
            await ticketService.sendMessageToQueue(logAudit,`The ticket: ${ticketId} was assigned to the user: ${handler}`);
            
            /* Return the updated ticket to the user */
            return res.status(200).json(ticket);
        } catch (error) {
            /* Log the failed audit error to the Logging service and to the user */
            const logErrorMessage = await logRequest(req, res, "error", startTime, `${error}`);
            await ticketService.sendMessageToQueue(logError, JSON.stringify(logErrorMessage));
            return res.status(500).send({error});
        }
    }

    /**
     * 
     * @param {CustomRequest} req The request params should have:
     *  @ticketId The ID of the ticket
     *  And the request body
     * @param {Response} res The server response
     * @returns {Promise<Response>} Success message if the ticket was deleted 
     *  and an error message otherwise
     */
    static async deleteTicket(req: CustomRequest, res: Response): Promise<Response> {
        const startTime = Date.now();
        try {
            const inputs = {...req.params};
            inputs.role = req.user?.role ? req.user.role : "";
            
            /* Create a Joi schema with the request query data */
            const schema = Joi.object({
                id: Joi.string(),
                username: Joi.string(),
                role: Joi.string().optional(),
            });

            /* Validate the data inside the schema */
            const {value, error} = schema.validate(inputs);

            if (error) {
                /* Log the error for the invalid data */
                await ticketService.sendMessageToQueue(logError, `Ivalid ticket data: ${error.details[0].message}`);
                
                /* Return the error message from the scheam validation to the user */
                return res.status(400).send({error: error.details[0].message});
            }

            const {
                id: ticketId,
                username,
                role
            } = value;

            /* Get the ticket data if it exists */
            const ticket: TicketObject = await ticketService.getUserTicketById(username, ticketId, role);

            if (!ticket) {
                /* Log the monitoring error if the ticket does not exist */
                await ticketService.sendMessageToQueue(logError, `Failed to find ticket: ${ticketId}`);

                /* Return the not found error to the user */
                return res.status(404).send({error: `Ticket ${ticketId} not found`});
            }

            /* Delete the ticket from the firebase database */
            await ticketService.deleteTicket(username, ticket, ticketId, role);

            /* Remove the ticket from the redis cache */
            await redisService.unlockTicket(ticketId);

            /* Remove the ticket from the cache memory */
            await redisService.removeTicketFromCache(ticketId);

            /* Store the users that will be notify about the ticket deletion */
            let notifyUsers: string[] = ticketService.getUsersToNotify(username, ticket);

            /* Send the notification to the users */
            await ticketService.notifyUsers(notifyUsers, "audit", `${username} deleted the ticket: ${ticket.data.Title}`);

            /* Send the successfull audit message to the Logging service */
            await ticketService.sendMessageToQueue(logAudit, `${username} successfully deleted the ticket: ${ticketId}`);

            /* Return the success message to the user */
            return res.status(200).send({message: `Ticket: ${ticketId} deleted successfully!`});
        } catch (error) {
            /* Send the audit error to the Logging service and return the error to the user */
            const logErrorMessage = await logRequest(req, res, "error", startTime, `${error}`);
            await ticketService.sendMessageToQueue(logError, JSON.stringify(logErrorMessage));
            return res.status(500).send({error})
        }
    }

    /**
     * Actions performed by the system every 30 minutes:
     * 
     * Gets the unfinished tickets with a deadline lesser than a day.
     * Updates the Notified field to true for each ticket fetched.
     * Notifies the user about the upcoming deadline.
     * Sends the audit message to the Logging service.
     */
    static async checkUpcomingTicketDeadline(): Promise<void> {
        const startTime = Date.now();
        try {
            /* Get the map with the tickets and the time left until deadline from the Ticket Service */
            const ticketsMap: Map<TicketObject, string> = await ticketService.checkUpcomingTicketDeadline();

            /* Iterate over each entry of the map */
            for (let ticketMap of ticketsMap.entries()) {
                /* Update the ticket by changing the Notified field to true */
                /* Mark the action as a System action */
                await ticketService.updateTicketById({...ticketMap[0].data, Notified: true}, "System", ticketMap[0].id, "admin");

                /* Send the audit message to the Logging service that the ticket was notified */
                const logAuditMessage = await logSystemMessage("audit", 
                    `System notified user: ${ticketMap[0].data.Handler} 
                    about the upcoming deadline for the ticket ${ticketMap[0].id}`
                );
                await ticketService.sendMessageToQueue(logAudit, JSON.stringify(logAuditMessage));
                
                /* Send the notification message to the handler of the ticket with the time left 
                    until the deadline */
                await ticketService.notifyUsers([ticketMap[0].data.Handler], "audit", ticketMap[1]);
            }
        } catch (error) {
            throw error;
        }
    }
}