import { Router } from "express";
import { 
    verifyToken,
    checkRequestError,
    verifyUserRole,
} from "@bug-tracker/usermiddleware";
import { VersionController } from "../controller/versionController";

const router = Router();

/* POST requests */

/* GET requests */

router.get(
    "/:type/:itemId/:versionId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    VersionController.getItemVersion,
);

router.get(
    "/:type/:itemId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    VersionController.getItemVersions,
);

/* PUT requests */

/* DELETE requests */

router.delete(
    "/:type/:itemId/versions",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    VersionController.deleteItemVersions,
);

router.delete(
    "/:type/:itemId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    VersionController.deleteItem,
);

export default router;  