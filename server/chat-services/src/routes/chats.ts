import { Request, Response, NextFunction, Router } from "express";
import admin from '../../config/firebase';

const db = admin.firestore();

const router = Router();

router.post('/conversations', async (req: Request, res: Response) => {
    const { conversationId, participants } = req.body;
    if (conversationId === undefined || !participants || participants.length === 0) {
        console.log(conversationId, participants);
        return res.status(400).send('Invalid request');
    }

    const conversationRef = db.collection('Conversations').doc(conversationId);
    const conversationSnapshot = await conversationRef.get();

    if (!conversationSnapshot.exists) {
        await conversationRef.set({
            id: conversationId,
            participants,
            messages: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    return res.status(200).send({ conversationId: conversationId});
});

router.get('/conversations/:conversationId/messages', async (req: Request, res: Response) => {
    const  conversationId  = req.params.conversationId;
    const conversationRef = db.collection('Conversations').doc(conversationId);
    const conversationSnapshot = await await conversationRef.get();

    if (!conversationSnapshot.exists) {
        return res.status(404).send({ error: 'Conversation not found' });
    }

    const conversastionData = conversationSnapshot.data();
    
    res.status(200).send(conversastionData?.messages || []);
});

router.get('/users', async (req: Request, res: Response) => {
    const usersSnapshot = await db.collection('Users').get();
    const users = usersSnapshot.docs.map((doc: admin.firestore.DocumentSnapshot) => ({
        id: doc.id, ...doc.data()
    }));
    
    return res.status(200).send(users);
});


export default router;

