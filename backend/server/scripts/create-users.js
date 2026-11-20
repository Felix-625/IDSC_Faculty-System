// Creates real accounts in MongoDB from a JSON file, without deleting anything.
//   npm run create-users -- data/real-users.json
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { User } = require("../models");
const { generateTempPassword } = require("../utils/password");

const POSITIONS = ["ADMIN", "AVP", "DEAN", "FACULTY"];
const REQUIRED = ["facultyId", "name", "email", "department", "position"];

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npm run create-users -- <path-to-users.json>");
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in your .env file.");
    process.exit(1);
  }

  const users = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  if (!Array.isArray(users) || users.length === 0) {
    console.error("The file must contain a non-empty JSON array of users.");
    process.exit(1);
  }

  // Validate everything first so a typo does not leave a half-created batch.
  const problems = [];
  users.forEach((u, i) => {
    for (const field of REQUIRED) {
      if (typeof u[field] !== "string" || !u[field].trim()) problems.push(`#${i + 1}: ${field} is required`);
    }
    if (u.position && !POSITIONS.includes(u.position)) {
      problems.push(`#${i + 1} (${u.facultyId}): position must be one of ${POSITIONS.join(", ")}`);
    }
  });
  if (problems.length) {
    console.error("Fix these problems and run again:\n - " + problems.join("\n - "));
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const rows = [["facultyId", "name", "email", "position", "temporaryPassword"]];
  let created = 0;
  let skipped = 0;

  for (const u of users) {
    const exists = await User.exists({
      $or: [{ facultyId: u.facultyId.trim() }, { email: u.email.trim().toLowerCase() }],
    });
    if (exists) {
      console.log(`- skipped ${u.facultyId} (facultyId or email already exists)`);
      skipped++;
      continue;
    }

    const temporaryPassword = generateTempPassword();
    await User.create({
      facultyId: u.facultyId.trim(),
      name: u.name.trim(),
      email: u.email.trim(),
      department: u.department.trim(),
      position: u.position,
      employmentType: u.employmentType || "FULL_TIME",
      specialization: u.specialization || "",
      employmentStatus: "ACTIVE",
      password: temporaryPassword, // hashed by the pre-save hook
      mustChangePassword: true,
      assignedSubjects: [],
    });
    rows.push([u.facultyId, u.name, u.email, u.position, temporaryPassword]);
    console.log(`+ created ${u.facultyId}  ${u.name}  (${u.position})`);
    created++;
  }

  if (created > 0) {
    const csvPath = path.resolve("temp-passwords.csv");
    fs.writeFileSync(csvPath, rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n") + "\n");
    console.log(`\nTemporary passwords saved to ${csvPath}`);
    console.log("Give each person their password privately, then delete that file.");
  }
  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Failed:", err.message);
  process.exit(1);
});