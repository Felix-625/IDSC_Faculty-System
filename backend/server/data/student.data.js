// MOCK DATA standing in for the Registrar's records.
const students = [
  // BSIT Students
  { studentId: "202610897", name: "Juan Santos",     program: "BSIT", yearLevel: 3, section: "BSIT-3A" },
  { studentId: "202610898", name: "Ana Reyes",       program: "BSIT", yearLevel: 3, section: "BSIT-3A" },
  { studentId: "202610899", name: "Mark Villanueva", program: "BSIT", yearLevel: 3, section: "BSIT-3A" },
  { studentId: "202610900", name: "Liza Mendoza",    program: "BSIT", yearLevel: 3, section: "BSIT-3A" },
  { studentId: "202610911", name: "Paolo Garcia",    program: "BSIT", yearLevel: 3, section: "BSIT-3B" },
  { studentId: "202610912", name: "Bea Alonzo",      program: "BSIT", yearLevel: 1, section: "BSIT-1A" },
  { studentId: "202610913", name: "Carlos Yulo",     program: "BSIT", yearLevel: 1, section: "BSIT-1A" },
  { studentId: "202610914", name: "Danica Sotto",    program: "BSIT", yearLevel: 1, section: null },
  { studentId: "202610915", name: "Edward Barber",   program: "BSIT", yearLevel: 1, section: null },
  { studentId: "202610916", name: "Francine Diaz",   program: "BSIT", yearLevel: 2, section: null },

  // BSBA Students
  { studentId: "202620101", name: "Gabriel Mercado", program: "BSBA", yearLevel: 1, section: "BSBA-1A" },
  { studentId: "202620102", name: "Hannah Montana",  program: "BSBA", yearLevel: 1, section: "BSBA-1A" },
  { studentId: "202620103", name: "Ian Veneracion",  program: "BSBA", yearLevel: 1, section: null },
  { studentId: "202620104", name: "Julia Barretto",  program: "BSBA", yearLevel: 2, section: null },
  { studentId: "202620105", name: "Kyle Echarri",    program: "BSBA", yearLevel: 3, section: null },

  // BSHM Students
  { studentId: "202630101", name: "Lorraine Cutie",  program: "BSHM", yearLevel: 1, section: "BSHM-1A" },
  { studentId: "202630102", name: "Michael V.",      program: "BSHM", yearLevel: 1, section: "BSHM-1A" },
  { studentId: "202630103", name: "Nadine Lustre",   program: "BSHM", yearLevel: 1, section: null },
  { studentId: "202630104", name: "Ogie Alcasid",    program: "BSHM", yearLevel: 2, section: null },

  // BSED Students
  { studentId: "202640101", name: "Patricia Tumulak",program: "BSED", yearLevel: 1, section: "BSED-1A" },
  { studentId: "202640102", name: "Quentin Ramirez", program: "BSED", yearLevel: 1, section: "BSED-1A" },
  { studentId: "202640103", name: "Regine Velasquez",program: "BSED", yearLevel: 1, section: null },
  { studentId: "202640104", name: "Seth Fedelin",    program: "BSED", yearLevel: 3, section: null },

  // BSCRIM Students
  { studentId: "202650101", name: "Tito Sotto",      program: "BSCRIM", yearLevel: 1, section: "BSCRIM-1A" },
  { studentId: "202650102", name: "Vic Sotto",       program: "BSCRIM", yearLevel: 1, section: "BSCRIM-1A" },
  { studentId: "202650103", name: "Joey De Leon",    program: "BSCRIM", yearLevel: 1, section: null },
  { studentId: "202650104", name: "Wally Bayola",    program: "BSCRIM", yearLevel: 2, section: null },
  { studentId: "202650105", name: "Jose Manalo",     program: "BSCRIM", yearLevel: 3, section: null }
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
