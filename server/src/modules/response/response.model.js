import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    guestName: {
      type: String,
      default: null
    },

    answers: [
      {
        questionId: String,
        selectedOption: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Response", responseSchema);