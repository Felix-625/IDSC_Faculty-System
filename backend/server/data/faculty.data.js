const faculty = [
  {
    facultyId: "FAC-2026-001",
    name: "Maria Dela Cruz",
    email: "maria.delacruz@university.edu",
    department: "Information Technology",
    position: "DEAN",
    employmentType: "FULL_TIME",
    specialization: "Web Development",
    employmentStatus: "ACTIVE",
    assignedSubjects: [
      {
        assignmentId: "ASG-001",
        facultyId: "FAC-2026-001",
        courseCode: "IT303",
        courseName: "Integrative Programming 2",
        units: 3,
        section: "BSIT-3A",
        semester: "1st Semester",
        academicYear: "2026-2027",
        assignmentStatus: "ASSIGNED",
        assignedAt: "2026-09-05T09:00:00Z"
      }
    ],
    updatedAt: "2026-09-05T10:30:00Z"
  },
  {
    facultyId: "FAC-2026-002",
    name: "Juan Reyes",
    email: "juan.reyes@university.edu",
    department: "Information Technology",
    position: "FACULTY",
    employmentType: "FULL_TIME",
    specialization: "Database Systems",
    employmentStatus: "ACTIVE",
    assignedSubjects: [],
    updatedAt: "2026-09-05T10:30:00Z"
  }
];

module.exports = faculty;