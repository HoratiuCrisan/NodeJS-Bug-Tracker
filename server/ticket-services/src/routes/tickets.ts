import {Router} from 'express';
import { verifyToken, checkRequestError, verifyUserRole } from "@bug-tracker/usermiddleware"
import { TicketController } from "../controllers/ticketController";
import { RedisTicketController } from '../controllers/redisController';

const router = Router();

/* POST requests */

router.post(
    "/",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.createTicket,
);

router.post(
    "/lock/:userId/:ticketId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    RedisTicketController.lockTicket,
);

/* GET tickets */

router.get(
    "/",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    TicketController.getAllTickets,
);

router.get(
    "/:userId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.getUserTickets,
);

router.get(
    "/:userId/:ticketId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.getUserTicketById
);

router.get(
    "/lock/:ticketId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    RedisTicketController.isTicketLocked,
);

/* PUT requests */

router.put(
    "/:ticketId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.updateTicketById,
);

router.put(
    "/assign/:ticketId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    TicketController.assignTicket,
);

/* DELETE requests */

router.delete(
    "/:userId/:ticketId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.deleteTicket,
);

router.delete(
    "/lock/:ticketId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    RedisTicketController.unlockTicket,
);

export default router;