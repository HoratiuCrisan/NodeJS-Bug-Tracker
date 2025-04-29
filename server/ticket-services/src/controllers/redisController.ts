import { RedisService } from "../services/redisService";
import { Response, NextFunction } from "express";
import { 
    CustomRequest, 
    handleResponseSuccess, 
    measureTime, 
    validateData 
} from "@bug-tracker/usermiddleware";
import { 
    lockTicketSchema,
    isTicketLockedSchema,
    unlockTicketSchema
} from "../schemas/redisSchema";

const redisService: RedisService = new RedisService();

export class RedisTicketController {
    static async lockTicket(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    userId: req.user?.user_id,
                    ticketId: req.params.ticketId,
                },
                lockTicketSchema,
            );

            /* Send the data to the service layer to lock the ticket */
            const { data: cached, duration } = await measureTime(
                async () => redisService.lockTicket(inputData.userId!, inputData.ticketId), 
                `Lock-ticket`
            );

            /* Generate the locked data */
            const logDetails = {
                message: `Ticket "${inputData.ticketId}" locked by the user "${inputData.userId}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: cached,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Ticket locked successfully`,
                data: cached,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async isTicketLocked(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    ticketId: req.params.ticketId, /* The ID of the ticket */
                },
                isTicketLockedSchema, /* The validation schema */
            );
            
            /* Send the data to the service layer */
            const { data: cached, duration } = await measureTime(
                async () => redisService.isTicketLocked(inputData.ticketId),
                `Check-locked-ticket`,
            );

            let isLocked = true;
            /* If the cached data is null, return false*/
            if (!cached) {
                isLocked = false;
            } else if (cached && cached.lockedBy === inputData.userId) {
                /* If the ticekt is locked by the current user, return false */ 
                isLocked = false;
            }

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Check if ticket is locked successfully`,
                data: isLocked,
            });
        } catch (error) {
            next(error);
        }
    }

    static async unlockTicket(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {   
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    ticketId: req.params.ticketId, /* The ID of the ticekt */
                },
                unlockTicketSchema, /* The validation schema */
            );

            /* Send the data to the service layer to unlock the ticket */
            const { data: cached, duration } = await measureTime(
                async () => redisService.unlockTicket(inputData.ticketId),
                `Unlock-ticket`
            );

            /* Generate log data */
            const logDetails = {
                message: `Ticket "${inputData.ticketId}" unlocked by the user "${inputData.userId}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: cached,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Ticket unlocked successfully`,
                data: cached,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }
}