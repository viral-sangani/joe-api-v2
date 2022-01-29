"use strict";

import { NextFunction, Request, Response } from "express";

export async function noop(req: Request, res: Response, next: NextFunction) {
  res.statusCode = 200;
}
