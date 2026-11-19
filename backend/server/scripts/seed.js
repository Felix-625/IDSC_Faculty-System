require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const {
  User,
  Course,
  Student,
  Section,
  Schedule,
  Announcement,
} = require("../models");

const facultyData = require("../data/faculty.data");
const courseData = require("../data/course.data");
const { students: studentData } = require("../data/student.data");
const scheduleData = require("../data/schedule.data");
const announcementData = require("../data/announcement.data");

const initialSections = [
  { sectionId: "SEC-001", sectionName: "BSIT-1A", program: "BSIT", department: "Information Technology", yearLevel: 1, maxCapacity: 45, studentIds: ["202610912", "202610913"] },
  { sectionId: "SEC-002", sectionName: "BSIT-3A", program: "BSIT", department: "Information Technology", yearLevel: 3, maxCapacity: 45, studentIds: ["202610897", "202610898", "202610899", "202610900"] },
  { sectionId: "SEC-003", sectionName: "BSIT-3B", program: "BSIT", department: "Information Technology", yearLevel: 3, maxCapacity: 45, studentIds: [] },
  { sectionId: "SEC-004", sectionName: "BSBA-1A", program: "BSBA", department: "Business Administration", yearLevel: 1, maxCapacity: 45, studentIds: ["202620101", "202620102"] },
  { sectionId: "SEC-005", sectionName: "BSHM-1A", program: "BSHM", department: "Hospitality & Tourism Management", yearLevel: 1, maxCapacity: 45, studentIds: ["202630101", "202630102"] },
  { sectionId: "SEC-006", sectionName: "BSED-1A", program: "BSED", department: "Teacher Education", yearLevel: 1, maxCapacity: 45, studentIds: ["202640101", "202640102"] },
  { sectionId: "SEC-007", sectionName: "BSCRIM-1A", program: "BSCRIM", department: "Criminology", yearLevel: 1, maxCapacity: 45, studentIds: ["202650101", "202650102"] },
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ ERROR: MONGODB_URI is not set in your .env file.");
    console.error("Please add MONGODB_URI=mongodb+srv://... to your backend/server/.env file.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");

    console.log("\nClearing old database records...");
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Student.deleteMany({}),
      Section.deleteMany({}),
      Schedule.deleteMany({}),
      Announcement.deleteMany({}),
    ]);

    const defaultHashedPassword = await bcrypt.hash("Password123!", 10);

    console.log("Seeding Users & Faculty (AVP, 5 Deans, Faculty)...");
    const usersToInsert = facultyData.map(f => ({
      facultyId: f.facultyId,
      name: f.name,
      email: f.email,
      password: defaultHashedPassword,
      department: f.department,
      position: f.position,
      employmentType: f.employmentType || "FULL_TIME",
      specialization: f.specialization || "",
      employmentStatus: f.employmentStatus || "ACTIVE",
      assignedSubjects: f.assignedSubjects || [],
    }));
    await User.insertMany(usersToInsert);

    console.log("Seeding Courses across all departments...");
    await Course.insertMany(courseData);

    console.log("Seeding Students...");
    const studentsToInsert = studentData.map(s => ({
      studentId: s.studentId,
      name: s.name,
      email: `${s.studentId}@student.idsc.edu`,
      program: s.program,
      department: s.program === "BSIT" ? "Information Technology"
        : s.program === "BSBA" ? "Business Administration"
        : s.program === "BSHM" ? "Hospitality & Tourism Management"
        : s.program === "BSED" ? "Teacher Education"
        : s.program === "BSCRIM" ? "Criminology"
        : "General Education",
      yearLevel: s.yearLevel,
      section: s.section,
      status: "ENROLLED",
    }));
    await Student.insertMany(studentsToInsert);

    console.log("Seeding Sections...");
    await Section.insertMany(initialSections);

    console.log("Seeding Schedules...");
    await Schedule.insertMany(scheduleData);

    console.log("Seeding Announcements...");
    await Announcement.insertMany(announcementData);

    console.log("\n==================================================");
    console.log("🎉 Database seeding completed successfully!");
    console.log("==================================================");
    console.log(`- Users / Faculty : ${usersToInsert.length} accounts created`);
    console.log(`- Courses         : ${courseData.length} courses loaded`);
    console.log(`- Students        : ${studentsToInsert.length} students loaded`);
    console.log(`- Sections        : ${initialSections.length} sections loaded`);
    console.log(`- Schedules       : ${scheduleData.length} schedules loaded`);
    console.log(`- Announcements   : ${announcementData.length} announcements loaded`);
    console.log("Default password for all accounts: Password123!");
    console.log("==================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    process.exit(1);
  }
}

seedDatabase();
