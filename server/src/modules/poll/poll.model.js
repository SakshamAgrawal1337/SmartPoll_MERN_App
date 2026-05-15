import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: String,

    accessCode: {
      type: String,
      unique: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isAnonymous: {
      type: Boolean,
      default: true
    },

    expiresAt: Date,

    status: {
      type: String,
      enum: ["draft", "active", "expired", "published"],
      default: "active"
    },

    questions: [
      {
        text: String,
        options: [String],
        isMandatory: Boolean
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Poll", pollSchema);