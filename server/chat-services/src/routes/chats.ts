import { Router } from "express";
import { checkRequestError, verifyUserRole } from "@bug-tracker/usermiddleware";
import { verifyToken } from "@bug-tracker/usermiddleware"
import { ChatController } from "../controller/chatController";
import { upload } from "../config/multer";

const router = Router();

/* POST requests */

router.post(
    "/",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.createConversation,
);

router.post(
    "/upload/files", 
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    upload.single("file"),
    ChatController.upload,
)

router.post(
    "/:conversationId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.addMessage,
);

/* GET requests */

router.get(
    "/",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.getUserConversations,
);

router.get(
    "/exists/:receiverId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["developer", "project-manager", "admin"]),
    ChatController.checkConversation,
);

router.get(
    "/:conversationId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.getConversation,
);

router.get(
    "/:conversationId/messages",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.getConversationMessages,
);

router.get(
    "/:conversationId/messages/unread",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.getUnreadMessages,
);

router.get(
    "/:conversationId/messages/:messageId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.getMessage,
);

/* PUT requests */

router.put(
    "/:conversationId/:messageId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.updateMessage,
);

router.put(
    "/:conversationId/messages/view",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.viewMessages,
);

/* DELETE requests */

router.delete(
    "/:conversationId",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.deleteConversation,
);

router.delete(
    "/:conversationId/messages",
    verifyToken,
    checkRequestError,
    verifyUserRole(["user", "developer", "project-manager", "admin"]),
    ChatController.deleteMessages
)

export default router;

