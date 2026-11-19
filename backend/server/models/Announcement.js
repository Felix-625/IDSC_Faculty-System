const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    announcementId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    postedBy: {
      type: String,
      required: true,
      trim: true,
    },
    postedByPosition: {
      type: String,
      default: "DEAN",
    },
    department: {
      type: String,
      default: "ALL",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Announcement", announcementSchema);
