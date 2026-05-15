import ApiResponse from "../../common/utils/api-response.js";
import { getPollAnalyticsService } from "./analytics.service.js";

export const getAnalytics = async (req, res) => {
  const { pollId } = req.params;

  const data = await getPollAnalyticsService(pollId);

  return ApiResponse.ok(res, "Analytics fetched", data);
};