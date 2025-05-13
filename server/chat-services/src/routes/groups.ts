import { Router } from "express";
import { GroupController } from "../controller/groupController";
import { checkRequestError, verifyToken, verifyUserRole } from "@bug-tracker/usermiddleware";

const groupRouter = Router();

/* POST requests */

groupRouter.post(
    "/",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.createGroup,
);

groupRouter.post(
    "/:groupId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.addMessage,
);

/* GET requests */

groupRouter.get(
    "/:groupId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.getGroupData,
);

groupRouter.get(
    "/:groupId/messages/unread",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.getUnreadMessages,
);

groupRouter.get(
    "/:groupId/messages",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.getGroupMessages
);

/* PUT requests */

groupRouter.put(
    "/:griupId/title",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.updateGroupTitle,
);

groupRouter.put(
    "/:groupId/description",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.updateGroupDescription,
);

groupRouter.put(
    "/:groupId/photo",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.updateGroupPhoto,
);

/* DELETE requests */

groupRouter.delete(
    "/:groupId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.deleteGroup,
);

groupRouter.delete(
    "/:groupId/messages",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.deleteGroupMessages,
);

export default groupRouter;
