import { NextFunction, Request, Response } from "express";
("use strict");

export async function logger(req: Request, res: Response, next: NextFunction) {
  await next();
  const rt = res.get("X-Response-Time");
  console.log(
    `<-- ${req.method} ${req.url} | status: ${res.statusCode} | time: ${rt} \n`
  );
}
