const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    units: {
      type: Number,
      required: true,
      default: 3,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    semester: {
      type: String,
      default: "1st Semester",
    },
    academicYear: {
      type: String,
      default: "2026-2027",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);
