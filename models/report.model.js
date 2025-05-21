import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Review", "Comment", "User"],
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "type"
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Report", reportSchema);
