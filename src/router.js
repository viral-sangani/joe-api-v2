import express from "express";
import { tvl } from "./apis/tvl";

const router = express.Router();

router.get("/tvl", tvl);

export default router;
