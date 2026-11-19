const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    gradeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
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
    facultyId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    prelim: {
      type: mongoose.Schema.Types.Mixed, // e.g. 1.25, 2.0, "INC", "DRP", null
      default: null,
    },
    midterm: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    preFinal: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    final: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    remarks: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "RELEASED"],
      default: "DRAFT",
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast student grade lookup per subject & section
gradeSchema.index({ studentId: 1, courseCode: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("Grade", gradeSchema);
