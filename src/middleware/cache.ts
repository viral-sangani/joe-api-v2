"use strict";

import { NextFunction, Response } from "express";
import { RequestCustom } from "../utils/types";

const TTL = 5 * 60;

export async function cache(
  req: RequestCustom,
  res: Response,
  next: NextFunction
) {
  if (req.method !== "GET") {
    return await next();
  }

  const cached = req.cache[req.url];
  if (
    cached !== undefined &&
    cached.ts &&
    cached.ts + TTL * 1000 > Date.now()
  ) {
    req.body = cached.body;
    return;
  }

  await next();

  res.set("Cache-Control", `public, max-age=${TTL}`);
  req.cache[req.url] = {
    ts: Date.now(),
    body: req.body,
  };
}
