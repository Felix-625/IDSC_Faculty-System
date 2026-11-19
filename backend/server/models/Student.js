const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    program: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
    yearLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    section: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["ENROLLED", "DROPPED", "ON_LEAVE", "GRADUATED"],
      default: "ENROLLED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
