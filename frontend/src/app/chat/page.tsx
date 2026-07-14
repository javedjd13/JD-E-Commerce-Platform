"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, UserRound } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ChatMessage,
  ChatUser,
  Conversation,
  createConversation,
  getChatUsers,
  getConversations,
  getMessages,
  getSocketUrl,
} from "@/features/chat/chat.api";
import { cn } from "@/utils/cn";

function displayInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function messageTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function otherParticipant(conversation: Conversation, currentUserId?: number) {
  return conversation.participants.find((participant) => participant.id !== currentUserId);
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: isUserLoading } = useAuth();
  const isAuthenticated = Boolean(user);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const usersQuery = useQuery({
    queryKey: ["chat", "users"],
    queryFn: getChatUsers,
    enabled: isAuthenticated,
  });

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: getConversations,
    enabled: isAuthenticated,
  });

  const conversations = conversationsQuery.data?.conversations || [];
  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  const messagesQuery = useQuery({
    queryKey: ["chat", "messages", selectedConversationId],
    queryFn: () => getMessages(selectedConversationId!),
    enabled: Boolean(selectedConversationId && isAuthenticated),
  });

  const messages = messagesQuery.data?.messages || [];
  const currentRecipient = selectedConversation
    ? otherParticipant(selectedConversation, user?.id)
    : null;

  const existingRecipientIds = useMemo(
    () =>
      new Set(
        conversations
          .map((conversation) => otherParticipant(conversation, user?.id)?.id)
          .filter(Boolean),
      ),
    [conversations, user?.id],
  );

  const startConversation = useMutation({
    mutationFn: createConversation,
    onSuccess: ({ conversation }) => {
      queryClient.setQueryData<{ conversations: Conversation[] }>(
        ["chat", "conversations"],
        (current) => {
          const existing = current?.conversations || [];
          const rest = existing.filter((item) => item.id !== conversation.id);
          return { conversations: [conversation, ...rest] };
        },
      );
      socketRef.current?.emit("chat:join", { conversationId: conversation.id });
      setSelectedConversationId(conversation.id);
    },
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io(getSocketUrl(), {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    socket.on("chat:message", (message: ChatMessage) => {
      queryClient.setQueryData<{ messages: ChatMessage[] }>(
        ["chat", "messages", message.conversationId],
        (current) => {
          const existing = current?.messages || [];
          if (existing.some((item) => item.id === message.id)) return current;
          return { messages: [...existing, message] };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient]);

  useEffect(() => {
    if (!selectedConversationId) return;
    socketRef.current?.emit("chat:join", { conversationId: selectedConversationId });
  }, [selectedConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, selectedConversationId]);

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !selectedConversationId) return;

    socketRef.current?.emit(
      "chat:send",
      { conversationId: selectedConversationId, content },
      (response: { ok: boolean; error?: string }) => {
        if (!response.ok) {
          queryClient.invalidateQueries({
            queryKey: ["chat", "messages", selectedConversationId],
          });
        }
      },
    );
    setDraft("");
  }

  function renderAvatar(person?: ChatUser | null) {
    return (
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {person?.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.profileImageUrl}
            alt={person.name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          displayInitials(person?.name || "User") || <UserRound className="h-4 w-4" />
        )}
      </div>
    );
  }

  if (isUserLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-10">Loading chat...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <MessageCircle className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Login required</h1>
        <p className="mt-2 text-muted-foreground">Please login to open your chats.</p>
        <Button className="mt-6" asChild>
          <a href="/login">Login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[320px_1fr]">
      <aside className="min-h-[70vh] overflow-hidden rounded-lg border bg-card">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Chats</h1>
          </div>
        </div>

        <div className="border-b p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Start a chat
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {usersQuery.data?.users.map((chatUser) => (
              <button
                key={chatUser.id}
                type="button"
                disabled={startConversation.isPending}
                onClick={() => startConversation.mutate(chatUser.id)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-60"
              >
                {renderAvatar(chatUser)}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{chatUser.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {existingRecipientIds.has(chatUser.id) ? "Open chat" : chatUser.email}
                  </span>
                </span>
              </button>
            ))}
            {!usersQuery.data?.users.length ? (
              <p className="px-2 py-6 text-sm text-muted-foreground">No other users found.</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1 p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Conversations
          </p>
          {conversations.map((conversation) => {
            const participant = otherParticipant(conversation, user?.id);
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConversationId(conversation.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted",
                  selectedConversationId === conversation.id && "bg-muted",
                )}
              >
                {renderAvatar(participant)}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {participant?.name || "User"}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {conversation.lastMessage?.content || "No messages yet"}
                  </span>
                </span>
              </button>
            );
          })}
          {!conversations.length ? (
            <p className="px-2 py-6 text-sm text-muted-foreground">Your inbox is empty.</p>
          ) : null}
        </div>
      </aside>

      <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-lg border bg-card">
        {selectedConversationId ? (
          <>
            <div className="flex items-center gap-3 border-b p-4">
              {renderAvatar(currentRecipient)}
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{currentRecipient?.name || "Chat"}</h2>
                <p className="truncate text-sm text-muted-foreground">
                  {currentRecipient?.email}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
              {messagesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              ) : null}
              {messages.map((message) => {
                const isMine = message.sender.id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={cn("flex", isMine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[78%] rounded-lg px-3 py-2 text-sm shadow-sm",
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-card-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={cn(
                          "mt-1 text-[11px]",
                          isMine ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {messageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 border-t p-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage(event);
                  }
                }}
                placeholder="Type a message"
                rows={1}
                className="min-h-11 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" disabled={!draft.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <MessageCircle className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a user or open an existing chat.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
