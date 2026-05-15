import Response from "./response.model.js";
import Poll from "../poll/poll.model.js";
import ApiError from "../../common/utils/api-error.js";

export const submitResponseService = async (pollId, data, user) => {
  const poll = await Poll.findById(pollId);

  if (!poll) throw ApiError.notfound("Poll not found");

  if (poll.status !== "active") {
    throw ApiError.badRequest("Poll expired");
  }

  // expiry check
  if (poll.expiresAt && poll.expiresAt < new Date()) {
    throw ApiError.badRequest("Poll expired");
  }

  // duplicate vote check
  if (user?.id) {
    const alreadyVoted = await Response.findOne({
      pollId,
      userId: user.id
    });

    if (alreadyVoted) {
      throw ApiError.conflict("You already voted");
    }
  }

  // mandatory validation
  for (const q of poll.questions) {
    if (q.isMandatory) {
      const found = data.answers.find(
        (a) => a.questionId === q._id.toString()
      );

      if (!found) {
        throw ApiError.badRequest("Missing mandatory question");
      }
    }
  }

  // Normalize answer payload to match Response schema:
  // schema: { questionId: String, selectedOption: String }
  // client may send: { questionId, selectedOptions: [String] }
  const normalizedAnswers = (data.answers || []).map((a) => {
    const selectedOption =
      a.selectedOptions?.[0] ?? // preferred if array exists
      a.selectedOption; // fallback for existing singular field

    return {
      questionId: a.questionId,
      selectedOption: selectedOption ?? null,
    };
  });

  const response = await Response.create({
    pollId,
    userId: poll.isAnonymous ? null : user?.id || null,
    guestName: data.guestName || null,
    answers: normalizedAnswers,
  });

  // ✅ IMPORTANT: return meta for realtime update
  const totalResponses = await Response.countDocuments({ pollId });

  return {
    response,
    pollId,
    totalResponses
  };
};