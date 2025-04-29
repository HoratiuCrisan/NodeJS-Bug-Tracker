import express from 'express';
import { LogController} from "../Controller/logController";
import { checkRequestError } from "@bug-tracker/usermiddleware";
import {verifyToken} from "@bug-tracker/usermiddleware";
import { verifyUserRole } from '@bug-tracker/usermiddleware';

const router = express.Router();

router.get(
    "/:day/:type/:logId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    LogController.getLog,
);

router.get(
    "/:day/:type/",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    LogController.getLogs,
);

router.put(
    "/:day/:type/:logId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    LogController.updateLog,
);

router.delete(
    "/:day/:type/:logId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    LogController.deleteLog,
);

export default router;