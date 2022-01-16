import { NextFunction, Request, Response } from "express";
("use strict");

export async function powered(req: Request, res: Response, next: NextFunction) {
  await next();
  res.set("X-Powered-By", "moo!");
}
