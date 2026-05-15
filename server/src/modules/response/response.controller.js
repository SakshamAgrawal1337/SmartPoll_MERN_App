import ApiResponse from "../../common/utils/api-response.js";
import { submitResponseService } from "./response.service.js";

export const submitResponse = async (req, res) => {
  const { pollId } = req.params;

  const { response, totalResponses }  = await submitResponseService(
    pollId,
    req.body,
    req.user
  );

    // SOCKET LOGIC HERE
  const io = req.app.get("io");

  // const totalResponses = await Response.countDocuments({ pollId });

  io.to(pollId).emit("analytics-update", {
    pollId,
    totalResponses
  });

  return ApiResponse.created(res, "Response submitted", response);
};