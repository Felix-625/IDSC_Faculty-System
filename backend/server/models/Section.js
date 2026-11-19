const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    sectionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    sectionName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    program: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    yearLevel: {
      type: Number,
      required: true,
    },
    maxCapacity: {
      type: Number,
      default: 45,
    },
    academicYear: {
      type: String,
      default: "2026-2027",
    },
    semester: {
      type: String,
      default: "1st Semester",
    },
    studentIds: [{ type: String }],
    status: {
      type: String,
      enum: ["OPEN", "FULL", "CLOSED"],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Section", sectionSchema);
