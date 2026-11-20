const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const assignedSubjectSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, required: true },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    facultyId: { type: String },    
    units: { type: Number, default: 3 },
    section: { type: String, required: true },
    semester: { type: String, default: "1st Semester" },
    academicYear: { type: String, default: "2026-2027" },
    assignmentStatus: { type: String, default: "ASSIGNED" },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    facultyId: {
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
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Stored as a bcrypt hash (see the pre-save hook below). Never returned by the API.
    password: {
      type: String,
      required: true,
    },
    // true until the user sets their own password.
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      enum: ["ADMIN", "AVP", "DEAN", "COORDINATOR", "FACULTY", "PROFESSOR", "ASSOCIATE_PROFESSOR", "ASSISTANT_PROFESSOR", "INSTRUCTOR"],
      default: "FACULTY",
    },
    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "OTHER"],
      default: "FULL_TIME",
    },
    specialization: {
      type: String,
      default: "",
    },
    employmentStatus: {
      type: String,
      enum: ["ACTIVE", "INACTIVE","RESIGNED", "ON_LEAVE"],
      default: "ACTIVE",
    },
    assignedSubjects: [assignedSubjectSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
