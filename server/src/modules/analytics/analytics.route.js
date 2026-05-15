import express from "express";
import { getAnalytics } from "./analytics.controller.js";

const router = express.Router();

// public analytics (guests can view live counts)
router.get("/:pollId", getAnalytics);

export default router;

