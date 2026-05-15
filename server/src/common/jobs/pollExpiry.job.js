import Poll from "../../modules/poll/poll.model.js";

export const startPollExpiryJob = () => {
  setInterval(async () => {
    try {
      const now = new Date();

      const result = await Poll.updateMany(
        {
          status: "active",
          expiresAt: { $lte: now }
        },
        {
          $set: { status: "expired" }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`Expired ${result.modifiedCount} polls`);
      }
    } catch (err) {
      console.error("Poll expiry job error:", err);
    }
  }, 60 * 1000); // every 1 min
};