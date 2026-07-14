import prisma from "../../lib/prisma";
const AppError = require("../../utils/AppError");

const userSelect = {
  publicId: true,
  name: true,
  email: true,
  profileImageUrl: true,
};

const messageInclude = {
  sender: { select: userSelect },
};

const conversationInclude = {
  participants: {
    include: {
      user: { select: userSelect },
    },
  },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: messageInclude,
  },
};

function serializeUser(user: any) {
  return {
    id: user.publicId,
    name: user.name,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
  };
}

function serializeMessage(message: any) {
  return {
    id: message.publicId,
    conversationId: message.conversation?.publicId,
    sender: serializeUser(message.sender),
    content: message.content,
    createdAt: message.createdAt,
  };
}

function serializeConversation(conversation: any) {
  const lastMessage = conversation.messages?.[0];

  return {
    id: conversation.publicId,
    type: conversation.type,
    participants: conversation.participants.map((participant: any) =>
      serializeUser(participant.user),
    ),
    lastMessage: lastMessage ? serializeMessage(lastMessage) : null,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

async function listChatUsers(currentUserId: string) {
  const users = await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: userSelect,
    orderBy: { name: "asc" },
  });

  return users.map(serializeUser);
}

async function listConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: conversationInclude,
    orderBy: { updatedAt: "desc" },
  });

  return conversations.map(serializeConversation);
}

async function findDirectConversation(userId: string, recipientId: string) {
  return prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      participants: {
        every: { userId: { in: [userId, recipientId] } },
        some: { userId },
      },
    },
    include: conversationInclude,
  });
}

async function getOrCreateDirectConversation(userId: string, recipientPublicId: number) {
  const recipient = await prisma.user.findUnique({
    where: { publicId: recipientPublicId },
    select: { id: true },
  });

  if (!recipient || recipient.id === userId) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const existing = await findDirectConversation(userId, recipient.id);
  if (existing) return serializeConversation(existing);

  const conversation = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      participants: {
        create: [{ userId }, { userId: recipient.id }],
      },
    },
    include: conversationInclude,
  });

  return serializeConversation(conversation);
}

async function getConversationForUser(userId: string, conversationPublicId: number) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      publicId: conversationPublicId,
      participants: { some: { userId } },
    },
    include: conversationInclude,
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
  }

  return conversation;
}

async function listMessages(userId: string, conversationPublicId: number) {
  const conversation = await getConversationForUser(userId, conversationPublicId);
  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    include: messageInclude,
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return messages.map((message) =>
    serializeMessage({ ...message, conversation }),
  );
}

async function createMessage(
  userId: string,
  conversationPublicId: number,
  content: string,
) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new AppError("Message cannot be empty", 400, "VALIDATION_ERROR");
  }

  const conversation = await getConversationForUser(userId, conversationPublicId);
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      content: trimmedContent,
    },
    include: messageInclude,
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return serializeMessage({ ...message, conversation });
}

async function getConversationRooms(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    select: { publicId: true },
  });

  return conversations.map((conversation) => conversation.publicId);
}

export {
  createMessage,
  getConversationForUser,
  getConversationRooms,
  getOrCreateDirectConversation,
  listChatUsers,
  listConversations,
  listMessages,
  serializeConversation,
};
