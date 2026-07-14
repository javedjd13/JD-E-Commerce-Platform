import type { Response } from "express";

export function ok<T>(res: Response, body: T) {
  return res.status(200).json(body);
}

export function created<T>(res: Response, body: T) {
  return res.status(201).json(body);
}

export function noContent(res: Response) {
  return res.status(204).send();
}
