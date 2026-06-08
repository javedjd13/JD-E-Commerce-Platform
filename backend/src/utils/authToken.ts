import type { Request } from "express";
import { parseCookies } from "./cookies";

export function getAccessToken(req: Request) {
  const authorization = req.header("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined;
  const cookies = parseCookies(req.headers.cookie);

  return bearerToken || cookies.accessToken;
}
