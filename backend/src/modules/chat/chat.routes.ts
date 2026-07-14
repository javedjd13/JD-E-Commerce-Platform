const router = require("express").Router();
const asyncHandler = require("../../utils/asyncHandler");
const { authenticate } = require("../../middleware/auth");
const chat = require("./chat.controller");

router.use(authenticate);

router.get("/users", asyncHandler(chat.users));
router.get("/conversations", asyncHandler(chat.conversations));
router.post("/conversations", asyncHandler(chat.createConversation));
router.get(
  "/conversations/:conversationId/messages",
  asyncHandler(chat.messages),
);

module.exports = router;

export {};
