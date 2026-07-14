import { apiClient } from "@/services/api-client";
import { getApiUrl } from "@/services/api-url";

export type ChatUser = {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string | null;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  sender: ChatUser;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: number;
  type: "DIRECT";
  participants: ChatUser[];
  lastMessage: ChatMessage | null;
  createdAt: string;
  updatedAt: string;
};

export function getSocketUrl() {
  return getApiUrl().replace(/\/api\/v1$/, "");
}

export function getChatUsers() {
  return apiClient<{ users: ChatUser[] }>("/chat/users", { auth: true });
}

export function getConversations() {
  return apiClient<{ conversations: Conversation[] }>("/chat/conversations", {
    auth: true,
  });
}

export function createConversation(recipientId: number) {
  return apiClient<{ conversation: Conversation }>("/chat/conversations", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ recipientId }),
  });
}

export function getMessages(conversationId: number) {
  return apiClient<{ messages: ChatMessage[] }>(
    `/chat/conversations/${conversationId}/messages`,
    { auth: true },
  );
}
