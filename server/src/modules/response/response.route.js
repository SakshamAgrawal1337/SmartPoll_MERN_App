import express from "express";
import { submitResponse } from "./response.controller.js";
import { optionalAuthenticate } from "../../common/middleware/optional-auth.middleware.js";

const router = express.Router();

// allow both anonymous + authenticated users
router.post("/:pollId", optionalAuthenticate, submitResponse);

export default router;

