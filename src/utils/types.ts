import { Request } from "express";

export interface RequestCustom extends Request {
  cache: any;
}
