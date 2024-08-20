import { Router, Request, Response } from 'express';
import admin from '../../config/firebase';
import { Server } from 'socket.io';

const db = admin.firestore();
const notificationRouter = Router();

export default (io: Server) => {

    notificationRouter.get("/:userId", async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId;
            const notificationRef = db.collection('Notifications').doc(userId);
            const doc = await notificationRef.get();

            if (!doc.exists) {
                return res.status(404).send({error: 'Notifications not found'});
            }

            const notifications = doc.data()?.notifications || [];
            return res.status(200).send({notifications});
        } catch (error) {
            console.error(error);
            return res.status(500).send({error: 'Error fetching notifications'});
        }
    });

    notificationRouter.get("/:userId/:notificationId", async (req: Request, res: Response) => {
        try {
            const { userId, notificationId } = req.params;
            console.log(userId, notificationId)
            const notificationRef = db.collection('Notifications').doc(userId);
            const doc = await notificationRef.get();

            if (!doc.exists) {
                return res.status(404).send({error: 'Notifications not found'});
            }

            const notifications = doc.data()?.notifications || [];
            
            const notification = notifications[notificationId];

            if (!notification) {
                return res.status(404).send({error: 'Notification not found'});
            }

            return res.status(200).send({notification});
        } catch (error) {
            console.error("Error fetching user notification: ", error);
            return res.status(500).send({error: "Error fetching user notification"});
        }
    });

    notificationRouter.put("/:userId/:notificationId", async (req: Request, res: Response) => {
        try {
            const { userId, notificationId } = req.params;

            if (!userId) {
                return res.status(400).send({error: 'Invalid user ID'});
            }

            if (!notificationId) {
                return res.status(400).send({error: 'Invalid notification ID'});
            }

            const notificationRef = db.collection('Notifications').doc(userId);
            const doc = await notificationRef.get();

            if (!doc.exists) {
                return res.status(404).send({error: 'Notifications not found'});
            }

            const notifications = doc.data()?.notifications || [];

            const notification = notifications[notificationId];

            if (!notification) {
                return res.status(404).send({error: 'Notification not found'});
            }

            notification.read = true;
            await notificationRef.update({ notifications });

            // Notify the user via Socket.io
            io.emit('notification-status-changed', { userId, notification });

            return res.status(200).send({ message: 'Notification updated successfully' });
        } catch (error) {
            console.error("Failed to update notification: ", error);
            return res.status(500).send({error: 'Failed to update notification'});
        }
    });

    notificationRouter.delete("/:userId/:notificationId", async (req: Request, res: Response) => {
        try {
            const {userId, notificationId} = req.params;

            if (!userId) {
                return res.status(400).send({error: "Invalid user ID"});
            }

            if (!notificationId) {
                return res.status(400).send({error: "Invalid notification ID"});
            }

            const notificationRef = db.collection("Notifications").doc(userId);
            const doc = await notificationRef.get();

            if (!doc.exists) {
                return res.status(404).send({error: "Notifications not found"});
            }

            const notifications = doc.data()?.notifications || [];
            const updatedNotifications = notifications.filter((notif: any) => notif !== notifications[notificationId]);

            await notificationRef.update({ notifications: updatedNotifications });

            io.emit("notification-deleted", { userId, notificationId });

            return res.status(200).send({message: "Notifications deleted successfully"});
        } catch (error) {
            console.error("Failed to delete notification: ", error);
            res.status(500).send({error: "Failed to delete notification"});
        }
    });

    return notificationRouter;
}
