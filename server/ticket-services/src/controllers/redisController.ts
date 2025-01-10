import { RedisService } from "#/services/redisService";
import { TicketService } from "#/services/ticketService";
import CustomRequest from "#/utils/interfaces/Error";
import { TicketObject } from "#/utils/interfaces/Ticket";
import { Response } from "express";
import Joi from "joi";

const redisService: RedisService = new RedisService();
const ticketService: TicketService = new TicketService();


const logAudit = "log.audit.ticket";
const logError = "log.error.ticket";
const logMonitor = "log.monitor.ticket";

export class RedisTicketController {

    /**
     * 
     * @param {CustomRequest} req The request params should have:
     *  @ticketId The ID of the ticket
     *  @username The user that wants to lock the ticket
     * @param {Response} res Success message if the ticket was locked and an error message otherwise
     * @returns {Promise<Response>} 
     */
    static async lockTicket(req: CustomRequest, res: Response): Promise<Response> {
        try {
            /* Create a Joi schema with the data from the request params */
            const schema = Joi.object({
                username: Joi.string(),
                id: Joi.string(),
            });

            /* Validate the data from the schema */
            const {value, error} = schema.validate(req.params);

            if (error) {
                /* Send the error message to the Logging service */
                await ticketService.sendMessageToQueue(logError, "error", `${error.details[0].message}`);
                return res.status(400).send({error: error.details[0].message});
            }

            const {
                username, 
                id: ticketId 
            } = value;

            /* Check if the ticket is not already locked */
            const isTicketLocked = await redisService.isTicketLocked(ticketId);

            /* If the ticket is locked return an error message to the user */
            if (isTicketLocked) {
                return res.status(400).send({error: `Ticket ${ticketId} is already locked`});
            }

            /* Lock the ticket in the redis cache */
            await redisService.lockTicket(username, ticketId);

            /* Log the successful audit message to the Logging service */
            await ticketService.sendMessageToQueue(logAudit, "audit", `${username} locked the ticket: ${ticketId} successfully`);

            /* Return a success message to the user */
            return res.status(200).send({message: `Ticekt ${ticketId} successfully locked by ${username}`});
        } catch (error) {
            /* Send the error message to the Logging service */
            await ticketService.sendMessageToQueue(logError, "error", `${error}`);
            return res.status(500).send({error: `${error}`});
        }
    }

    /**
     * 
     * @param {CustomRequest} req The request params should have the ticket ID
     * @param {Response} res The server response
     * @returns {Promse<Response>} Returns the message with the confirmation that
     *  the ticket is locked or not, otherwise return an error message 
     */
    static async isTicketLocked(req: CustomRequest, res: Response): Promise<Response> {
        try {
            /* Create a schema with the dat from the request params */
            const schema = Joi.object({
                id: Joi.string(),
            });

            /* Validate the schema data */
            const {value, error} = schema.validate(req.params);

            /* Log the error with the invalid data from the schema and return the error to the user */
            if (error) {
                await ticketService.sendMessageToQueue(logError, "error", `Invalid data: ${error.details[0].message} while checking for locked ticket`);
                return res.status(400).send({error: `Invalid data: ${error.details[0].message}`});
            }

            const {id: ticketId} = value;

            /* Check if the ticket is locked */
            /* If the ticket is locked return the locked data */
            const result: string | null = await redisService.isTicketLocked(ticketId);

            if (!result) {
                /* Send the monitoring message to the Logging service */
                await ticketService.sendMessageToQueue(logMonitor, "monitoring", `Ticket: ${ticketId} is not currently locked`);

                /* Tell the user that the ticket is not locked currently */
                return res.status(200).send({message: `Ticket ${ticketId} is not currently locked`});
            }

            /* Parse the ticket locked data */
            const lockData: {lockedBy: string, lockedAt: Date} = JSON.parse(result);
            
            /* Get the user who locked the ticket */
            const lockedBy: string = lockData.lockedBy;
            
            /* Get the date the ticket was locked */
            const lockDay: string = new Date(lockData.lockedAt).toLocaleDateString();

            /* Get the time the ticket was locked */
            const lockTime: string = new Date(lockData.lockedAt).toLocaleTimeString();

            /* Send the message with the lock data to the user and to the Logging service */
            const successMessage = `Ticket ${ticketId} was locked by ${lockedBy} at ${lockDay} ${lockTime}`;
            await ticketService.sendMessageToQueue(logMonitor, "monitoring", successMessage);
            return res.status(200).send({message: successMessage});
        } catch (error) {
            /* Send the error message to the Logging service */
            await ticketService.sendMessageToQueue(logError, "error", `Failed to check if the ticket is locked: ${error}`);
            return res.status(500).send({error: `Failed to check if the ticket is locked`});
        }
    }

    /**
     * 
     * @param {CustomRequest} req The request params should have the ID of the ticket 
     * @param {Response} res The response sent by the server 
     * @returns {Promise<Response>} Success message if the ticket was unlocked 
     *  and an error message otherwise
     */
    static async unlockTicket(req: CustomRequest, res: Response): Promise<Response> {
        try {
            /* Create a Joi schema with the data from the request params */
            const schema = Joi.object({
                id: Joi.string(),
            });

            /* Validate the schema data */
            const {value, error} = schema.validate(req.params);

            /* Send the error generated by the invalid schema data to the Logging service and to the user */
            if (error) {
                await ticketService.sendMessageToQueue(logError, "error", `Invalid request data: ${error.details[0].message}`);
                return res.status(400).send({error: `Invalid request dadta: ${error.details[0].message}`});
            }

            const {id: ticketId} = value;

            /* Check if the ticket is locked */
            const lockedTicket = await redisService.isTicketLocked(ticketId);

            /* If the tickete is not locked send the message to the user */
            if (!lockedTicket) {
                return res.status(200).send({message: `Ticket: ${ticketId} is not currently locked`});
            }
            
            /* Unlock the ticket by removing it from the redis cache */
            await redisService.unlockTicket(ticketId);

            /* Send the successful audit message to the Logging service and to the user */ 
            await ticketService.sendMessageToQueue(logAudit, "audit", `Ticket: ${ticketId} was unlocked successfully`);
            return res.status(200).send({message: `Ticket: ${ticketId} was unlocked successfully`});
        } catch (error) {
            /* Send the error message to the Logging service and to the user */
            await ticketService.sendMessageToQueue(logError, "error", `Failed to unlock the ticket: ${error}`);
            return res.status(500).send({error: `Failed to unlock the ticekt`})
        }
    }

    /**
     * 
     * @param {CustomRequest} req The request params should have the ID of the ticket
     * The body of the ticket should have the ticket data 
     * @param {Response} res The server response 
     * @returns {Promsie<Response>} Success message if the ticket was cached
     *  and an error message otherwise
     */
    static async cacheTicket(req: CustomRequest, res: Response): Promise<Response> {
        try {
            /* Create a new Joi schema with the request params data */
            const schema = Joi.object({
                id: Joi.string(),
            });

            /* Validate the schema data */
            const {value, error} = schema.validate(req.params);

            /* Send the invalid schema data to the Logging service and to the user */
            if (error) {
                await ticketService.sendMessageToQueue(logError, "error", `Invalid data: ${error.details[0].message}`);
                return res.status(400).send({error: `Invalid data: ${error.details[0].message}`});
            }

            const {id: ticketId} = value;
            const {ticket} = req.body;

            /* Set the default timeout time for the cached ticket to 12h */
            const timeout = 12 * 60 * 60;

            /* Cache the ticket in the redis memory */
            await redisService.cacheTicket(ticketId, ticket, timeout);

            /* Send the successful audit message to the Logging service and to the user */
            await ticketService.sendMessageToQueue(logAudit, "audit", `Ticket: ${ticketId} cached successfully`);
            return res.status(200).send({message: `Ticket: ${ticketId} cached successfully`});
        } catch (error) {
            /* Send the error message to the Logging service and to the user */
            await ticketService.sendMessageToQueue(logError, "error", `Failed to cache ticket: ${error}`);
            return res.status(500).send({error: `Failed to cache the ticket`});
        }
    }

    /**
     * 
     * @param {CustomRequest} req The request params should have the ID of the ticket
     * @param {Response} res The response of the server 
     * @returns {Promise<Response>} The response to the ticket being cached 
     */
    static async isTicketCached(req: CustomRequest, res: Response): Promise<Response> {
        try {
            /* Create a Joi schema with the data from the request params */
            const schema = Joi.object({
                id: Joi.string(),
            });

            /* Validate the data from the schema */
            const {value, error} = schema.validate(req.params);

            /* Send the invalid data error to the Logging service and to the user */
            if (error) {
                await ticketService.sendMessageToQueue(logError, "error", `Invalid data: ${error.details[0].message}`);
                return res.status(400).send({error: `Invalid data: ${error.details[0].message}`});
            }

            const {id: ticketId} = value;

            /* Check if the ticket is present in the cache memory */
            const response: string | null = await redisService.isTicketCached(ticketId);

            if (!response) {
                /* Send the missing ticket from cache message to the user */
                return res.status(200).send({error: `Ticket ${ticketId} is not cached!`});
            }

            /* Get the cached ticket data */
            const ticket: TicketObject = JSON.parse(response);

            /* Send the success monitoring data to the Logging service */
            await ticketService.sendMessageToQueue(logMonitor, "monitoring", `Successfully fetched the ticket: ${ticketId} from the cache memory`);
            
            /* Return the ticket data from the cache to the user */
            return res.status(200).send({ticket});
        } catch (error) {
            /* Send the error message to the Logging service and to the user */
            await ticketService.sendMessageToQueue(logError, "error", `Failed to check if the ticket is cached: ${error}`);
            return res.status(500).send({error: `Failed to check if the ticket is cached`});
        }
    }

    /**
     * 
     * @param {CustomRequest} req The request params should have the ID of the ticket 
     * @param {Response} res The response of the ticket  
     * @returns {Promise<Response>} Success message if the ticket was removed from the cache
     *  and an error message otherwise
     */
    static async removeTicketFromCache(req: CustomRequest, res: Response): Promise<Response> {
        try {
            /* Create a Joi schema with the request params data */
            const schema = Joi.object({
                id: Joi.string(),
            });

            /* Validate the schema data */
            const {value, error} = schema.validate(req.params);

            /* Send the invalid data error to the Logging service and to the user */
            if (error) {
                await ticketService.sendMessageToQueue(logError, "error", `Invalid data: ${error.details[0].message}`);
                return res.status(400).send({error: `Invalid data: ${error.details[0].message}`});
            }

            const {id: ticketId} = value;

            /* Check if the ticket is currently in the cache memory */
            const isTicketCached = redisService.isTicketCached(ticketId);

            /* Send the monitoring message to the Logging service and to the user that the ticket is not in the cache memory */
            if (!isTicketCached) {
                await ticketService.sendMessageToQueue(logMonitor, "monitoring", `Ticket: ${ticketId} is not currently cached in the memory`);
                return res.status(200).send({message: `Ticket: ${ticketId} is not currently cached in the memory`});
            }

            /* Remove the ticket from the cache memory */
            await redisService.removeTicketFromCache(ticketId);

            /* Send the successful audit message to the Logging service and to the user */
            await ticketService.sendMessageToQueue(logAudit, "audit", `Succesfully removed ticket: ${ticketId} from the cache memory`);
            return res.status(200).send({message: `Succesfully removed ticket: ${ticketId} from the cache memory`});
        } catch (error) {
            /* Send the error message to the Logging service and to the user */
            await ticketService.sendMessageToQueue(logError, "error", `Failed to remove ticket from the cache: ${error}`);
            return res.status(500).send({error: `Failed to remove ticket from the cache`});
        }
    }
}