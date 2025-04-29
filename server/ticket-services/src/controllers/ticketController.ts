import {Response, NextFunction} from "express";
import { TicketService } from "../services/ticketService";
import { Ticket, TicketCard } from "../types/Tickets";
import { CustomRequest, handleResponseSuccess, measureTime, User, validateData } from "@bug-tracker/usermiddleware";
import {
    createTicketSchema,
    getAllTicketsSchema,
    getUserTicketsSchema,
    getTicketSchema,
    updateTicketSchema,
    assignTicketSchema,
    deleteTicketSchema,
} from "../schemas/ticketSchemas";

const ticketService = new TicketService();

export class TicketController {
    public static async createTicket(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    title: req.body.title, /* The title of the ticket */
                    description: req.body.description, /* The description of the ticket */
                    priority: req.body.priority, /* The priority of the ticket */
                    type: req.body.type, /* The type of the ticket */
                    deadline: req.body.deadline, /* The deadline by which the ticket should be solved */
                },
                createTicketSchema, /* The validation schema */
            );

            /* Send the data to the service layer to create the ticket */
            const { data: ticket, duration} = await measureTime(async () => ticketService.createTicket(
                inputData.userId!, 
                inputData.title, 
                inputData.description, 
                inputData.priority, 
                inputData.type,
                inputData.deadline
            ), `Create-ticket`);

            /* Generate the log data */
            const logDetails = {
                message: `User "${inputData.userId} created a new ticket`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: ticket,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Ticket created successfully`,
                data: ticket,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllTickets(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    limit: Number(req.query.limit), /* The max number of tickets to retrieve at a time */
                    orderBy: String(req.query.orderBy), /* The order criteria */
                    orderDirection: String(req.query.orderDirection), /* The direction of the order */
                    status: req.query.status, /* The status of the ticket */
                    priority: req.query.priority, /* The priority of the ticket */
                    startAfter: req.query.startAfter, /* The ID of the last ticket retrieved at the previous fetching request */
                },
                getAllTicketsSchema, /* The validation schema */
            );

            console.log(inputData);

            let status = undefined, priority = undefined, startAfter = undefined;

            /* Check if the status of the ticket was sent */
            if (inputData.status) {
                /* Convert the status to a string */
                status = String(inputData.status);
            }

            /* Check if the priority of the ticket was sent */
            if (inputData.priority) {
                /* Convert the priority to a string */
                priority = String(inputData.priority);
            }

            /* Check if the ID of the last ticket was sent */
            if (inputData.startAfter) {
                /* Convert the ID to a string */
                startAfter = String(startAfter);
            }

            /* Send the data to the service layer to retrieve the list of tickets */
            const { data: tickets, duration } = await measureTime(async () => ticketService.getAllTickets(
                inputData.limit,
                inputData.orderBy,
                inputData.orderDirection,
                status,
                priority,
                startAfter
            ), `Get-all-tickets`);

            /* Generate the log data */
            const logDetails = {
                message: `User "${req.user?.user_id}" retrieved "${inputData.limit}" tickets`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: {
                    ids: tickets.map((ticket: Ticket) => ticket.id),
                },
            };

            console.log(tickets);

            /* Get the author for the tickets */
            const authorIds: string[] = ticketService.getTicketAuthorIds(tickets);

            /* Get the data of each author */
            const authors: User[] = await ticketService.getTicketUsersData(authorIds);

            /* Get the combined data of the tickets and authors */
            const ticketCards = ticketService.getTicketCards(authors, tickets);
            
            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Tickets retrieved successfully`,
                data: ticketCards,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserTickets(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on schema */
            const inputData = validateData(
                {
                    userId: req.params.userId, /* The ID of the user */
                    limit: Number(req.query.limit), /* The max number of tickets to retrieve */
                    orderBy: String(req.query.orderBy), /* The order cirteria */
                    orderDirection: String(req.query.orderDirection), /* The order direction */
                    status: req.query.status, /* The status of the tickets */
                    priority: req.query.priority, /* The priority of the tickets */
                    startAfter: req.query.startAfter, /* The ID of the last ticket retrieved at the previous fetching request */
                },
                getUserTicketsSchema, /* The validation schema */
            );

            console.log(inputData);

            let status = undefined, priority = undefined, startAfter = undefined;

            /* Check if the status was sent */
            if (inputData.status) {
                /* Convert the status to a string */
                status = String(inputData.status);
            }

            /* Check if the priority was sent */
            if (inputData.priority) {
                /* Convert the priority to a string */
                priority = String(inputData.priority);
            }

            /* Check if the ID of the last ticket was sent */
            if (startAfter) {
                /* Convert the ID to a string */
                startAfter = String(inputData.startAfter);
            }

            /* Send the data to the service layer to retrieve the user tickets */
            const { data: tickets, duration } = await measureTime(async () => ticketService.getUserTickets(
                inputData.userId,
                inputData.limit,
                inputData.orderBy,
                inputData.orderDirection,
                status,
                priority,
                startAfter
            ), `Get-user-tickets`);
    
            /* Generate the log data */
            const logDetails = {
                message: `User "${req.user?.user_id}" retrieved "${inputData.limit}" of "${inputData.userId}'s" tickets`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: {
                    ids: tickets.map((ticket: Ticket) => ticket.id),
                },
            };

            /* Get the author for the tickets */
            const authorIds: string[] = ticketService.getTicketAuthorIds(tickets);

            /* Get the data of each author */
            const authors: User[] = await ticketService.getTicketUsersData(authorIds);

            /* Get the combined data of the tickets and authors */
            const ticketCards = ticketService.getTicketCards(authors, tickets);

            console.log(tickets);

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Tickets retrieved successfully`,
                data: ticketCards,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserTicketById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    uuid: req.user?.user_id, /* The ID of the user that sent the request */
                    userId: req.params.userId, /* The ID of the author of the ticket */
                    ticketId: req.params.ticketId, /* The ID of the ticket */
                    role: req.user?.role, /* The role of the user that sent the request */
                },
                getTicketSchema, /* The validation schema */
            );
            console.log(inputData)

            /* Send the data to the service layer to retireve the ticket data */
            const { data: ticket, duration } = await measureTime(async () => ticketService.getUserTicketById(
                inputData.uuid!,
                inputData.ticketId,
                inputData.role!,
            ));

            /* Generate the log data */
            const logDetails = {
                message: `User "${inputData.userId}" retrieved the ticket "${inputData.ticketId}'s" data`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: ticket,
            };

            /* Get the data of the author of the ticket */
            const authorData = await ticketService.getTicketUsersData([ticket.authorId]);

            let handlerData = null;

            /* Check if the ticket has a handler and retrieve the handler data */
            if (ticket.handlerId) {
                const handlers = await ticketService.getTicketUsersData([ticket.handlerId]);
                handlerData = handlers[0];
            }

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Ticket retrieved successfully`,
                data: {
                    ticket: ticket,
                    author: authorData[0],
                    handler: handlerData
                },
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateTicketById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    ticketId: req.params.ticketId, /* The ID of the ticket */
                    role: req.user?.role, /* The role of the user that sent the request */
                    data: req.body.data as Ticket, /* The data of the ticket */
                },
                updateTicketSchema, /* The validation schema */
            );

            /* Send the data to the service layer to update the ticket data */
            const { data: ticket, duration } = await measureTime(async () => ticketService.updateTicketById(
                inputData.userId!,
                inputData.ticketId,
                inputData.role!,
                inputData.data,
            ), `Update-ticket`);

            /* Generate log data */
            const logDetails = {
                message: `User "${inputData.userId}" updated the data of the ticket "${inputData.ticketId}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: ticket,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Ticket updated successfully`,
                data: ticket,
                logDetails,
            });

            // /* Check if the ticket is currently locked by another user */
            // const isTicketLocked = await redisService.isTicketLocked(ticketId);

            // /* If the ticket is locked get the data from it */
            // if (isTicketLocked) {
            //     const parsedLockData: LockTicketData = JSON.parse(isTicketLocked);

            //     /* If the user that locked the ticket is not the current user 
            //         deny the user from updating the ticket */
            //     if (parsedLockData.lockedBy !== author) {
            //         /* Log the error message and send it to the user */
            //         await ticketService.sendMessageToQueue(logError, `${author} failed to update the ticket: ${ticketId}. Reason: locked ticket`);
            //         return res.status(500).send({error: `The ticket is currently being updated by another user`});
            //     }
            // } else {
            //     /* Lock the ticket if it is not locked */
            //     await redisService.lockTicket(author, ticketId);
            // }
            
            // const ticketExists: TicketObject = await ticketService.getUserTicketById(author, ticketId, role);

            // /* Update the ticket data */
            // const ticket: TicketObject = await ticketService.updateTicketById(updateData, author, ticketId, role);

            // /* Unlock the ticket */
            // await redisService.unlockTicket(ticketId);

            // /* Add the ticket to the cache redis database */
            // const cacheTimeout = 12 * 60 * 60;
            // const updateCachedTicket: boolean = await redisService.cacheTicket(ticketId, ticket, cacheTimeout);

            // /* Log the failed caching error to the Logging service */
            // if (!updateCachedTicket) {
            //     await ticketService.sendMessageToQueue(logError, `Failed to cache the ticket: ${ticketId}`);
            // }
        } catch (error) {
            next(error);
        }
    }

    static async assignTicket(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    ticketId: req.params.ticketId, /* The ID of the ticket */
                    handlerId: req.body.handlerId, /* The ID of the ticket handler */
                    handlerEmail: req.body.handlerEmail,
                    authorEmail: req.body.authorEmail,
                },
                assignTicketSchema, /* The validation schema */
            );

            /* Send the data to the service layer to assign the ticket to the handler */
            const { data: ticket, duration } = await measureTime(
                async () => ticketService.assignTicket(
                    inputData.userId!,
                    inputData.handlerId,
                    inputData.ticketId, 
                ),
                 `Assign-ticket`
            );

            /* Generate log data */
            const logDetails = {
                message: `User "${inputData.userId}" assigned the ticket "${inputData.ticketId}" to the user "${inputData.handlerId}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: ticket,
            };

            /* Generate the notification data */
            const notificationDetails = {
                users: [
                    {
                        id: inputData.userId,
                        email: inputData.authorEmail,
                        message: `Your ticket was assigned to "${inputData.handlerEmail}"`,
                    },
                    {
                        id: inputData.handlerId,
                        email: inputData.handlerEmail,
                        message: `You were assigned a new ticket "${ticket.title}"`,
                    },
                ],
                type: "email",
                data: inputData.ticketId,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Ticket assigned successfully`,
                data: ticket,
                logDetails,
                notificationDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteTicket(req: CustomRequest, res: Response, next: NextFunction){
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    userId: req.user?.user_id,
                    role: req.user?.role,
                    ticketId: req.params.ticketId,
                    userEmail: req.body.userEmail,
                    ticketTitle: req.body.ticketTitle,
                },
                deleteTicketSchema,
            );

            /* Send the data to the service layer to delete the ticket */
            const { data: ticket, duration } = await measureTime(
                async () => ticketService.deleteTicket(
                    inputData.userId!, 
                    inputData.ticketId, 
                    inputData.role!
                ), `Delete-ticket`);

            /* Generate log data */
            const logDetails = {
                message: `User "${inputData.userId}" deleted the ticket "${inputData.ticketId}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: ticket,
            };

            /* Generate notification details */
            const notificationDetails = {
                users: [{
                        id: inputData.userId!,
                        email: inputData.userEmail,
                        message: `Your ticket "${inputData.ticketTitle}"`,
                    }],
                type: `email`,
                data: null,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Ticket deleted succesfully`,
                data: ticket,
                logDetails,
                notificationDetails,
            });
        } catch (error) {
            next(error);
        }
    }
}