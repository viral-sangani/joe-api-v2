import { NextFunction, Request, Response } from "express";
("use strict");

export async function rt(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const ms = Date.now() - start;
  res.set("X-Response-Time", `${ms}ms`);
  next();
}
