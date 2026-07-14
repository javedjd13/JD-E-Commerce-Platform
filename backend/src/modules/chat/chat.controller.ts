import {
  getOrCreateDirectConversation,
  listChatUsers,
  listConversations,
  listMessages,
} from "./chat.service";
import { created, ok } from "../../utils/http";
import { readPositiveInt } from "../../utils/ids";

import type { Request, Response } from "express";

export async function users(req: Request, res: Response) {
  return ok(res, { users: await listChatUsers(req.user!.sub) });
}

export async function conversations(req: Request, res: Response) {
  return ok(res, { conversations: await listConversations(req.user!.sub) });
}

export async function createConversation(req: Request, res: Response) {
  const recipientId = readPositiveInt(req.body.recipientId, "Recipient");
  const conversation = await getOrCreateDirectConversation(
    req.user!.sub,
    recipientId,
  );

  return created(res, { conversation });
}

export async function messages(req: Request, res: Response) {
  const conversationId = readPositiveInt(
    req.params.conversationId,
    "Conversation",
  );

  return ok(res, {
    messages: await listMessages(req.user!.sub, conversationId),
  });
}
