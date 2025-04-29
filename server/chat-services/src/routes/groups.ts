import { Router } from "express";
import { GroupController } from "../controller/groupController";
import { checkRequestError } from "@bug-tracker/usermiddleware";
import { verifyToken } from "@bug-tracker/usermiddleware";

const groupRouter = Router();

/* POST requests */

groupRouter.post(
    "/",
    verifyToken,
    checkRequestError,
    GroupController.createGroup,
);

groupRouter.post(
    "/:groupId",
    verifyToken,
    checkRequestError,
    GroupController.addMessage,
);

/* GET requests */

groupRouter.get(
    "/:groupId",
    verifyToken,
    checkRequestError,
    GroupController.getGroupData,
);

groupRouter.get(
    "/:groupId/messages/unread",
    verifyToken,
    checkRequestError,
    GroupController.getUnreadMessages,
);

groupRouter.get(
    "/:groupId/messages",
    verifyToken,
    checkRequestError,
    GroupController.getGroupMessages
);

/* PUT requests */

groupRouter.put(
    "/:griupId/title",
    verifyToken,
    checkRequestError,
    GroupController.updateGroupTitle,
);

groupRouter.put(
    "/:groupId/description",
    verifyToken,
    checkRequestError,
    GroupController.updateGroupDescription,
);

groupRouter.put(
    "/:groupId/photo",
    verifyToken,
    checkRequestError,
    GroupController.updateGroupPhoto,
);

/* DELETE requests */

groupRouter.delete(
    "/:groupId",
    verifyToken,
    checkRequestError,
    GroupController.deleteGroup,
);

groupRouter.delete(
    "/:groupId/messages",
    verifyToken,
    checkRequestError,
    GroupController.deleteGroupMessages,
);

export default groupRouter;
