import { Router } from "express";
import { checkRequestError } from "@bug-tracker/usermiddleware";
import { verifyToken } from "@bug-tracker/usermiddleware"
import { ChatController } from "../controller/chatController";

const router = Router();

/* POST requests */

router.post(
    "/",
    verifyToken,
    checkRequestError,
    ChatController.createConversation,
);

router.post(
    "/:conversationId",
    verifyToken,
    checkRequestError,
    ChatController.addMessage,
);

/* GET requests */

router.get(
    "/",
    verifyToken,
    checkRequestError,
    ChatController.getUserConversations,
);

router.get(
    "/:conversationId",
    verifyToken,
    checkRequestError,
    ChatController.getConversation,
);

router.get(
    "/:conversationId/messages",
    verifyToken,
    checkRequestError,
    ChatController.getConversationMessages,
);

router.get(
    "/:conversationId/messages/unread/",
    verifyToken,
    checkRequestError,
    ChatController.getUnreadMessages,
);

router.get(
    "/:conversationId/messages/:messageId",
    verifyToken,
    checkRequestError,
    ChatController.getMessage,
);

/* PUT requests */

router.put(
    "/:conversationId/:messageId",
    verifyToken,
    checkRequestError,
    ChatController.updateMessage,
);

router.put(
    "/:conversationId/messages/view",
    verifyToken,
    checkRequestError,
    ChatController.viewMessages,
);

/* DELETE requests */

router.delete(
    "/:conversationId",
    verifyToken,
    checkRequestError,
    ChatController.deleteConversation,
);

router.delete(
    "/:conversationId/messages",
    verifyToken,
    checkRequestError,
    ChatController.deleteMessages
)

export default router;

