import jwt from "jsonwebtoken";
import { Server } from "socket.io";
const env = require("./config/env");
import { parseCookies } from "./utils/cookies";
import {
  createMessage,
  getConversationForUser,
  getConversationRooms,
} from "./modules/chat/chat.service";

import type { Server as HttpServer } from "http";

function getSocketToken(socket: any) {
  const authToken = socket.handshake.auth?.token;
  const bearerToken =
    typeof authToken === "string" && authToken.startsWith("Bearer ")
      ? authToken.slice(7)
      : authToken;
  const cookies = parseCookies(socket.handshake.headers.cookie);

  return bearerToken || cookies.accessToken;
}

function conversationRoom(conversationId: number) {
  return `conversation:${conversationId}`;
}

export function initializeSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = getSocketToken(socket);
    if (!token) return next(new Error("Authentication required"));

    try {
      socket.data.user = jwt.verify(token, env.jwt.accessSecret);
      return next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.data.user as { sub: string };
    socket.join(`user:${user.sub}`);

    const rooms = await getConversationRooms(user.sub).catch(() => []);
    rooms.forEach((roomId) => socket.join(conversationRoom(roomId)));

    socket.on("chat:join", async ({ conversationId }, ack) => {
      try {
        const id = Number(conversationId);
        if (!Number.isInteger(id) || id < 1) {
          throw new Error("Invalid conversation");
        }

        await getConversationForUser(user.sub, id);
        socket.join(conversationRoom(id));
        ack?.({ ok: true });
      } catch (error: any) {
        ack?.({ ok: false, error: error.message || "Unable to join chat" });
      }
    });

    socket.on("chat:send", async ({ conversationId, content }, ack) => {
      try {
        const id = Number(conversationId);
        if (!Number.isInteger(id) || id < 1) {
          throw new Error("Invalid conversation");
        }

        const message = await createMessage(user.sub, id, String(content || ""));
        io.to(conversationRoom(id)).emit("chat:message", message);
        ack?.({ ok: true, message });
      } catch (error: any) {
        ack?.({ ok: false, error: error.message || "Unable to send message" });
      }
    });
  });

  return io;
}
