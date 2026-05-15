import express from "express";

import {
  createPoll,
  getPollByCode,
  getMyPolls,
  deletePoll,
  getPollById,
  updatePoll,
  closePoll,
} from "./poll.controller.js";

import { authenticate } from "../auth/auth.middleware.js";

const pollRoute = express.Router();

// create poll (protected)

pollRoute.post("/", authenticate, createPoll);
pollRoute.get("/my", authenticate, getMyPolls);   // ← add karo

//edit 
pollRoute.get("/edit/:id", authenticate, getPollById);
pollRoute.put("/:id", authenticate, updatePoll);

// public access
pollRoute.delete("/:id", authenticate, deletePoll);
pollRoute.get("/:code", getPollByCode);
pollRoute.patch("/:id/close", authenticate, closePoll);

export default pollRoute;