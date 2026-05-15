// import Response from "../response/response.model.js";
// import Poll from "../poll/poll.model.js";
// import ApiError from "../../common/utils/api-error.js";

// export const getPollAnalyticsService = async (pollId) => {
//   const poll = await Poll.findById(pollId);

//   if (!poll) throw ApiError.notfound("Poll not found");

//   const responses = await Response.find({ pollId });

//   const totalResponses = responses.length;

//   const questionStats = {};

//   // build structure
//   for (const question of poll.questions) {
//     questionStats[question._id] = {
//       text: question.text,
//       totalVotes: 0,
//       options: {}
//     };

//     for (const opt of question.options) {
//       questionStats[question._id].options[opt] = 0;
//     }
//   }

//   // compute votes
//   for (const response of responses) {
//     for (const ans of response.answers) {
//       const q = questionStats[ans.questionId];
//       if (!q) continue;

//       const selected =
//         ans.selectedOptions?.[0] ||
//         ans.selectedOption;

//       if (!selected) continue;
//       q.totalVotes += 1;

//       if (q.options[selected] !== undefined) {
//         q.options[selected] += 1;
//       }
//     }
//   }

//   return {
//     pollId,
//     totalResponses,
//     questionStats
//   };
// };


import Response from "../response/response.model.js";
import Poll from "../poll/poll.model.js";
import ApiError from "../../common/utils/api-error.js";

export const getPollAnalyticsService = async (pollId) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw ApiError.notfound("Poll not found");
  }

  const responses = await Response.find({ pollId });

  const totalResponses = responses.length;

  const questionStats = {};

  // Build structure
  for (const question of poll.questions) {
    questionStats[question._id] = {
      text: question.text,
      totalVotes: 0,
      options: {},
    };


    for (const opt of question.options) {
      questionStats[question._id].options[opt] = 0;
    }
  }

  // Compute votes
  for (const response of responses) {
    for (const ans of response.answers) {
      const q = questionStats[ans.questionId];

      if (!q) continue;

      // selectedOption may come from either payload shape.
      const selected =
        ans.selectedOptions?.[0] ??
        (Array.isArray(ans.selectedOptions) ? ans.selectedOptions[0] : undefined) ??
        ans.selectedOption;

      if (!selected) continue;

      q.totalVotes += 1;

      if (q.options[selected] !== undefined) {
        q.options[selected] += 1;
      }
    }
  }

  return {
    pollId,
    totalResponses,
    questionStats,
  };
};