import { Router } from "express";
import { verifyUserRole, verifyToken, checkRequestError } from "@bug-tracker/usermiddleware";
import { UserController } from "../controller/userController";

const router = Router();

router.post(
    "/",
    verifyToken,
    checkRequestError,
    UserController.createUser,
);

router.post(
    "/login",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    UserController.loginUser,
);

router.get(
    "/",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    UserController.getUsers,
);

router.get(
    "/data",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    UserController.getUsersData,
);

router.get(
    "/data/non-users",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    UserController.getNonUsers,
);

router.get(
    "/:userId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    UserController.getUser,
);

router.put(
    "/name",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    UserController.updateDisplayName,
);

router.put(
    "/email",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    UserController.updateEmail,
);

router.put(
    "/photo",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    UserController.updatePhotoUrl,
);

router.put(
    "/status",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    UserController.updateUserStatus,
)

router.put(
    "/password",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    UserController.updatePassword,
);

router.put(
    "/role/:userId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["admin"]),
    UserController.updateRole,
);

router.delete(
    "/:userId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    UserController.deleteUser,
);

export default router;