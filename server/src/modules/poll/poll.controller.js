
import ApiResponse from "../../common/utils/api-response.js";
import ApiError from "../../common/utils/api-error.js";


import {
  createPollService,
  getPollByCodeService,
  getMyPollsService,
  deletePollService,
  getPollByIdService,
  updatePollService,
} from "./poll.service.js";
import { closePollService } from "./poll.service.js";

export const createPoll = async (req, res) => {
  const poll = await createPollService(req.body, req.user.id);

  return ApiResponse.created(res, "Poll created successfully", poll);
};

export const getPollByCode = async (req, res) => {
  const poll = await getPollByCodeService(req.params.code);

  if (!poll) {
    throw ApiError.notFound("Poll not found");
  }

  if (poll.expiresAt && poll.expiresAt < new Date()) {
    throw ApiError.badRequest("Poll expired");
  }

  return ApiResponse.ok(res, "Poll fetched", poll);
};

export const getMyPolls = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const polls = await getMyPollsService(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Polls fetched successfully",
      data: { polls },
    });

  } catch (err) {
    console.error("GET MY POLLS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch polls",
    });
  }
};


export const deletePoll = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;

    const userId = req.user.id; 
    const result = await deletePollService(id, userId);

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (err) {
    console.error("GET MY POLLS ERROR:", err);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};



export const getPollById = async (req, res) => {
  try {
    const poll = await getPollByIdService(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: poll,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updatePoll = async (req, res) => {
  try {
    const poll = await updatePollService(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: poll,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const closePoll = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await closePollService(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};
