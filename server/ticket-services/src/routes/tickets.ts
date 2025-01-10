import express from 'express';
import {verifyUserRole} from "../middleware/roleMiddleware";
const verifyToken = require("../middleware/tokenMiddleware");
import { TicketController } from '#/controllers/ticketController';
import { checkRequestError } from '#/middleware/checkRequestError';
import { RedisTicketController } from '#/controllers/redisController';

const router = express.Router();

router.post(
    "/",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.createTicket,
);

router.post(
    "/lock/:username/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    RedisTicketController.lockTicket,
);

router.post(
    "/cache/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    RedisTicketController.cacheTicket
)

router.get(
    "/",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    TicketController.getAllTickets,
);

router.get(
    "/:username",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.getUserTickets,
);

router.get(
    "/lock/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    RedisTicketController.isTicketLocked,
),

router.get(
    "/cache/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    RedisTicketController.isTicketCached
);



router.get(
    "/:username/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.getUserTicketById
);

router.put(
    "/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.updateTicketById,
);

router.put(
    "/assign/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    TicketController.assignTicket,
);

router.delete(
    "/:username/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    TicketController.deleteTicket,
);

router.delete(
    "/lock/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    RedisTicketController.unlockTicket,
);

router.delete(
    "/cache/:id",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    RedisTicketController.removeTicketFromCache,
);


export default router;