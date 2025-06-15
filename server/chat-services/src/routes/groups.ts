import { Router } from "express";
import { GroupController } from "../controller/groupController";
import { checkRequestError, verifyToken, verifyUserRole } from "@bug-tracker/usermiddleware";
import { upload } from "../config/multer";

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
    "/upload/files",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    upload.single("file"),
    GroupController.upload,
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
    "/list",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.getUserGroups,
);

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
    "/:groupId/title",
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

groupRouter.put(
    "/:groupId/addMembers",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.addMembers,
);

groupRouter.put(
    "/:groupId/removeMembers",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.removeMembers,
);

groupRouter.put(
    "/:groupId/viewMessages",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    GroupController.viewMessages,
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
