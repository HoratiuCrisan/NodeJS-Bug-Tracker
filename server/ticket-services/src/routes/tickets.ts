import express from 'express';
import { Request, Response } from 'express';
import admin from "../config/firebase-config";
import {verifyUserRole} from "../middleware/roleMiddleware";
const verifyToken = require("../middleware/tokenMiddleware");
import CustomRequest from '#/utils/interfaces/Error';
const db = admin.firestore();
import { Ticket, TicketObject } from '#/utils/interfaces/Ticket';
import logger from '#/logger';

const router = express.Router();

router.post("/", verifyToken, verifyUserRole(['user', 'developer', 'project-manager', 'admin']) , async (req: CustomRequest, res: Response) => {
    /* Check for errors from the token or the role checking */
    if (req.errorMessage && req.errorStatus) {
        return res.status(req.errorStatus).send(req.errorMessage);
    }

    try {
        /* Get the ticket data from the body of the request */
        const {formData, author, authorPicture} = req.body;

        const ticketData = {
            "Title": formData.title,
            "Description": formData.description,
            "Author": author,
            "AuthorPicture": authorPicture,
            "Priority": formData.priority.label,
            "Type": formData.type.label,
            "Status": "New",
            "Handler": "",
            "HandlerId": "",
            "Deadline": formData.deadline,
            "Response": "",
            "CreatedAt": new Date().toISOString().split('T')[0],
            "Files": []
        }
        
        /* Create the new ticket */
        const createTicket = await db.collection('Tickets').add({
            "Title": formData.title,
            "Description": formData.description,
            "Author": author,
            "AuthorPicture": authorPicture,
            "Priority": formData.priority.label,
            "Type": formData.type.label,
            "Status": "New",
            "Handler": "",
            "HandlerId": "",
            "Deadline": formData.deadline,
            "Response": "",
            "CreatedAt": new Date().toISOString().split('T')[0],
            "Files": []
        });


        /* If the ticket has not been created return server error */
        if (!createTicket) {
            //logger.error(`Failed to create a new ticket`);
            res.send(500).send("Error! Internal Server Error! Please try again later!");
        }

        /* Log the creation of a new ticket */
        //logger.info(`${formData.Author} created a new ticket successfully: ${createTicket.id}`);

        /* Create the initial version of the ticket */
        const ticketVersion = {
            version: Date.now(),
            ...ticketData,
            updatedBy: author,
            updatedAt: new Date()
        };

        /* Set the first version of the ticket in the TicketVersions collection */
        const response = await db.collection('TicketVersions').doc(createTicket.id).set({
            ticketId: createTicket.id,
            versions: [ticketVersion]
        });

        /* Check if the ticket version has not been created */
        if (!response) {
            //logger.error(`Failed to create the first version of the ${createTicket.id} ticket`);
            return res.status(400).send({error: "Failed to create the first version of the ticket"});
        }   

        /* Log the creation of the first ticket version */
        //logger.info(`${createTicket.id}'s first version created successfully`);
        
        /* Ticket has been created successfully */
        return res.status(200).send({message: "Ticket created successfuly!"});
    } catch (error) {
        console.error("Error at creating a new ticket", error);
        //logger.error(`Failed to create a new ticket: ${error}`);
        return res.status(500).send({message: "Internal Server Error!"});
    }
});

router.get("/", verifyToken, verifyUserRole(['admin', 'user', 'developer', 'project-manager']) , async(req: CustomRequest, res: Response) => {
    if (req.errorMessage && req.errorStatus) {
        console.log(req.errorMessage);
        return res.status(req.errorStatus).send(req.errorMessage);
    }
    
    try {
        /* Get all tickets from the Tickets column from the database */
        const response = await db.collection('Tickets').get();
        const tickets: TicketObject[] = [];
        
        /* For each ticket in the document, add a new object containing
        the ticket data and ticket id in the `tickets` list */
        response.forEach((doc:any) => {
            tickets.push({
                id: doc.id,
                data: doc.data()
            });
        });


        /* Return success message */
        //logger.info(`Successfully fetched all tickets`);
        res.status(200).json(tickets);
    } catch (error) {
        /* If the tickets could not be fetced, return error message */
        console.error('Error at retrieving tickets from db', error);
        //logger.error(`Failed to fetch all tickets: ${error}`);
        res.send(500).json({error: 'Internal Server Error'});
    }
});

router.get("/:username", verifyToken, verifyUserRole(['user', 'developer', 'project-manager', 'admin']) , async(req: CustomRequest, res: Response) => {
    /* Check for errors from the token or the role checking */
    console.log(req.params)
    if (req.errorMessage && req.errorStatus) {
        return res.status(req.errorStatus).send(req.errorMessage);
    }

    try {
        /* Get the username from the parameters */
        const username = req.params.username;

        /* If no username is provided, return error message */ 
        if (!username) {
            //logger.error(`Failed to get ${username}'s tickets`);
            return res.status(403).send({message: 'Error! No username provided!'});
        }

        /* Get all tickets from the Tickets column from the database */
        const response = await db.collection('Tickets').get();
        const tickets: TicketObject[] = [];
        
        /* For each ticket in the document for the current user (username is equal to the Handler or the Author) */
        response.forEach((doc:any) => {
            const ticketData = doc.data()
            if (ticketData.Author === username || ticketData.Handler === username) {
                tickets.push({
                    id: doc.id,
                    data: doc.data()
                });
            }
        });

        /* Return success message */    
        res.status(200).json(tickets);
    } catch (error) {
        /* If the tickets could not be fetched, return error message */
        console.error('Error at retrieving tickets from db', error);
        //logger.error(`Failed to get tickets`);
        res.send(500).json({error: 'Internal Server Error'});
    }
});

router.get("/:username/:id", verifyToken, verifyUserRole(['user', 'developer', 'project-manager' ,'admin']) , async(req: CustomRequest, res: Response) => {
    /* Check for errors from the token or the role checking */
    if (req.errorMessage && req.errorStatus) {
        return res.status(req.errorStatus).send(req.errorMessage);
    }
    
    try {
        /* Get the username and the id from the method parameters */
        const {username, id} = req.params;

        /* Fetch the ticket data based on the id */
        const ticketRef = db.collection('Tickets').doc(id);
        const ticketDoc = await ticketRef.get();
        
        /* If the ticket was not found, return 404 error */
        if (!ticketDoc.exists) {
            //logger.error(`Failed to get ${username}'s ${id} ticket`);
            return res.status(404).json({error: 'Ticket not found'});
        }

        /* Fetch the ticket found */
        const ticketData = ticketDoc.data();

        if (!ticketData) {
            return res.status(404).send({error: 'Ticket not found'});
        }
        
        /* Check if the user that send the request is the author or the handler of the ticket */
        if (ticketData.Handler === username) {
            return res.status(200).json(ticketData);
        } else if (ticketData.Author === username) {
            return res.status(200).json(ticketData);
        }
         else if (req.user.role === "admin") {
            return res.status(200).json(ticketData);
        }

        //logger.error(`Unauthorized user tried fetching ${username}'s ${id} ticket`);
        return res.status(401).send("Error! Unauthorized user");
    } catch (error) {
        /* If the server could not be called, return error message */
        console.error("Error fetching ticket from database: ", error);
        return res.status(500).json({error: "Failed to retreive ticket"});
    }
});

router.put('/:id', verifyToken, verifyUserRole(['user', 'developer', 'porject-manager' ,'admin']), async(req:CustomRequest, res:Response) => {
    /* Check for errors from the token or the role checking */
    if (req.errorMessage && req.errorStatus) {
        return res.status(req.errorStatus).send(req.errorMessage);
    }
    
    try {
        /* Get the id from the method parameters */
        const ticketId = req.params.id;
        const {updateData, author} = req.body;

        /* If the ticket data was not provided, return error message */
        if (!updateData) {
            //logger.error(`${author} could not update ticekt $ticketId}! Ticket data was not provided`);
            return res.status(403).json({error: 'Error! No ticket data provided'});
        }

        /* Try updating ticket data with the `updateData` value */
        const data = await db.collection('Tickets').doc(ticketId).update(updateData);

        /* If the ticket data was not updated, return error message */
        if (!data) {
            //logger.error(`${author} could not update ticekt $ticketId}`);
            return res.status(405).json({error: 'Ticket data could not be updated'});
        }

        //logger.info(`Ticket ${ticketId} updated successfully by ${author}`);

        /* Fetch the updated ticket data */
        const updatedTicket = await db.collection('Tickets').doc(ticketId).get();
        
        /* New ticket version */
        const ticketVersion = {
            version: Date.now(),
            ...updatedTicket.data(),
            updatedBy: author,
            updatedAt: new Date(),
        };
        
        /* Get the ticket version document */
        const ticketVersionRef = db.collection('TicketVersions').doc(ticketId);
        const ticketVersionsDoc = await ticketVersionRef.get();

        if (ticketVersionsDoc.exists) {
            /* If the document exists, add the version to the document versions map */
            const response = await ticketVersionRef.update({
                versions: admin.firestore.FieldValue.arrayUnion(ticketVersion)
            });

            /* If the version could not be added return error */
            if (!response) {
                //logger.error(`Ticket ${ticketId}'s version couldn not be updated`);
                return res.status(400).send({error: `Ticket ${ticketId}'s version couldn not be updated`});
            }

            //logger.info(`Ticket ${ticketId}'s version updated successfully`);
        } else {
            /* If this is the first document verison set the documetn versions map */
            const response = await ticketVersionRef.set({
                ticketId: ticketId,
                versions: [ticketVersion]
            });

            /* If the version could not be set return error */
            if (!response) {
                //logger.error(`Ticket ${ticketId}'s version couldn't be updated`);
                return res.status(400).send({error: `Ticket ${ticketId}'s version couldn't be updated`});
            }

            //logger.info(`Ticket ${ticketId}'s version updated successfully`);
        }

        /* Return success message */
        res.status(200).json({message: `Ticket ${ticketId} updated successfully`});

    } catch (error) {
        /* If the method could not be called, return error message */
        console.error('Error updating ticket: ', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.put('/assign/:id', verifyToken, verifyUserRole(['admin']), async (req : CustomRequest, res: Response) => {
    if (req.errorMessage && req.errorStatus) {
        return res.status(req.errorStatus).send(req.errorMessage);
    }

    try {
        const ticketId = req.params.id;

        if (!ticketId) {
            //logger.error(`Failed to assign a ticket! Ticket ID was not provided`);
            return res.status(400).send({ error: 'Error! Unauthorized user!' });
        }

        const { handler, handlerId, author } = req.body;

        if (!handler || !handlerId) {
            //logger.error(`Failed to assign a handler! Handler or HandlerId was not provided`);
            return res.status(400).send({ error: 'Error! Handler or HandlerId not received!' });
        }

        const ticketRef = db.collection('Tickets').doc(ticketId);
        const response = await ticketRef.update({
            Handler: handler,
            HandlerId: handlerId
        });

        if (!response) {
            return res.status(500).send({ error: 'Error! Internal Server Error!' });
        }

        const io = req.app.get('socketio');

        io.to(handlerId).emit('new-assigned-ticket', {
            message: `A new ticket has been assigned to you.`,
            ticketId,
        });

        //logger.info(`${author}'s ticket: ${ticketId} has been assigned to ${handler}`);

        const updatedTicket = await ticketRef.get();
        
        const ticketVersion = {
            version: Date.now(),
            ...updatedTicket.data(),
            updatedBy: author,
            updatedAt: new Date(),
        };

        const ticketVersionRef = db.collection('TicketVersions').doc(ticketId);
        const ticketVersionsDoc = await ticketVersionRef.get();

        if (ticketVersionsDoc.exists) {
            const response = await ticketVersionRef.update({
                versions: admin.firestore.FieldValue.arrayUnion(ticketVersion)
            });

            if (!response) {
                //logger.error(`Ticket ${ticketId}'s version could not be updated`);
                return res.status(400).send({ error: `Ticket ${ticketId}'s version could not be updated` });
            }

            //logger.info(`Ticket ${ticketId}'s version updated successfully`);
        } else {
            const response = await ticketVersionRef.set({
                ticketId: ticketId,
                versions: [ticketVersion]
            });

            if (!response) {
                //logger.error(`Ticket ${ticketId}'s version couldn't be updated`);
                return res.status(400).send({ error: `Ticket ${ticketId}'s version couldn't be updated` });
            }

            //logger.info(`Ticket ${ticketId}'s version updated successfully`);
        }

        await db.collection('Notifications').add({
            ticketId: ticketId,
            message: `Ticket ${ticketId} was assigned to ${handler} by ${author}`,
            userId: handlerId,
            createdAt: new Date()
        });

        //logger.info(`Notification for ticket ${ticketId} assignment to ${handler}`);

        res.status(200).send({ message: `Ticket ${ticketId} assigned to ${handler}` });

    } catch (error) {
        console.error("Error updating ticket handler: ", error);
        //logger.error(`Failed to assign a ticket`);
        res.status(500).send({ error: 'Internal server error' });
    }
});

router.delete("/:id", verifyToken , verifyUserRole(['user', 'admin']) , async(req:CustomRequest, res:Response) => {
    /* Check for errors from the token or the role checking */
    if (req.errorMessage && req.errorStatus) {
        return res.status(req.errorStatus).send(req.errorMessage);
    }

    try {
        const ticketId = req.params.id;

        /* If the ticket id was not provided, return error message */
        if (!ticketId) {
            //logger.error(`Failed to delete ticket! Ticket ID was not provided`)
            return res.status(403).json({message: 'Ticket id has not been provided'});
        } 

        /* Delete ticket */
        const response = await db.collection('Tickets').doc(ticketId).delete();

        if (!response) {
            //logger.error(`Internal server error! Ticket ${ticketId} was not deleted`);
            return res.status(500).send("Error! Could not delete ticket!");
        }

        //logger.info(`${ticketId} deleted successfully`);
        res.status(200).json({message: `Ticket ${ticketId} deleted successfully`});
    } catch (error) {
        /* If the method could not be called, return error message */
        console.error('Error deleting ticket: ', error);
        //logger.error(`Failed to delete ticket!`);
        res.status(500).json({error: 'Internal server error'});
    }
})

export default router;