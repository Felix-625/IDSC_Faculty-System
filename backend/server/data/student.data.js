// MOCK DATA standing in for the Registrar's records.
const students = [
  { studentId: "202610897", name: "Juan Santos",     program: "BSIT", yearLevel: 3, section: "BSIT-3A" },
  { studentId: "202610898", name: "Ana Reyes",       program: "BSIT", yearLevel: 3, section: "BSIT-3A" },
  { studentId: "202610899", name: "Mark Villanueva", program: "BSIT", yearLevel: 3, section: "BSIT-3A" },
  { studentId: "202610900", name: "Liza Mendoza",    program: "BSIT", yearLevel: 3, section: "BSIT-3A" },
  { studentId: "202610911", name: "Paolo Garcia",    program: "BSIT", yearLevel: 3, section: "BSIT-3B" }
];

const TERM = { semester: "1st Semester", academicYear: "2026-2027" };

const enrollments = [
  { studentId: "202610897", courseCode: "IT303", section: "BSIT-3A", ...TERM, enrollmentStatus: "ENROLLED" },
  { studentId: "202610898", courseCode: "IT303", section: "BSIT-3A", ...TERM, enrollmentStatus: "ENROLLED" },
  { studentId: "202610899", courseCode: "IT303", section: "BSIT-3A", ...TERM, enrollmentStatus: "ENROLLED" },
  { studentId: "202610900", courseCode: "IT303", section: "BSIT-3A", ...TERM, enrollmentStatus: "DROPPED" },
  { studentId: "202610897", courseCode: "IT304", section: "BSIT-3A", ...TERM, enrollmentStatus: "ENROLLED" },
  { studentId: "202610898", courseCode: "IT304", section: "BSIT-3A", ...TERM, enrollmentStatus: "ENROLLED" },
  { studentId: "202610900", courseCode: "IT304", section: "BSIT-3A", ...TERM, enrollmentStatus: "ENROLLED" },
  { studentId: "202610911", courseCode: "IT304", section: "BSIT-3B", ...TERM, enrollmentStatus: "ENROLLED" }
];

module.exports = { students, enrollments };