import admin from '../../config/firebase';
import { Response, Request, NextFunction, Router } from "express";
const router = Router();
import logger from '../logger';

const db = admin.firestore();

router.put('/setClaims', async (req: Request, res: Response) => {
    try {
        const {uid, role} = req.body;
        
        if (!uid) {
            //logger.error('Invalid user ID');
            return res.status(400).send({error: 'Invalid user ID'});
        }

        if (!role) {
            //logger.error('Invalid user role');
            return res.status(400).send({error: 'Invalid user role'});
        }

        const user = await admin.auth().getUser(uid);

        await admin.auth().setCustomUserClaims(uid, {role: role});

        const userRef = db.collection('Users').doc(uid);
        await userRef.update({ role });

        //logger.info(`User ${uid} connected`);
        res.status(200).send("Custom claims set successfully");
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "auth/user-not-found") {
                //logger.error('User not found in order to set clamis');
                res.status(404).send("User not found");
            } else {
                //logger.error("Could not set user clamis! Internal server error");
                res.status(500).send("Internal server error: " + error);
            }
        } else {
            res.send(500).send("Unknown error occurred: " + error);
        }
        
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        console.log("Get all users called");
        const usersSnapshot = await db.collection('Users').get();
        const users = usersSnapshot.docs.map((doc: admin.firestore.DocumentSnapshot) => ({
            id: doc.id, ...doc.data()
        }));

        if (!users) {
            //logger.error('No users were found in the database');
            return res.status(404).send("No usres were found");
        }

        //logger.info('Fetched users from database');
        res.status(200).send({users});
    } catch (error) {
        console.error("Failed to fetch users from the database");
        //logger.error("Failed to fetch users from the database");
        res.status(500).send({error: "Failed to fetch users from the database"});
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const userDoc = await db.collection('Users').doc(userId).get();

        if (!userDoc.exists) {
            //logger.error(`User with ID ${userId} not found`);
            return res.status(404).send({ error: 'User not found' });
        }

        const userData = { id: userDoc.id, ...userDoc.data() };
        
        //logger.info(`Fetched user with ID ${userId} from database`);
        res.status(200).send({ user: userData });
    } catch (error) {
        console.error(`Failed to fetch user with ID ${req.params.id} from the database`);
        //logger.error(`Failed to fetch user with ID ${req.params.id} from the database`);
        res.status(500).send({ error: "Failed to fetch user from the database" });
    }
});

router.put('/user/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const { displayName, photoUrl, role } = req.body;

        if (!displayName && !photoUrl && !role) {
            //logger.error('No data provided to update');
            return res.status(400).send({ error: 'No data provided to update' });
        }

        const userRef = db.collection('Users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            //logger.error(`User with ID ${userId} not found`);
            return res.status(404).send({ error: 'User not found' });
        }

        const updates: { [key: string]: any } = {};
        if (displayName) {
            updates.displayName = displayName;
        }
        if (photoUrl) {
            updates.photoUrl = photoUrl;
        }
        if (role) {
            updates.role = role;
        }

        await userRef.update(updates);

        //logger.info(`User with ID ${userId} updated successfully`);
        res.status(200).send({ message: 'User updated successfully' });
    } catch (error) {
        console.error(`Failed to update user with ID ${req.params.id}`);
        //logger.error(`Failed to update user with ID ${req.params.id}`);
        res.status(500).send({ error: "Failed to update user" });
    }
});

export default router;