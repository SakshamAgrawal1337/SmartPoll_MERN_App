import Poll from "./poll.model.js";
import { generatePollCode } from "../../common/utils/generateCode.js";

export const createPollService = async (data, userId) => {
  const code = generatePollCode();

  const poll = await Poll.create({
    ...data,
    createdBy: userId,
    accessCode: code
  });

  return poll;
};

export const getPollByCodeService = async (code) => {
  return await Poll.findOne({ accessCode: code });
};

export const getMyPollsService = async (userId) => {
  return await Poll.find({
    createdBy: userId,
  })
    .sort({ createdAt: -1 })
    .select(
      "title description accessCode status isAnonymous expiresAt questions createdAt"
    );
};

export const deletePollService = async (pollId, userId) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    const error = new Error("Poll not found");
    error.statusCode = 404;
    throw error;
  }

  // (optional but recommended) ownership check
  if (poll.createdBy.toString() !== String(userId)) {
    const error = new Error("Unauthorized to delete this poll");
    error.statusCode = 403;
    throw error;
  }

  await Poll.findByIdAndDelete(pollId);

  return {
    message: "Poll deleted successfully",
  };
};

export const getPollByIdService = async (pollId, userId) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    const error = new Error("Poll not found");
    error.statusCode = 404;
    throw error;
  }

  if (poll.createdBy.toString() !== String(userId)) {
    const error = new Error("Unauthorized");
    error.statusCode = 403;
    throw error;
  }

  return poll;
};

export const updatePollService = async (
  pollId,
  data,
  userId
) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    const error = new Error("Poll not found");
    error.statusCode = 404;
    throw error;
  }

  if (poll.createdBy.toString() !== String(userId)) {
    const error = new Error("Unauthorized");
    error.statusCode = 403;
    throw error;
  }
  Object.assign(poll, data);

  // If expiry is extended into the future, revive poll back to active.
  // Otherwise, keep/mark it expired.
  if (poll.expiresAt) {
    poll.status = poll.expiresAt > new Date() ? "active" : "expired";
  }

  await poll.save();
  return poll;
};


export const closePollService = async (pollId, userId) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    const error = new Error("Poll not found");
    error.statusCode = 404;
    throw error;
  }

  if (poll.createdBy.toString() !== String(userId)) {
    const error = new Error("Unauthorized");
    error.statusCode = 403;
    throw error;
  }

  // If already not active/expired, return message without changing state
  if (poll.status !== "active") {
    return {
      message:
        poll.status === "expired"
          ? "Poll expired"
          : "Poll is already closed",
      poll,
    };
  }

  // Close: mark as expired immediately (set global expiry to now)
  const now = new Date();
  poll.status = "expired";
  poll.expiresAt = now;
  await poll.save();


  return {
    message: "Poll closed successfully",
    poll,
  };
};
