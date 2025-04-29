import { Router } from "express";
import { verifyToken, checkRequestError, verifyUserRole } from "@bug-tracker/usermiddleware";
import { NotificationController } from "../controller/notificationController";

const router = Router();

/* POST requests */

/* GET requests */

router.get(
    "/:userId/:notificationId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    NotificationController.getNotification,
);

router.get(
    "/:userId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    NotificationController.getUserNotifications,
);

/* PUT requests */

router.put(
    "/:userId/:notificationId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    NotificationController.readNotification,
);

/* DELETE requests */

export default router;