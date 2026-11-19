const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    facultyId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    assignmentId: {
      type: String,
    },
    semester: {
      type: String,
      default: "1st Semester",
    },
    academicYear: {
      type: String,
      default: "2026-2027",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
